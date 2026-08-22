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
  APIError
} from 'better-auth/api'
import {
  v7 as uuidv7
} from 'uuid'
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { sql } from "drizzle-orm"
import * as schema from '../database/migrations/schema'
import { db } from "./drizzle";
import {
  hashPassword,
  verifyPassword
} from "./password"
import {
  waitUntil
} from "@vercel/functions";
import { stripeClient } from "./stripe";

import {
  logAuditEvent,
  createAuthAuditMiddleware,
  auditDatabaseHooks
} from './audits'

import {
  getAuthSession,
  requireAuth
} from './sessions'

import { plugins } from '../../shared/utils/plugins'
import { sendAuthEmail } from '../../shared/utils/infrastructure/email'

const runtimeConfig = {
  public: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    appEnv: process.env.NODE_ENV || 'development',
    // NUXT_-prefixed: matches the real vars set in .env (APP_NAME/
    // APP_NOTIFY_EMAIL are never set there — this previously always fell
    // through to the hardcoded fallbacks below, regardless of config).
    appName: process.env.NUXT_APP_NAME || 'App',
    appNotifyEmail: process.env.NUXT_APP_NOTIFY_EMAIL || 'no-reply@example.com'
  },
  preset: process.env.PRESET || 'node-server'
}

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

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.NUXT_PUBLIC_SITE_URL,
      ...(process.env.NUXT_TRUSTED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      isProduction ? null : 'http://localhost:8787',
    ].filter(Boolean) as string[],
  ),
)

export const auth = betterAuth({
  appName: `${process.env.NUXT_APP_NAME}`,
  baseURL: `${process.env.NUXT_PUBLIC_SITE_URL}`,
  trustedOrigins,
  secret: betterAuthSecret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    // Every query logged verbatim, including rate-limit keys (raw IP
    // addresses) and other request data — fine for local debugging, a
    // real volume/PII concern left on in production.
    debugLogs: !isProduction
  }),
  updateAccountOnSignIn: true,
  account: {
    modelName: "accounts",
    fields: {
      accountId: "id"
    },
    encryptOAuthTokens: true,
    storeStateStrategy: "database",
    storeAccountCookie: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
      allowDifferentEmails: false
    }
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github", "email-password"],
    allowDifferentEmails: false,
    allowUnlinkingAll: true,
    updateUserInfoOnLink: false
  },
  session: {
    modelName: "publicSessions",
    expiresIn: 604800,
    // Sliding-window session: active users get extended (up to once per
    // updateAge) rather than always hitting a hard 7-day cutoff.
    // disableSessionRefresh: true previously made updateAge inert
    // (better-auth's own docs: "session is not updated regardless of the
    // updateAge option") — every session expired exactly 7 days after
    // login no matter how active the user was.
    updateAge: 86400,
    freshAge: 3600,
    additionalFields: {
      customField: {
        type: "string",
      }
    },
    storeSessionInDatabase: true,
    preserveSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 300,
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
        }
      },
    },
    additionalFields: {
      // Referenced by deleteUser.beforeDelete above and needed by the
      // stripe() plugin's createCustomerOnSignUp — was never actually
      // declared here, and the live users table has no matching column,
      // so Stripe customer creation on signup has likely never worked.
      // input: false on all three ids below — these are trust anchors for
      // billing-portal access and subscription-gated account deletion, and
      // must only ever be written server-side (webhook/registry hooks), never
      // accepted from a signup/update-user request body. Without input:
      // false, better-auth's default field parsing writes whatever value a
      // caller supplies, which previously let anyone set their own
      // stripeCustomerId to a victim's id and get that victim's Stripe
      // billing-portal link back.
      stripeCustomerId: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: false
      },
      polarCustomerId: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: false
      },
      // Generic, backend-agnostic anchor for a commerce backend's customer
      // record — populated by CommerceCustomerLinkRegistry hooks
      // (see server/utils/audits.ts). Never used for login; better-auth
      // remains the sole authentication system.
      magentoCustomerId: {
        type: 'number',
        required: false,
        defaultValue: null,
        input: false
      },
      locale: { type: "string", required: false },
    },
    modelName: "users"
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    sendResetPassword: async ({
      user,
      url
    }) => {
      const response = await sendAuthEmail({
        to: user.email,
        subject: 'Reset your password',
        html: `<p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p>`,
        text: `Click the link to reset your password: ${url}`
      })
      await logAuditEvent({
        userId: user.id,
        category: 'email',
        action: 'reset_password',
        targetType: 'email',
        targetId: user.email,
        status: response.error ? 'failure' : 'success',
        details: response.error ?? undefined,
        id: ''
      })
      if (response.error) {
        console.error(`Failed to send reset password email: ${response.error}`)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url
    }) => {
      const response = await sendAuthEmail({
        to: user.email,
        subject: 'Verify your email address',
        html: `<p>Click the link below to verify your email address:</p><p><a href="${url}">${url}</a></p>`,
        text: `Click the link to verify your email address: ${url}`
      })
      await logAuditEvent({
        userId: user.id,
        category: 'email',
        action: 'verification',
        targetType: 'email',
        targetId: user.email,
        status: response.error ? 'failure' : 'success',
        details: response.error ?? undefined,
        id: ''
      })
      if (response.error) {
        console.error(`Failed to send verification email: ${response.error}`)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET!,
      // https://developers.google.com/identity/openid-connect/openid-connect#scope-param
      scopes: ['openid', 'email', 'profile'],
    },
    github: {
      clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID!,
      clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET!,
    },
  },
  verification: {
    disableCleanup: false,
    storeIdentifier: "hashed",
    storeInDatabase: false
  },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/forget-password": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 3 },
      "/change-password": { window: 60, max: 5 },
      "/change-email": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  plugins,
  telemetry: {
    enabled: true,
    debug: !isProduction
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "x-client-ip"],
      ipv6Subnet: 64,
      disableIpTracking: false,
    },
    trustedProxyHeaders: true,
    useSecureCookies: isProduction,
    disableCSRFCheck: false,
    disableOriginCheck: false,
    crossSubDomainCookies: {
      enabled: false,
      additionalCookies: [],
      domain: ''
    },
    cookies: {
      session_token: {
        name: "custom_session_token",
        attributes: {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
        }
      }
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    },
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
    after: createAuthAuditMiddleware()
  },
  databaseHooks: auditDatabaseHooks,
  logger: {
    disabled: false,
    disableColors: false,
    level: "warn",
    log: (level, message, ...args) => {
      console.log(`[${level}] ${message}`, ...args);
    }
  }
})

if (!isProduction) {
  // Diagnostic: log effective auth config for session debugging.
  console.info('[better-auth][diag] baseURL:', process.env.NUXT_PUBLIC_SITE_URL, 'crossSubDomainCookies.enabled: false', 'cookie session_token name: custom_session_token')
}

let _auth: ReturnType < typeof betterAuth > | any

export const useServerAuth = () => auth

export const serverAuth = useServerAuth

