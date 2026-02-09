import { createError, defineEventHandler, H3Event, readBody } from 'h3'

const store = globalThis.__social_follow_store ||= new Map<string, Set<string>>()

function getServerAdapter() {
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
  if (adapter && typeof adapter.unfollow === 'function') {
    try {
      return await adapter.unfollow({ entityType, entityId, userId: String(uid), ...rest })
    } catch (err: any) {
      return createError({ statusCode: 500, statusMessage: err?.message || 'Adapter unfollow failed' })
    }
  }

  const key = `${entityType}:${entityId}`
  const set = store.get(key)
  if (set) {
    set.delete(String(uid))
  }

  return { ok: true }
})
