import { defineEventHandler, H3Event, getQuery } from 'h3'

const store = globalThis.__social_repost_store ||= new Map<string, Set<string>>()

function getServerAdapter() { return globalThis.__adapterServer || globalThis.__adapter || null }

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const { postId, userId, ...rest } = query || {}
  const uid = userId || event.node.req.headers['x-user-id'] || null

  if (!postId || !uid) return { reposted: false }

  const adapter = getServerAdapter()
  if (adapter && typeof adapter.isReposted === 'function') {
    try {
      const result = await adapter.isReposted({ postId, userId: String(uid), ...rest })
      if (typeof result === 'boolean') return { reposted: result }
      return { reposted: !!result?.reposted }
    } catch (err) {
      return { reposted: false }
    }
  }

  const key = String(postId)
  const set = store.get(key)
  return { reposted: !!(set && set.has(String(uid))) }
})
