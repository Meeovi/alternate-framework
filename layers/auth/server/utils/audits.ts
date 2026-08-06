import { db } from './drizzle';
import * as schema from '../database/migrations/schema';
import { v7 as uuidv7 } from 'uuid';
import { createAuthMiddleware } from 'better-auth/api';
import { stripeClient } from './stripe';

export const logAuditEvent = async (entry: {
  userId?: string;
  id: string;
  category: string;
  action: string;
  targetType: string;
  targetId: string;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  details?: string;
}) => {
  try {
    await (db as any).insert(schema.auditLogEntriesInAuth).values({
      id: entry.id || uuidv7(),
      payload: entry,
      created_at: new Date(),
      ip_address: entry.ipAddress || ''
    } as any)
  } catch (e) {
    // swallow logging errors to avoid breaking auth flows
    console.error('Failed to write audit log', e)
  }
}

export const createAuthAuditMiddleware = () => createAuthMiddleware(async (ctx) => {
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
      status: 'success',
      id: ''
  })
})

export const auditDatabaseHooks = {
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
            status: "success",
            id: ''
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
            status: "success",
            id: ''
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
            status: "success",
            id: ''
        })
      }
    }
  }
}
