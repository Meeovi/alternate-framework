import { createAtprotoSocialProvider } from '@mframework/adapter-federation'
import { getSocialConfig } from '../core/config'
import { registerSocialProvider } from '../core/registry'
import { wrapSocialRequest } from '../core/utils'

function getAtprotoProvider() {
  const { baseUrl, apiKey } = getSocialConfig()
  return createAtprotoSocialProvider({ baseUrl, accessToken: apiKey })
}

const AtprotoProvider = {
  async getProfile(handle: string) {
    return wrapSocialRequest(
      'atproto',
      async () => getAtprotoProvider().getProfile(handle),
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
      async () => getAtprotoProvider().listPosts(handle),
      {
        cacheKey: `atproto:posts:${handle}`,
        ttlMs: 1000 * 30, // 30 seconds
        retry: true
      }
    )
  }
}

registerSocialProvider('atproto', AtprotoProvider)
