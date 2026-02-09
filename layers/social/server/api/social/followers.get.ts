import { defineEventHandler, H3Event, getQuery, createError } from 'h3'

const store = globalThis.__social_follow_store ||= new Map<string, Set<string>>()

function getServerAdapter() {
  return globalThis.__adapterServer || globalThis.__adapter || null
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const { entityType, entityId, limit = '50', offset = '0', ...rest } = query || {}

  if (!entityType || !entityId) return { total: 0, data: [] }

  const adapter = getServerAdapter()
  if (adapter && typeof adapter.getFollowers === 'function') {
    try {
      return await adapter.getFollowers({ entityType, entityId, limit: Number(limit), offset: Number(offset), ...rest })
    } catch (err: any) {
      return createError({ statusCode: 500, statusMessage: err?.message || 'Adapter getFollowers failed' })
    }
  }

  const key = `${entityType}:${entityId}`
  const set = store.get(key) || new Set()
  const arr = Array.from(set)
  const l = Number(limit)
  const o = Number(offset)
  const data = arr.slice(o, o + l)
  return { total: arr.length, data }
})