import { db } from './drizzle';
import * as schema from '../database/migrations/schema';
import { v7 as uuidv7 } from 'uuid';
import { createAuthMiddleware } from 'better-auth/api';
import { CommerceCustomerLinkRegistry } from 'alternate-sdk';
import { eq } from 'drizzle-orm';
import { decodeDataUrl, isAllowedAssetType, isPixanomyConfigured, uploadToPixanomy } from '#shared/server/utils/pixanomy';

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
    // Was writing created_at/ip_address (snake_case) against a schema
    // whose real Drizzle property names are createdAt/ipAddress — the
    // `as any` cast let this pass silently, and Drizzle just ignored both
    // unrecognized keys, so every audit log entry landed with a null
    // timestamp and empty IP regardless of what was actually passed in.
    await db.insert(schema.auditLogEntriesInAuth).values({
      id: entry.id || uuidv7(),
      payload: entry,
      createdAt: new Date(),
      ipAddress: entry.ipAddress || ''
    })
  } catch (e) {
    // swallow logging errors to avoid breaking auth flows
    console.error('Failed to write audit log', e)
  }
}

// Paths whose request body can carry a `rememberMe` flag (see
// node_modules/better-auth/dist/api/routes/sign-in.mjs /
// sign-up.mjs) — the only ones fixupRememberMeCookie needs to run on.
const REMEMBER_ME_PATHS = new Set(['/sign-in/email', '/sign-up/email'])

/**
 * better-auth's own `setSessionCookie` only ever *sets* the signed
 * `dont_remember` marker cookie when a sign-in opts out of "remember me"
 * (session.mjs / cookies/index.mjs: `if (dontRememberMe) await
 * ctx.setSignedCookie(...dontRememberToken...)`) — it never clears that
 * cookie on a *later* sign-in where the box **is** checked. Every
 * subsequent session refresh (GET /api/auth/get-session, on effectively
 * every page load) reads that leftover cookie back and treats the
 * session as "don't remember" regardless of what this sign-in actually
 * asked for — silently rewriting the persistent session cookie into a
 * browser-session-only one on the very next refresh, so a user who
 * checked "Remember Me" still gets logged out as soon as they close the
 * browser. (better-auth *does* clear this cookie on sign-out via
 * deleteSessionCookie — but only there, so it survives any sign-in that
 * doesn't immediately follow an explicit sign-out.)
 *
 * Run after every email sign-in/sign-up: whenever this request wasn't
 * itself an explicit "don't remember me" (`rememberMe: false`) and it
 * produced a session, clear any stale marker left over from an earlier
 * one. Clearing a cookie that was never set is a harmless no-op.
 */
export const fixupRememberMeCookie = async (ctx: any) => {
  if (!REMEMBER_ME_PATHS.has(ctx.path)) return
  if (ctx.body?.rememberMe === false) return
  if (!ctx.context?.newSession) return
  const cookie = ctx.context?.authCookies?.dontRememberToken
  if (!cookie?.name) return
  ctx.setCookie(cookie.name, '', { ...cookie.attributes, maxAge: 0 })
}

// Polled constantly by every page (route middleware, session refresh) —
// thousands of rows a day that drown the events that matter.
const AUDIT_SKIP = new Set(['/get-session', '/ok', '/jwks', '/token', '/list-sessions', '/error'])

// Where a FAILED attempt is itself a security event (password guessing,
// 2FA brute force, account probing) — recorded even without a signed-in
// user, keyed by the email/username that was tried.
const AUDIT_FAILURES = /^\/(sign-in|sign-up|two-factor\/verify|reset-password|request-password-reset|change-password|change-email|verify-email|email-otp|magic-link|passkey\/verify|admin\/)/

export const createAuthAuditMiddleware = () => createAuthMiddleware(async (ctx) => {
  if (AUDIT_SKIP.has(ctx.path)) return
  // Apache overwrites X-Forwarded-For with the real client IP (from
  // Cloudflare) — first entry only, in case of an un-proxied hop.
  const ipAddress = String(ctx.getHeader('x-forwarded-for') || ctx.getHeader('remoteAddress') || '').split(',')[0]!.trim() || undefined
  const userAgent = ctx.getHeader('user-agent')?.slice(0, 300) || undefined
  const userId = ctx.context.session?.user?.id || ctx.context.newSession?.user?.id
  // better-auth hands an after-hook the APIError as `returned` when the
  // endpoint failed.
  const returned = ctx.context.returned as { statusCode?: number, status?: string | number, body?: { code?: string, message?: string } } | undefined
  const failed = returned instanceof Error
  if (!userId && !(failed && AUDIT_FAILURES.test(ctx.path))) return

  const body = (ctx.body ?? {}) as { email?: unknown, username?: unknown }
  const attempted = String(body.email ?? body.username ?? '').toLowerCase().slice(0, 200)
  await logAuditEvent({
    userId,
    category: 'auth',
    action: ctx.path,
    targetType: userId ? 'user' : 'login',
    targetId: userId || attempted || 'unknown',
    ipAddress,
    userAgent,
    status: failed ? 'failure' : 'success',
    // Error code only (e.g. INVALID_EMAIL_OR_PASSWORD) — never the body.
    details: failed ? String(returned?.body?.code || returned?.status || returned?.statusCode || 'error') : undefined,
    id: '',
  })
})

const isDataUrl = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('data:')

/**
 * Move a base64 avatar into Pixanomy — the centralized asset store — and
 * return its public link. Never blocks the auth flow: on any failure the
 * image is dropped (null) rather than stored inline.
 */
const dataUrlAvatarToPixanomy = async (value: string, ownerId: string): Promise<string | null> => {
  const decoded = decodeDataUrl(value)
  if (!decoded || !decoded.contentType.startsWith('image/') || !isAllowedAssetType(decoded.contentType) || !isPixanomyConfigured()) {
    return null
  }
  try {
    const ext = decoded.contentType.split('/')[1]!.replace('jpeg', 'jpg')
    const asset = await uploadToPixanomy({
      data: decoded.data,
      filename: `avatar.${ext}`,
      contentType: decoded.contentType,
      ownerId,
      category: 'avatars',
    })
    return asset.url
  } catch (e) {
    console.error('[pixanomy] avatar upload failed', e)
    return null
  }
}

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
      // register.vue sends the optional profile image as a base64 data URL
      // (the user has no session yet, so it can't use /api/assets/upload).
      before: async (user: any) => {
        if (!isDataUrl(user.image)) return
        return { data: { ...user, image: await dataUrlAvatarToPixanomy(user.image, user.id || 'signup') } }
      },
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
        // Promote the "become a seller" signup checkbox into a real
        // authRole membership. Comma-separated (better-auth's admin plugin
        // natively supports "user,seller" — see has-permission.mjs's
        // `.split(",")`), so this only ever adds to whatever role the user
        // already has; it can never remove or downgrade one. Done here
        // (server-side, after the row exists) rather than accepting `role`
        // directly from the client, which would let anyone self-assign
        // "admin" by editing the signup request body.
        if (user.becomeSeller) {
          const roles = String(user.authRole || 'user').split(',').map((r: string) => r.trim()).filter(Boolean)
          if (!roles.includes('seller')) {
            roles.push('seller')
            await (db as any).update(schema.users)
              .set({ authRole: roles.join(',') })
              .where(eq(schema.users.id, user.id))
          }
        }
        // Give any registered commerce backend (e.g. adapter-magento) a
        // chance to create/link its own customer record for this user —
        // this layer never imports a specific adapter, it only ever calls
        // through the generic registry contract.
        for (const linker of CommerceCustomerLinkRegistry.getAll()) {
          if (!linker.isEnabled()) continue
          try {
            const result = await linker.onUserCreated({
              id: user.id,
              email: user.email,
              name: user.name,
              isSeller: Boolean(user.becomeSeller),
            })
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
      // Normally the client uploads first (AvatarUploader → /api/assets/upload)
      // and sends the resulting URL; this only catches a raw data URL so one
      // can never end up stored inline on the users row.
      before: async (data: any, context: any) => {
        if (!isDataUrl(data.image)) return
        const ownerId = context?.context?.session?.user?.id || 'unknown'
        return { data: { ...data, image: await dataUrlAvatarToPixanomy(data.image, ownerId) } }
      },
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
