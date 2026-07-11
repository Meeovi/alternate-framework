import type {
  H3Event
} from 'h3'
import {
  createError
} from 'h3'
type User = any
import {
  betterAuth
} from 'better-auth'
import {
  prismaAdapter
} from 'better-auth/adapters/prisma'
import {
  APIError,
  createAuthMiddleware
} from 'better-auth/api'
import {
  admin
} from 'better-auth/plugins'
import {
  v7 as uuidv7
} from 'uuid'
import {
  prisma
} from '@mframework/adapter-prisma'
import {
  hashPassword,
  verifyPassword
} from "./password"
import {
  dash
} from "@better-auth/infra";

// Minimal runtime config derived from environment to avoid external deps
const runtimeConfig = {
  public: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    appEnv: process.env.NODE_ENV || 'development',
    appName: process.env.APP_NAME || 'App',
    appNotifyEmail: process.env.APP_NOTIFY_EMAIL || 'no-reply@example.com'
  },
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'secret',
  preset: process.env.PRESET || 'node-server'
}

// Lightweight audit logger using the centralized Prisma client
export const logAuditEvent = async (entry: any) => {
  try {
    await prisma.audit_log_entries.create({
      data: {
        id: entry.id || uuidv7(),
        payload: entry,
        created_at: new Date(),
        ip_address: entry.ipAddress || ''
      }as any
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
  trustedOrigins: ['http://localhost:8787', `${process.env.NUXT_PUBLIC_SITE_URL}`],
  secret: runtimeConfig.betterAuthSecret,
  database: prismaAdapter(prisma as any, {
    provider: 'postgresql'
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
      refreshCache: {
        updateAge: 60 // Refresh when 60 seconds remain before expiry
      }
    },
  },
  user: {
    additionalFields: {
      polarCustomerId: {
        type: 'string',
        required: false,
        defaultValue: null
      }
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
    customRules: {
      "/example/path": {
        window: 10,
        max: 100
      }
    },
    storage: "memory",
    modelName: "rateLimit"
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const ipAddress = ctx.getHeader('x-forwarded-for') || ctx.getHeader('remoteAddress') || undefined
      const userAgent = ctx.getHeader('user-agent') || undefined
      // Reduced auditing: log basic auth events
      await logAuditEvent({
        userId: ctx.context.session?.user.id || ctx.context.newSession?.user.id,
        category: 'auth',
        action: ctx.path,
        targetType: 'user',
        targetId: ctx.context.session?.user?.id || ctx.context.newSession?.user?.id,
        ipAddress,
        userAgent,
        status: 'success'
      })
    })
  },
  plugins: [admin(), dash()],
  telemetry: {
    enable: true,
    debug: true
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-real-ip"],
      disableIpTracking: false
    },
    useSecureCookies: true,
    disableCSRFCheck: false,
    disableOriginCheck: false,
    crossSubDomainCookies: {
      enabled: true,
      additionalCookies: ["custom_cookie"],
      domain: "example.com"
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
    cookiePrefix: "myapp",
    database: {
      generateId: () => uuidv7()
    },
    backgroundTasks: {
      handler: (promise) => {
        /* e.g. waitUntil(promise) */ }
    },
    skipTrailingSlashes: true
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