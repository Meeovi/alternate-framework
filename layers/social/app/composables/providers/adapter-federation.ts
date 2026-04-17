import { createMastodonSocialProvider } from '@mframework/adapter-federation'
import type { SocialProvider } from '../core/types'
import { getSocialConfig } from '../core/config'
import { registerSocialProvider } from '../core/registry'
import { wrapSocialRequest } from '../core/utils'

function getAdapterFederationProvider() {
  const { baseUrl, apiKey } = getSocialConfig()
  return createMastodonSocialProvider({
    baseUrl,
    accessToken: apiKey,
  })
}

const AdapterFederationProvider: SocialProvider = {
  async getProfile(handle: string) {
    return wrapSocialRequest(
      'adapter-federation',
      async () => getAdapterFederationProvider().getProfile(handle),
      {
        cacheKey: `adapter-federation:profile:${handle}`,
        ttlMs: 1000 * 60 * 5,
        retry: true,
      },
    )
  },

  async listPosts(handle: string) {
    return wrapSocialRequest(
      'adapter-federation',
      async () => getAdapterFederationProvider().listPosts(handle),
      {
        cacheKey: `adapter-federation:posts:${handle}`,
        ttlMs: 1000 * 30,
        retry: true,
      },
    )
  },

  async createPost(content: string) {
    return wrapSocialRequest(
      'adapter-federation',
      async () => getAdapterFederationProvider().createPost(content),
      {
        retry: true,
      },
    )
  },
}

registerSocialProvider('adapter-federation', AdapterFederationProvider)

export default AdapterFederationProvider