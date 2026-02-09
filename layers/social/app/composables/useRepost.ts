export default function useRepost() {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  // Methods expected on adapter (optional):
  // - repost(entity: { postId, userId?, ... })
  // - unrepost(entity)
  // - isReposted({ postId, userId? }) -> boolean or { reposted: boolean }
  // - getReposts({ postId, limit, offset }) -> { total, data }

  async function repost(postId: string | number, opts?: any) {
    if (adapter && typeof adapter.repost === 'function') return adapter.repost({ postId, ...(opts || {}) })
    const res = await fetch('/api/social/repost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, ...(opts || {}) })
    })
    return res.json()
  }

  async function unrepost(postId: string | number, opts?: any) {
    if (adapter && typeof adapter.unrepost === 'function') return adapter.unrepost({ postId, ...(opts || {}) })
    const res = await fetch('/api/social/repost', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, ...(opts || {}) })
    })
    return res.json()
  }

  async function isReposted(postId: string | number, opts?: any) {
    if (adapter && typeof adapter.isReposted === 'function') return adapter.isReposted({ postId, ...(opts || {}) })
    const params = new URLSearchParams({ postId: String(postId), ...(opts || {}) })
    const res = await fetch(`/api/social/repost/exists?${params.toString()}`)
    return res.json()
  }

  async function toggleRepost(postId: string | number, opts?: any) {
    const exists = await isReposted(postId, opts)
    if (exists?.reposted) {
      return unrepost(postId, opts)
    }
    return repost(postId, opts)
  }

  async function getReposts(postId: string | number, opts?: any) {
    if (adapter && typeof adapter.getReposts === 'function') return adapter.getReposts({ postId, ...(opts || {}) })
    const params = new URLSearchParams({ postId: String(postId), ...(opts || {}) })
    const res = await fetch(`/api/social/repost/reposts?${params.toString()}`)
    return res.json()
  }

  return {
    repost,
    unrepost,
    isReposted,
    toggleRepost,
    getReposts
  }
}
