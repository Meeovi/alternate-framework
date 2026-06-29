export const useUser = () => {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  const call = async (method: string, payload: any, fallback: () => Promise < any > ) => {
    if (adapter && typeof adapter[method] === 'function') {
      return adapter[method](payload)
    }
    return fallback()
  }

  const getUser = (userId: string | number) =>
    call('getUser', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}`)
      return res.json()
    })

  const searchUsers = (query: string) =>
    call('searchUsers', {
      query
    }, async () => {
      const params = new URLSearchParams({
        q: query
      })
      const res = await fetch(`/api/social/user/search?${params}`)
      return res.json()
    })

  const follow = (userId: string | number) =>
    call('follow', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/follow`, {
        method: 'POST'
      })
      return res.json()
    })

  const unfollow = (userId: string | number) =>
    call('unfollow', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/unfollow`, {
        method: 'POST'
      })
      return res.json()
    })

  const getFollowers = (userId: string | number) =>
    call('getFollowers', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/followers`)
      return res.json()
    })

  const getFollowing = (userId: string | number) =>
    call('getFollowing', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/following`)
      return res.json()
    })

  const addToCircle = (userId: string | number, circle: string) =>
    call('addToCircle', {
      userId,
      circle
    }, async () => {
      const res = await fetch(`/api/social/user/circle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          circle
        })
      })
      return res.json()
    })

  const removeFromCircle = (userId: string | number, circle: string) =>
    call('removeFromCircle', {
      userId,
      circle
    }, async () => {
      const res = await fetch(`/api/social/user/circle`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          circle
        })
      })
      return res.json()
    })

  const blockUser = (userId: string | number) =>
    call('blockUser', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/block`, {
        method: 'POST'
      })
      return res.json()
    })

  const unblockUser = (userId: string | number) =>
    call('unblockUser', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/unblock`, {
        method: 'POST'
      })
      return res.json()
    })

  const muteUser = (userId: string | number) =>
    call('muteUser', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/mute`, {
        method: 'POST'
      })
      return res.json()
    })

  const unmuteUser = (userId: string | number) =>
    call('unmuteUser', {
      userId
    }, async () => {
      const res = await fetch(`/api/social/user/${userId}/unmute`, {
        method: 'POST'
      })
      return res.json()
    })

  return {
    getUser,
    searchUsers,
    follow,
    unfollow,
    getFollowers,
    getFollowing,
    addToCircle,
    removeFromCircle,
    muteUser,
    unmuteUser,
    blockUser,
    unblockUser
  }
}