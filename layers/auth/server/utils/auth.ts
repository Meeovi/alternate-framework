import type { H3Event } from 'h3'
import { createError } from 'h3'
type User = any
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { admin } from 'better-auth/plugins'
import { v7 as uuidv7 } from 'uuid'
import { prisma } from '@mframework/core'

// Ensure app-level utils register (side-effects: providers, plugins, hooks)
import '../plugins/providers'
import '../plugins/deviceAuthorization'
import '../plugins/jwt'
import '../plugins/scim'
import '../plugins/sso'
import '../plugins/tokens'
import '../plugins/mcp'
import '../plugins/magicLink'
import '../plugins/passkey'
import '../plugins/apiKey'
import '../plugins/phoneNumber'
import '../plugins/otp'
import '../plugins/username'
import '../plugins/anonymous'
import '../plugins/multiSession'
import '../plugins/lastLogin'
import '../plugins/organization'
import '../plugins/captcha'
import '../plugins/oAuth'
import '../plugins/permissions'
import '../plugins/pwned'
import '../plugins/openApi'
import '../plugins/bearer'
import '../plugins/oneTap'
import '../plugins/admin'
import '../plugins/ethereum'
import '../plugins/twoFactor'

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
    await prisma.audit_log_entries.create({ data: {
      id: entry.id || uuidv7(),
      payload: entry,
      created_at: new Date(),
      ip_address: entry.ipAddress || ''
    } as any })
  } catch (e) {
    // swallow logging errors to avoid breaking auth flows
    console.error('Failed to write audit log', e)
  }
}

// Minimal resend stub — in this isolated layer we don't require a full
// transactional email provider; returning a shape compatible with callers
const resendInstance = {
  emails: {
    send: async (_opts?: any) => ({ error: null })
  }
}

export const createBetterAuth = () => betterAuth({
  baseURL: runtimeConfig.public.baseURL,
  trustedOrigins: ['http://localhost:8787', runtimeConfig.public.baseURL],
  secret: runtimeConfig.betterAuthSecret,
  database: prismaAdapter(prisma as any, { provider: 'postgresql' }),
  advanced: {
    database: {
      generateId: () => uuidv7()
    }
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
  secondaryStorage: undefined as any,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
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
    sendVerificationEmail: async ({ user, url }) => {
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
  account: {
    accountLinking: { enabled: true }
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
  plugins: [ admin() ]
})

let _auth: ReturnType<typeof betterAuth> | undefined

// Allow creating the auth instance on demand
export const auth = (() => {
  if (!_auth) _auth = createBetterAuth()
  return _auth
})()

export const useServerAuth = () => auth

export const getAuthSession = async (event: H3Event) => {
  const headers = event.headers
  const serverAuth = useServerAuth()
  const session = await serverAuth.api.getSession({ headers })
  return session
}

export const requireAuth = async (event: H3Event) => {
  const session = await getAuthSession(event)
  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  event.context.user = session.user
  return session.user as User
}