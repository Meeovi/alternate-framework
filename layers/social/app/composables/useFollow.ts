export type EntityType = 'user' | 'space' | 'shop'

export default function useFollow() {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  // Adapter-first: expected adapter methods (if implemented by adapter):
  // - follow(entityType, entityId)
  // - unfollow(entityType, entityId)
  // - isFollowing(entityType, entityId, userId?)
  // - getFollowers(entityType, entityId, opts?)
  // - getFollowing(userId, opts?)

  async function follow(entityType: EntityType, entityId: string | number, opts?: any) {
    if (adapter && typeof adapter.follow === 'function') {
      return adapter.follow(entityType, entityId, opts)
    }
    // Fallback to local server API
    const res = await fetch(`/api/social/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, ...(opts || {}) })
    })
    return res.json()
  }

  async function unfollow(entityType: EntityType, entityId: string | number, opts?: any) {
    if (adapter && typeof adapter.unfollow === 'function') {
      return adapter.unfollow(entityType, entityId, opts)
    }
    const res = await fetch(`/api/social/follow`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, ...(opts || {}) })
    })
    return res.json()
  }

  async function isFollowing(entityType: EntityType, entityId: string | number, opts?: any) {
    if (adapter && typeof adapter.isFollowing === 'function') {
      return adapter.isFollowing(entityType, entityId, opts)
    }
    const params = new URLSearchParams({ entityType, entityId: String(entityId), ...(opts || {}) })
    const res = await fetch(`/api/social/follow/exists?${params.toString()}`)
    return res.json()
  }

  async function getFollowers(entityType: EntityType, entityId: string | number, opts?: any) {
    if (adapter && typeof adapter.getFollowers === 'function') {
      return adapter.getFollowers(entityType, entityId, opts)
    }
    const params = new URLSearchParams({ entityType, entityId: String(entityId), ...(opts || {}) })
    const res = await fetch(`/api/social/follow/followers?${params.toString()}`)
    return res.json()
  }

  async function getFollowing(userId: string | number, opts?: any) {
    if (adapter && typeof adapter.getFollowing === 'function') {
      return adapter.getFollowing(userId, opts)
    }
    const params = new URLSearchParams({ userId: String(userId), ...(opts || {}) })
    const res = await fetch(`/api/social/follow/following?${params.toString()}`)
    return res.json()
  }

  async function toggleFollow(entityType: EntityType, entityId: string | number, opts?: any) {
    const exists = await isFollowing(entityType, entityId, opts)
    if (exists?.following) {
      return unfollow(entityType, entityId, opts)
    }
    return follow(entityType, entityId, opts)
  }

  return {
    follow,
    unfollow,
    isFollowing,
    getFollowers,
    getFollowing,
    toggleFollow
  }
}
