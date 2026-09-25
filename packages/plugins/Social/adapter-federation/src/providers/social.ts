import { createAtprotoGatewayClient } from '../clients/atproto'
import { createMastodonRestClient } from '../clients/mastodon'

export interface FederationSocialProfile {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  url?: string
}

export interface FederationSocialPost {
  id: string
  content: string
  createdAt: string
  author: FederationSocialProfile
  url?: string
}

export interface FederationMastodonProvider {
  getProfile(handle: string): Promise<FederationSocialProfile>
  listPosts(handle: string): Promise<FederationSocialPost[]>
  createPost(content: string): Promise<FederationSocialPost>
}

export interface FederationAtprotoProvider {
  getProfile(handle: string): Promise<FederationSocialProfile>
  listPosts(handle: string): Promise<FederationSocialPost[]>
}

export interface FederationProviderOptions {
  baseUrl?: string
  accessToken?: string
}

export function createMastodonSocialProvider(options: FederationProviderOptions = {}): FederationMastodonProvider {
  const client = createMastodonRestClient({
    url: options.baseUrl || '/api/masto',
    accessToken: options.accessToken || '',
  })

  const mapProfile = (account: any): FederationSocialProfile => ({
    id: account.id,
    username: account.acct,
    displayName: account.displayName,
    avatarUrl: account.avatar,
    url: account.url,
  })

  const mapPost = (status: any): FederationSocialPost => ({
    id: status.id,
    content: status.content,
    createdAt: status.createdAt,
    author: mapProfile(status.account),
    url: status.url,
  })

  return {
    async getProfile(handle: string) {
      const account = await client.v1.accounts.lookup({ acct: handle })
      return mapProfile(account)
    },

    async listPosts(handle: string) {
      const profile = await client.v1.accounts.lookup({ acct: handle })
      const statuses = await client.v1.accounts.$select(profile.id).statuses.list()
      return statuses.map(mapPost)
    },

    async createPost(content: string) {
      const status = await client.v1.statuses.create({ status: content })
      return mapPost(status)
    },
  }
}

export function createAtprotoSocialProvider(options: FederationProviderOptions = {}): FederationAtprotoProvider {
  const client = createAtprotoGatewayClient({
    baseUrl: options.baseUrl,
    token: options.accessToken,
  })

  return {
    async getProfile(handle: string) {
      const data = await client.getProfile(handle)
      return {
        id: data.did,
        username: data.handle,
        displayName: data.displayName,
        avatarUrl: data.avatar,
        url: `https://bsky.app/profile/${data.handle}`,
      }
    },

    async listPosts(handle: string) {
      const data = await client.getAuthorFeed(handle)
      return (data.feed || []).map((item: any) => ({
        id: item.post.uri,
        content: item.post.record?.text,
        createdAt: item.post.record?.createdAt,
        author: {
          id: item.post.author.did,
          username: item.post.author.handle,
          displayName: item.post.author.displayName,
          avatarUrl: item.post.author.avatar,
        },
        url: `https://bsky.app/profile/${item.post.author.handle}/post/${item.post.uri}`,
      }))
    },
  }
}
