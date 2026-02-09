import { defineEventHandler, H3Event, getQuery, createError } from 'h3'

const store = globalThis.__social_follow_store ||= new Map<string, Set<string>>()

function getServerAdapter() {
  return globalThis.__adapterServer || globalThis.__adapter || null
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const { userId, limit = '50', offset = '0', ...rest } = query || {}
  const uid = userId || event.node.req.headers['x-user-id'] || null

  if (!uid) return { total: 0, data: [] }

  const adapter = getServerAdapter()
  if (adapter && typeof adapter.getFollowing === 'function') {
    try {
      return await adapter.getFollowing({ userId: String(uid), limit: Number(limit), offset: Number(offset), ...rest })
    } catch (err: any) {
      return createError({ statusCode: 500, statusMessage: err?.message || 'Adapter getFollowing failed' })
    }
  }

  const keys: string[] = []
  for (const [k, set] of store.entries()) {
    if (set.has(String(uid))) keys.push(k)
  }

  const l = Number(limit)
  const o = Number(offset)
  const page = keys.slice(o, o + l)
  // return array of { entityType, entityId }
  const data = page.map(k => {
    const [entityType, ...rest] = k.split(':')
    return { entityType, entityId: rest.join(':') }
  })
  return { total: keys.length, data }
})