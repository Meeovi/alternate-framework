import { createAtprotoGatewayClient } from '@mframework/adapter-federation'
import { getSocialConfig } from '../core/config'
import { registerSocialProvider } from '../core/registry'
import { wrapSocialRequest } from '../core/utils'

function getAtprotoClient() {
  const { baseUrl, apiKey } = getSocialConfig()
  return createAtprotoGatewayClient({ baseUrl, token: apiKey })
}

const AtprotoProvider = {
  async getProfile(handle: string) {
    return wrapSocialRequest(
      'atproto',
      async () => {
        const data = await getAtprotoClient().getProfile(handle)
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
        const data = await getAtprotoClient().getAuthorFeed(handle)
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
