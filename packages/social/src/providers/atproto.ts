import { wrapSocialRequest } from '../utils'
import { getSocialConfig } from '../config'
import { registerSocialProvider } from '../registry'

async function atprotoFetch(path: string, options: RequestInit = {}) {
  const { baseUrl, apiKey } = getSocialConfig()
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(options.headers || {})
    }
  })

  if (!res.ok) {
    const error: any = new Error(`ATProto error: ${res.status}`)
    error.status = res.status
    error.response = res
    throw error
  }

  return res.json()
}

const AtprotoProvider = {
  async getProfile(handle: string) {
    return wrapSocialRequest(
      'atproto',
      async () => {
        const data = await atprotoFetch(`/xrpc/app.bsky.actor.getProfile?actor=${handle}`)
        return {
          id: data.did,
          username: data.handle,
          displayName: data.displayName,
          avatarUrl: data.avatar,
          url: `https://bsky.app/profile/${data.handle}`
        }
      },
      {
        cacheKey: `atproto:profile:${handle}`,
        ttlMs: 1000 * 60 * 5, // 5 minutes
        retry: true
      }
    )
  },

  async listPosts(handle: string) {
    return wrapSocialRequest(
      'atproto',
      async () => {
        const data = await atprotoFetch(`/xrpc/app.bsky.feed.getAuthorFeed?actor=${handle}`)
        return (data.feed || []).map((item: any) => ({
          id: item.post.uri,
          content: item.post.record?.text,
          createdAt: item.post.record?.createdAt,
          author: {
            id: item.post.author.did,
            username: item.post.author.handle,
            displayName: item.post.author.displayName,
            avatarUrl: item.post.author.avatar
          },
          url: `https://bsky.app/profile/${item.post.author.handle}/post/${item.post.uri}`
        }))
      },
      {
        cacheKey: `atproto:posts:${handle}`,
        ttlMs: 1000 * 30, // 30 seconds
        retry: true
      }
    )
  }
}

registerSocialProvider('atproto', AtprotoProvider)
