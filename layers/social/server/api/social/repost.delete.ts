import { createError, defineEventHandler, H3Event, readBody } from 'h3'

const store = globalThis.__social_repost_store ||= new Map<string, Set<string>>()

// shared globals are declared in layers/social/types/social-adapter.d.ts

function getServerAdapter() { return globalThis.__adapterServer || globalThis.__adapter || null }

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { postId, userId, ...rest } = body || {}
  const uid = userId || event.node.req.headers['x-user-id'] || null

  if (!postId || !uid) {
    return createError({ statusCode: 400, statusMessage: 'Missing postId or userId' })
  }

  const adapter = getServerAdapter()
  if (adapter && typeof adapter.unrepost === 'function') {
    try {
      return await adapter.unrepost({ postId, userId: String(uid), ...rest })
    } catch (err: any) {
      return createError({ statusCode: 500, statusMessage: err?.message || 'Adapter unrepost failed' })
    }
  }

  const key = String(postId)
  const set = store.get(key)
  if (set) set.delete(String(uid))

  return { ok: true }
})
