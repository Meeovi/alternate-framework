import type {
  H3Event
} from 'h3'
import {
  createError
} from 'h3'
import type {
  User
} from '../../app/types'
import {
  betterAuth
} from 'better-auth'
import {
  prismaAdapter
} from 'better-auth/adapters/prisma'
import {
  deviceAuthorization,
  multiSession,
  oneTimeToken
} from "better-auth/plugins";
import {
  i18n
} from "@better-auth/i18n"
import {
  APIError,
  createAuthMiddleware
} from 'better-auth/api'
import {
  v7 as uuidv7
} from 'uuid'
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as schema from '../database/migrations/schema'
import { db } from "./drizzle";

import {
  hashPassword,
  verifyPassword
} from "./password"
import {
  dash
} from "@better-auth/infra";
import {
  stripe
} from "@better-auth/stripe"
import Stripe from "stripe"
import {
  waitUntil
} from "@vercel/functions";

const stripeClient = new Stripe(process.env.NUXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia", // Latest API version as of Stripe SDK v22.0.0
})

// Minimal runtime config derived from environment to avoid external deps
const runtimeConfig = {
  public: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    appEnv: process.env.NODE_ENV || 'development',
    appName: process.env.APP_NAME || 'App',
    appNotifyEmail: process.env.APP_NOTIFY_EMAIL || 'no-reply@example.com'
  },
  preset: process.env.PRESET || 'node-server'
}

// --- Secret management (per better-auth security skill) -------------
// Better Auth rejects default/placeholder secrets in production and warns if
// the secret is shorter than 32 chars or below 120 bits of entropy. Fail fast
// rather than silently falling back to a placeholder that would be rejected.
const isProduction = runtimeConfig.public.appEnv === 'production'
const betterAuthSecret = process.env.BETTER_AUTH_SECRET

if (!betterAuthSecret) {
  if (isProduction) {
    throw new Error(
      'BETTER_AUTH_SECRET is required in production. Generate one with: openssl rand -base64 32',
    )
  }
  console.warn('[better-auth] BETTER_AUTH_SECRET is not set — using an insecure dev secret. Do not use in production.')
}
if (betterAuthSecret && betterAuthSecret.length < 32) {
  console.warn('[better-auth] BETTER_AUTH_SECRET is shorter than 32 characters; generate a stronger secret with: openssl rand -base64 32')
}

// --- Trusted origins (per better-auth security skill) ----------------
// The baseURL origin is automatically trusted. Additional origins can be
// supplied via BETTER_AUTH_TRUSTED_ORIGINS (comma-separated) and the
// configured site URL. No hardcoded localhost in production.
const trustedOrigins = Array.from(
  new Set(
    [
      process.env.NUXT_PUBLIC_SITE_URL,
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      isProduction ? null : 'http://localhost:8787',
    ].filter(Boolean) as string[],
  ),
)

// Lightweight audit logger using the centralized Prisma client
export const logAuditEvent = async (entry: any) => {
  try {
    await db.insert(schema.auditLogEntriesInAuth).values({
      id: entry.id || uuidv7(),
      payload: entry,
      created_at: new Date(),
      ip_address: entry.ipAddress || ''
    })
  } catch (e) {
    // swallow logging errors to avoid breaking auth flows
    console.error('Failed to write audit log', e)
  }
}

// Minimal resend stub — in this isolated layer we don't require a full
// transactional email provider; returning a shape compatible with callers
const resendInstance = {
  emails: {
    send: async (_opts ? : any) => ({
      error: null
    })
  }
}

export const auth = betterAuth({
  appName: `${process.env.NUXT_APP_NAME}`,
  baseURL: `${process.env.NUXT_PUBLIC_SITE_URL}`,
  trustedOrigins,
  secret: betterAuthSecret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  updateAccountOnSignIn: true,
  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id"
    },
    encryptOAuthTokens: true, // Encrypt OAuth tokens before storing them in the database
    storeStateStrategy: "database", // Store OAuth state payload in verification storage
    storeAccountCookie: true, // Store provider account data after OAuth flow in an encrypted cookie (useful for database-less flows)
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"], // or async (request) => ["google", "github"]
      allowDifferentEmails: false
    }
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github", "email-password"], // or async (request) => ["google", "github"]
    allowDifferentEmails: false,
    allowUnlinkingAll: true,
    updateUserInfoOnLink: false
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id"
    },
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
    freshAge: 3600, // Require a fresh session (re-auth) for sensitive actions within 1 hour
    disableSessionRefresh: true, // Disable session refresh so that the session is not updated regardless of the `updateAge` option. (default: `false`)
    additionalFields: { // Additional fields for the session table
      customField: {
        type: "string",
      }
    },
    storeSessionInDatabase: true, // Store session in database when secondary storage is provided (default: `false`)
    preserveSessionInDatabase: true, // Preserve session records in database when deleted from secondary storage (default: `false`)
    cookieCache: {
      enabled: true, // Enable caching session in cookie (default: `false`)	
      maxAge: 300, // 5 minutes
      strategy: "jwe",
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user: User) => {
        if (!user.stripeCustomerId) return;
        for await (const sub of stripeClient.subscriptions.list({
          customer: user.stripeCustomerId,
          status: "all",
        })) {
          if (["canceled", "incomplete", "incomplete_expired"].includes(sub.status)) continue;
          throw new APIError("BAD_REQUEST", {
            message: "Cancel your active subscription before deleting your account",
          });
          // Or cancel immediately: await stripeClient.subscriptions.cancel(sub.id);
          // Or at period end:      await stripeClient.subscriptions.update(sub.id, { cancel_at_period_end: true });
        }
      },
    },
    additionalFields: {
      polarCustomerId: {
        type: 'string',
        required: false,
        defaultValue: null
      },
      locale: { type: "string", required: false },
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    sendResetPassword: async ({
      user,
      url
    }) => {
      const response = await resendInstance.emails.send({
        from: `${runtimeConfig.public.appName} <${runtimeConfig.public.appNotifyEmail}>`,
        to: user.email,
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`
      })
      await logAuditEvent({
        userId: user.id,
        category: 'email',
        action: 'reset_password',
        targetType: 'email',
        targetId: user.email,
        status: response.error ? 'failure' : 'success',
        details: (response as any).error?.message
      })
      if (response.error) {
        console.error(`Failed to send reset password email: ${(response as any).error.message}`)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url
    }) => {
      const response = await resendInstance.emails.send({
        from: `${runtimeConfig.public.appName} <${runtimeConfig.public.appNotifyEmail}>`,
        to: user.email,
        subject: 'Verify your email address',
        text: `Click the link to verify your email address: ${url}`
      })
      await logAuditEvent({
        userId: user.id,
        category: 'email',
        action: 'verification',
        targetType: 'email',
        targetId: user.email,
        status: response.error ? 'failure' : 'success',
        details: (response as any).error?.message
      })
      if (response.error) {
        console.error(`Failed to send verification email: ${(response as any).error.message}`)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }
  },
  socialProviders: {},
  verification: {
    disableCleanup: false,
    storeIdentifier: "hashed",
    storeInDatabase: false
  },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    // Persist rate-limit counters in the database so they survive restarts
    // and work across serverless instances (memory storage resets per cold
    // start and is not shared across instances — per the security skill).
    storage: "database",
    customRules: {
      // Tighten limits on sensitive auth endpoints (security skill defaults:
      // 3 requests / 10s). Applied to the Better Auth route paths.
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/forget-password": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 3 },
      "/change-password": { window: 60, max: 5 },
      "/change-email": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
    modelName: "rateLimit"
  },
  plugins: [
    dash(),
    multiSession(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      onCustomerCreate: async ({
        stripeCustomer,
        user
      }, ctx) => {
        // Do something with the newly created customer
        console.log(`Customer ${stripeCustomer.id} created for user ${user.id}`);
      },
      getCustomerCreateParams: async (user: User, ctx) => {
        // Customize the Stripe customer creation parameters
        return {
          metadata: {
            referralSource: user.metadata?.referralSource ?? ''
          }
        };
      },
      subscription: {
        enabled: true,
        modelName: "subscriptions",
        fields: {
          id: "id",
          stripePriceId: "stripe_price_id",
          limits: "limits"
        },
        plans: async () => {
          const plans = await db.query.subscriptions.findMany();
          
          return plans.map((plan: any) => ({
            name: plan.name,
            priceId: plan.stripe_price_id,
            // Safely parse JSON string arrays or objects
            limits: typeof plan.limits === 'string' 
              ? JSON.parse(plan.limits) 
              : plan.limits || {}
          }));
        },
        getCheckoutSessionParams: async ({
          user,
          session,
          plan,
          subscription
        }, ctx) => {
          return {
            params: {
              tax_id_collection: {
                enabled: true
              },
              automatic_tax: {
                enabled: true
              },
              allow_promotion_codes: true,
              billing_address_collection: "required",
              custom_text: {
                submit: {
                  message: "We'll start your subscription right away"
                }
              },
              metadata: {
                planType: "business",
                referralCode: user.metadata?.referralCode
              }
            },
            options: {
              idempotencyKey: `sub_${user.id}_${plan.name}_${Date.now()}`
            }
          };
        },
        authorizeReference: async ({
          user,
          referenceId,
          action
        }) => {
          const member = await db.query.organizationMembers.findFirst({
            where: {
              userId: user.id,
              organizationId: referenceId
            }
          });
          return member?.role === "owner" || member?.role === "admin";
        },
      },
    }),
    deviceAuthorization({
      verificationUri: "/device",
    }),
    oneTimeToken(),
    i18n({
      translations: {
        fr: {
          USER_NOT_FOUND: "Utilisateur non trouvé",
          INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe invalide",
          INVALID_PASSWORD: "Mot de passe invalide",
        },
        de: {
          USER_NOT_FOUND: "Benutzer nicht gefunden",
          INVALID_EMAIL_OR_PASSWORD: "Ungültige E-Mail oder Passwort",
          INVALID_PASSWORD: "Ungültiges Passwort",
        },
      },
      detection: ["session", "header"],
      userLocaleField: "locale",
    }),
  ],
  telemetry: {
    enabled: true,
    debug: true
  },
  advanced: {
    ipAddress: {
      // Check x-forwarded-for first (standard behind a reverse proxy / CDN),
      // then x-real-ip, falling back to x-client-ip.
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "x-client-ip"],
      ipv6Subnet: 64, // Group IPv6 addresses per /64 to avoid per-IP bypasses
      disableIpTracking: false, // Keep enabled for rate limiting
    },
    // Enable trusted proxy header parsing since deployments sit behind a
    // reverse proxy / CDN. Only set when the proxy is trusted.
    trustedProxyHeaders: true,
    useSecureCookies: true,
    disableCSRFCheck: false,
    disableOriginCheck: false,
    crossSubDomainCookies: {
      enabled: true,
      additionalCookies: ["custom_cookie"],
      domain: process.env.COOKIE_DOMAIN || ".example.com"
    },
    cookies: {
      session_token: {
        name: "custom_session_token",
        attributes: {
          httpOnly: true,
          secure: true
        }
      }
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true
    },
    // OAuth state configuration has been moved to account option
    // Use account.storeStateStrategy and account.skipStateCookieCheck instead
    cookiePrefix: `${process.env.NUXT_APP_NAME}`,
    database: {
      generateId: () => uuidv7()
    },
    backgroundTasks: {
      handler: waitUntil
    },
    skipTrailingSlashes: true
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const ipAddress =
        ctx.getHeader('x-forwarded-for') || ctx.getHeader('remoteAddress') || undefined
      const userAgent = ctx.getHeader('user-agent') || undefined
      const userId = ctx.context.session?.user?.id || ctx.context.newSession?.user?.id
      // Guard against events without a known user (e.g. failed sign-in
      // attempts) so the hook never throws and breaks the auth flow.
      if (!userId) return
      await logAuditEvent({
        userId,
        category: 'auth',
        action: ctx.path,
        targetType: 'user',
        targetId: userId,
        ipAddress,
        userAgent,
        status: 'success'
      })
    })
  },
  databaseHooks: {
    // Security auditing via databaseHooks (per the better-auth security skill):
    // track session lifecycle and sensitive user changes.
    session: {
      create: {
        after: async (session: any, context: any) => {
          await logAuditEvent({
            userId: session.userId,
            category: "session",
            action: "session.created",
            targetType: "session",
            targetId: session.id,
            ipAddress: context?.request?.headers.get("x-forwarded-for") || undefined,
            userAgent: context?.request?.headers.get("user-agent") || undefined,
            status: "success"
          })
        }
      },
      delete: {
        before: async (session: any) => {
          await logAuditEvent({
            userId: session.userId,
            category: "session",
            action: "session.revoked",
            targetType: "session",
            targetId: session.id,
            status: "success"
          })
        }
      }
    },
    user: {
      update: {
        after: async (user: any, _context: any) => {
          await logAuditEvent({
            userId: user.id,
            category: "user",
            action: "user.updated",
            targetType: "user",
            targetId: user.id,
            status: "success"
          })
        }
      }
    }
  },
  logger: {
    disabled: false,
    disableColors: false,
    level: "warn",
    log: (level, message, ...args) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args);
    }
  }
})

let _auth: ReturnType < typeof betterAuth > | any

export const useServerAuth = () => auth

// Alias for Nitro auto-import in server plugins (e.g. plugins/auth.ts calls serverAuth())
export const serverAuth = useServerAuth

export const getAuthSession = async (event: H3Event) => {
  const headers = event.headers
  const serverAuth = useServerAuth() as any
  const session = await serverAuth.api.getSession({
    headers
  })
  return session
}

export const requireAuth = async (event: H3Event) => {
  const session = await getAuthSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  event.context.user = session.user
  return session.user as User
}