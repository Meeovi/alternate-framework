import type { H3Event } from 'h3'
import { createError } from 'h3'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { createAuthMiddleware } from 'better-auth/api'
import { admin } from 'better-auth/plugins'
import { v7 as uuidv7 } from 'uuid'
import { prisma } from 'alternate-gateway/core'

type User = any

const runtimeConfig = {
  public: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    appName: process.env.APP_NAME || 'App',
    appNotifyEmail: process.env.APP_NOTIFY_EMAIL || 'no-reply@example.com',
  },
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'secret',
}

export const logAuditEvent = async (entry: any) => {
  try {
    await prisma.audit_log_entries.create({
      data: {
        id: entry.id || uuidv7(),
        payload: entry,
        created_at: new Date(),
        ip_address: entry.ipAddress || '',
      } as any,
    })
  } catch (error) {
    console.error('Failed to write audit log', error)
  }
}

const resendInstance = {
  emails: {
    send: async (_opts?: any) => ({ error: null }),
  },
}

export const createBetterAuth = () =>
  betterAuth({
    baseURL: runtimeConfig.public.baseURL,
    trustedOrigins: ['http://localhost:8787', runtimeConfig.public.baseURL],
    secret: runtimeConfig.betterAuthSecret,
    database: prismaAdapter(prisma as any, { provider: 'postgresql' }),
    advanced: {
      database: {
        generateId: () => uuidv7(),
      },
    },
    user: {
      additionalFields: {
        polarCustomerId: {
          type: 'string',
          required: false,
          defaultValue: null,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        const response = await resendInstance.emails.send({
          from: `${runtimeConfig.public.appName} <${runtimeConfig.public.appNotifyEmail}>`,
          to: user.email,
          subject: 'Reset your password',
          text: `Click the link to reset your password: ${url}`,
        })

        await logAuditEvent({
          userId: user.id,
          category: 'email',
          action: 'reset_password',
          targetType: 'email',
          targetId: user.email,
          status: response.error ? 'failure' : 'success',
          details: (response as any).error?.message,
        })

        if (response.error) {
          throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
        }
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const response = await resendInstance.emails.send({
          from: `${runtimeConfig.public.appName} <${runtimeConfig.public.appNotifyEmail}>`,
          to: user.email,
          subject: 'Verify your email address',
          text: `Click the link to verify your email address: ${url}`,
        })

        await logAuditEvent({
          userId: user.id,
          category: 'email',
          action: 'verification',
          targetType: 'email',
          targetId: user.email,
          status: response.error ? 'failure' : 'success',
          details: (response as any).error?.message,
        })

        if (response.error) {
          throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
        }
      },
    },
    socialProviders: {},
    account: {
      accountLinking: { enabled: true },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        const ipAddress =
          ctx.getHeader('x-forwarded-for') || ctx.getHeader('remoteAddress') || undefined
        const userAgent = ctx.getHeader('user-agent') || undefined

        await logAuditEvent({
          userId: ctx.context.session?.user.id || ctx.context.newSession?.user.id,
          category: 'auth',
          action: ctx.path,
          targetType: 'user',
          targetId: ctx.context.session?.user?.id || ctx.context.newSession?.user?.id,
          ipAddress,
          userAgent,
          status: 'success',
        })
      }),
    },
    plugins: [admin()],
  })

let _auth: ReturnType<typeof createBetterAuth> | undefined

export const auth = (() => {
  if (!_auth) _auth = createBetterAuth()
  return _auth
})()

export const useServerAuth = () => auth
export const serverAuth = useServerAuth

export const getAuthSession = async (event: H3Event) => {
  const headers = event.headers
  const serverAuthInstance = useServerAuth()
  const session = await serverAuthInstance.api.getSession({ headers })
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
