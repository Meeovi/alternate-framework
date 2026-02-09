import { createError, defineEventHandler, H3Event, readBody } from 'h3'

// In-memory store: Map<string, Set<string>> where key = `${entityType}:${entityId}` and values are userIds
const store = globalThis.__social_follow_store ||= new Map<string, Set<string>>()

function getServerAdapter() {
  // Adapter may be registered on the server runtime under various globals
  return globalThis.__adapterServer || globalThis.__adapter || null
}

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { entityType, entityId, userId, ...rest } = body || {}
  const uid = userId || event.node.req.headers['x-user-id'] || null

  if (!entityType || !entityId || !uid) {
    return createError({ statusCode: 400, statusMessage: 'Missing entityType, entityId or userId' })
  }

  const adapter = getServerAdapter()
  if (adapter && typeof adapter.follow === 'function') {
    try {
      return await adapter.follow({ entityType, entityId, userId: String(uid), ...rest })
    } catch (err: any) {
      return createError({ statusCode: 500, statusMessage: err?.message || 'Adapter follow failed' })
    }
  }

  // Fallback to in-memory store
  const key = `${entityType}:${entityId}`
  let set = store.get(key)
  if (!set) {
    set = new Set()
    store.set(key, set)
  }
  set.add(String(uid))

  return { ok: true }
})
