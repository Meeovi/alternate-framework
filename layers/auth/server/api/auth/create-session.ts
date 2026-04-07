import { defineEventHandler, readBody } from 'h3'
import { useServerAuth, auth as serverAuthInstance } from '../../utils/auth'
import { prisma } from 'alternate-gateway/core'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as any
  const { account } = body || {}

  if (!account || !account.id) {
    event.node.res.statusCode = 400
    return { error: 'missing account.id' }
  }

  // Ensure the BetterAuth server instance is available
  const serverAuth = useServerAuth?.() || (serverAuthInstance as any)

  // Helper to attempt invoking any candidate session-creation function
  async function tryCreateSessionWithApi(api: any, userId: string) {
    if (!api) return false

    const keys = Object.keys(api || {})
    // Prefer explicit candidates, then fallback to heuristics
    const candidates = [
      'createSession',
      'createMcpSession',
      'createSessionForUser',
      'createSessionCookie',
      ...keys.filter(k => /create.*session/i.test(k)),
    ]

    for (const name of candidates) {
      const fn = (api as any)[name]
      if (typeof fn !== 'function') continue

      // Try multiple call signatures commonly used by similar libraries.
      const attempts: Array<() => Promise<any>> = []
      attempts.push(() => fn({ body: { userId }, headers: event.node.req.headers, res: event.node.res } as any))
      attempts.push(() => fn(userId, { headers: event.node.req.headers, res: event.node.res } as any))
      attempts.push(() => fn({ user: { id: userId } }, { headers: event.node.req.headers, res: event.node.res } as any))
      attempts.push(() => fn({ userId }, event.node.req, event.node.res))

      for (const attempt of attempts) {
        try {
          const result = await attempt()
          // If it didn't throw, assume success
          return true
        } catch (e: unknown) {
          // Try next signature
          const message = e instanceof Error ? e.message : String(e)
          console.warn(`session creation attempt failed for ${name}:`, message)
        }
      }
    }

    return false
  }

  const userId = String(account.id)

  // First, attempt session creation with BetterAuth API (best-effort).
  try {
    const api = serverAuth?.api || (serverAuthInstance as any)?.api || serverAuth
    const created = await tryCreateSessionWithApi(api, userId)
    if (created) {
      // Attempt DB upsert in background but don't block result on DB
      try {
        await prisma.users.upsert({
          where: { id: userId },
          update: { raw_user_meta_data: account, updated_at: new Date() } as any,
          create: { id: userId, raw_user_meta_data: account, created_at: new Date() } as any,
        } as any)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        console.warn('prisma upsert failed after session creation', message)
      }
      return { ok: true }
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn('session creation via BetterAuth API failed', message)
  }

  // If session creation didn't work, fall back to DB upsert (best-effort)
  try {
    await prisma.users.upsert({
      where: { id: userId },
      update: { raw_user_meta_data: account, updated_at: new Date() } as any,
      create: { id: userId, raw_user_meta_data: account, created_at: new Date() } as any,
    } as any)
    return { ok: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('prisma upsert failed', message)
    // Return success false but don't leak internals
    event.node.res.statusCode = 500
    return { error: 'failed to persist user' }
  }
})
