// src/providers/mastodon.ts
import type { SocialProvider, SocialProfile, SocialPost } from '../core/types'
import { getSocialConfig } from '../core/config'
import { registerSocialProvider } from '../core/registry'

async function mastodonFetch(path: string, options: RequestInit = {}) {
  const { baseUrl, apiKey } = getSocialConfig()
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(options.headers || {})
    }
  })
  if (!res.ok) throw new Error(`Mastodon error: ${res.status}`)
  return res.json()
}

const MastodonProvider: SocialProvider = {
  async getProfile(handle: string): Promise<SocialProfile> {
    const data = await mastodonFetch(`/api/v1/accounts/lookup?acct=${handle}`)
    return {
      id: data.id,
      username: data.acct,
      displayName: data.display_name,
      avatarUrl: data.avatar,
      url: data.url
    }
  },

  async listPosts(handle: string): Promise<SocialPost[]> {
    const profile = await this.getProfile(handle)
    const data = await mastodonFetch(`/api/v1/accounts/${profile.id}/statuses`)
    return data.map((status: any) => ({
      id: status.id,
      content: status.content,
      createdAt: status.created_at,
      author: profile,
      url: status.url
    }))
  }
}

registerSocialProvider('mastodon', MastodonProvider)
