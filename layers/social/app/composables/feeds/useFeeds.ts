export const useFeeds = () => {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  const call = async (method: string, payload: any, fallback: () => Promise<any>) => {
    if (adapter && typeof adapter[method] === 'function') {
      return adapter[method](payload)
    }
    return fallback()
  }

  const getFeed = (type: string, opts?: any) =>
    call('getFeed', { type, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ type, ...(opts || {}) })
      const res = await fetch(`/api/social/feed?${params}`)
      return res.json()
    })

  const getUserFeed = (userId: string | number, opts?: any) =>
    call('getUserFeed', { userId, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/feed/user/${userId}?${params}`)
      return res.json()
    })

  const getNotifications = (opts?: any) =>
    call('getNotifications', opts, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/notifications?${params}`)
      return res.json()
    })

  const markNotificationRead = (notificationId: string | number) =>
    call('markNotificationRead', { notificationId }, async () => {
      const res = await fetch(`/api/social/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      return res.json()
    })

  return {
    getFeed,
    getUserFeed,
    getNotifications,
    markNotificationRead
  }
}
