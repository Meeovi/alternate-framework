// layers/social/composables/usePosts.ts

export interface CreatePostInput {
  userId: string | number
  content: string
  spaceId?: string | number
  hashtags?: string[]
  isPoll?: boolean
  pollOptions?: string[]
  pollExpiresInSeconds?: number
  isMemory?: boolean
  memoryDate?: string
  isRadio?: boolean
  radioGenre?: string
  federationProtocol?: 'activitypub' | 'atproto'
  federationVisibility?: 'public' | 'unlisted' | 'private' | 'direct' | 'followers' | 'lists'
}

export interface UpdatePostInput {
  content?: string
  hashtags?: string[]
  pollOptions?: string[]
}

export const usePosts = () => {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  const call = async <T>(
    method: string,
    payload: any,
    fallback: () => Promise<T>
  ): Promise<T> => {
    if (adapter && typeof adapter[method] === 'function') {
      return adapter[method](payload)
    }
    return fallback()
  }

  const getPosts = async (opts?: any): Promise<any> =>
    call('getPosts', opts, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/posts?${params.toString()}`)
      return res.json()
    })

  const getPost = async (postId: string | number, opts?: any): Promise<any> =>
    call('getPost', { postId, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/posts/${postId}?${params.toString()}`)
      return res.json()
    })

  const createPost = async (data: CreatePostInput): Promise<any> =>
    call('createPost', data, async () => {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    })

  const updatePost = async (
    postId: string | number,
    data: UpdatePostInput
  ): Promise<any> =>
    call('updatePost', { postId, ...data }, async () => {
      const res = await fetch(`/api/social/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    })

  const deletePost = async (postId: string | number): Promise<any> =>
    call('deletePost', { postId }, async () => {
      const res = await fetch(`/api/social/posts/${postId}`, {
        method: 'DELETE'
      })
      return res.json()
    })

  const repost = async (postId: string | number, opts?: any): Promise<any> =>
    call('repost', { postId, ...(opts || {}) }, async () => {
      const res = await fetch('/api/social/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, ...(opts || {}) })
      })
      return res.json()
    })

  const unrepost = async (postId: string | number, opts?: any): Promise<any> =>
    call('unrepost', { postId, ...(opts || {}) }, async () => {
      const res = await fetch('/api/social/repost', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, ...(opts || {}) })
      })
      return res.json()
    })

  const isReposted = async (postId: string | number, opts?: any): Promise<any> =>
    call('isReposted', { postId, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ postId: String(postId), ...(opts || {}) })
      const res = await fetch(`/api/social/repost/exists?${params.toString()}`)
      return res.json()
    })

  const toggleRepost = async (postId: string | number, opts?: any): Promise<any> => {
    const exists = await isReposted(postId, opts)
    if (exists?.reposted) {
      return unrepost(postId, opts)
    }
    return repost(postId, opts)
  }

  const getReposts = async (postId: string | number, opts?: any): Promise<any> =>
    call('getReposts', { postId, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ postId: String(postId), ...(opts || {}) })
      const res = await fetch(`/api/social/repost/reposts?${params.toString()}`)
      return res.json()
    })

  const mutePost = async (postId: string | number): Promise<any> =>
    call('mutePost', { postId }, async () => {
      const res = await fetch(`/api/social/posts/${postId}/mute`, {
        method: 'POST'
      })
      return res.json()
    })

  const blockPost = async (postId: string | number): Promise<any> =>
    call('blockPost', { postId }, async () => {
      const res = await fetch(`/api/social/posts/${postId}/block`, {
        method: 'POST'
      })
      return res.json()
    })

  const getPostsByHashtag = async (hashtag: string, opts?: any): Promise<any> =>
    call('getPostsByHashtag', { hashtag, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ hashtag, ...(opts || {}) })
      const res = await fetch(`/api/social/posts/hashtag?${params.toString()}`)
      return res.json()
    })

  const getUserMemories = async (userId: string | number, opts?: any): Promise<any> =>
    call('getUserMemories', { userId, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/posts/${userId}/memories?${params.toString()}`)
      return res.json()
    })

  const createPoll = async (data: CreatePostInput): Promise<any> =>
    call('createPoll', data, async () => {
      const res = await fetch('/api/social/posts/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    })

  const votePoll = async (
    pollId: string | number,
    optionId: string | number
  ): Promise<any> =>
    call('votePoll', { pollId, optionId }, async () => {
      const res = await fetch('/api/social/posts/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId })
      })
      return res.json()
    })

  return {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    repost,
    unrepost,
    isReposted,
    toggleRepost,
    getReposts,
    mutePost,
    blockPost,
    getPostsByHashtag,
    getUserMemories,
    createPoll,
    votePoll
  }
}
