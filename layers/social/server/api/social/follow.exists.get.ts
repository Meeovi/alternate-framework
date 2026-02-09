import { defineEventHandler, H3Event, getQuery } from 'h3'

const store = globalThis.__social_follow_store ||= new Map<string, Set<string>>()

function getServerAdapter() {
  return globalThis.__adapterServer || globalThis.__adapter || null
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const { entityType, entityId, userId, ...rest } = query || {}
  const uid = userId || event.node.req.headers['x-user-id'] || null

  if (!entityType || !entityId || !uid) {
    return { following: false }
  }

  const adapter = getServerAdapter()
  if (adapter && typeof adapter.isFollowing === 'function') {
    try {
      const result = await adapter.isFollowing({ entityType, entityId, userId: String(uid), ...rest })
      // Adapter may return boolean or object
      if (typeof result === 'boolean') return { following: result }
      return { following: !!result?.following }
    } catch (err: any) {
      return { following: false }
    }
  }

  const key = `${entityType}:${entityId}`
  const set = store.get(key)
  const following = !!(set && set.has(String(uid)))
  return { following }
})
