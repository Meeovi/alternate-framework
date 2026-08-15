import { db } from './drizzle';
import * as schema from '../database/migrations/schema';
import { v7 as uuidv7 } from 'uuid';
import { createAuthMiddleware } from 'better-auth/api';
import { stripeClient } from './stripe';
import { CommerceCustomerLinkRegistry } from 'alternate-sdk';
import { eq } from 'drizzle-orm';

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
    create: {
      after: async (user: any, _context: any) => {
        await logAuditEvent({
            userId: user.id,
            category: "user",
            action: "user.created",
            targetType: "user",
            targetId: user.id,
            status: "success",
            id: ''
        })
        // Give any registered commerce backend (e.g. adapter-magento) a
        // chance to create/link its own customer record for this user —
        // this layer never imports a specific adapter, it only ever calls
        // through the generic registry contract.
        for (const linker of CommerceCustomerLinkRegistry.getAll()) {
          if (!linker.isEnabled()) continue
          try {
            const result = await linker.onUserCreated({ id: user.id, email: user.email, name: user.name })
            if (result?.externalCustomerId) {
              // magentoCustomerId's live column is bigint (mirrors Magento's
              // own numeric customer entity_id) — coerce when the id is
              // numeric; a future string-id backend's column would just
              // keep the raw string.
              const numericId = Number(result.externalCustomerId)
              const value = Number.isFinite(numericId) ? numericId : result.externalCustomerId
              await (db as any).update(schema.users)
                .set({ [`${linker.id}CustomerId`]: value })
                .where(eq(schema.users.id, user.id))
            }
          } catch (e) {
            // Never break signup because a commerce backend is unreachable.
            console.error(`[commerce-customer-link] "${linker.id}" failed for user ${user.id}`, e)
          }
        }
      }
    },
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
