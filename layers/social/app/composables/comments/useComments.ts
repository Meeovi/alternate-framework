export const useComments = () => {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  const call = async (method: string, payload: any, fallback: () => Promise<any>) => {
    if (adapter && typeof adapter[method] === 'function') {
      return adapter[method](payload)
    }
    return fallback()
  }

  const getComments = (postId: string | number, opts?: any) =>
    call('getComments', { postId, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/comments/${postId}?${params}`)
      return res.json()
    })

  const getThread = (commentId: string | number) =>
    call('getThread', { commentId }, async () => {
      const res = await fetch(`/api/social/comments/thread/${commentId}`)
      return res.json()
    })

  const createComment = (postId: string | number, data: any) =>
    call('createComment', { postId, ...data }, async () => {
      const res = await fetch(`/api/social/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    })

  const replyToComment = (commentId: string | number, data: any) =>
    call('replyToComment', { commentId, ...data }, async () => {
      const res = await fetch(`/api/social/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    })

  const deleteComment = (commentId: string | number) =>
    call('deleteComment', { commentId }, async () => {
      const res = await fetch(`/api/social/comments/item/${commentId}`, {
        method: 'DELETE'
      })
      return res.json()
    })

  const reactToComment = (commentId: string | number, reaction: string) =>
    call('reactToComment', { commentId, reaction }, async () => {
      const res = await fetch(`/api/social/comments/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reaction })
      })
      return res.json()
    })

  const reportComment = (commentId: string | number, reason: string) =>
    call('reportComment', { commentId, reason }, async () => {
      const res = await fetch(`/api/social/comments/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reason })
      })
      return res.json()
    })

  return {
    getComments,
    getThread,
    createComment,
    replyToComment,
    deleteComment,
    reactToComment,
    reportComment
  }
}
