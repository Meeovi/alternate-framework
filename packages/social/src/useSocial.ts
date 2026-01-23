import { getSocialConfig } from './config'
import { getSocialProvider } from './registry'
import type { SocialActivity } from './types'

export function useSocial() {
  const { provider } = getSocialConfig()
  const socialProvider = getSocialProvider(provider)

  async function getActivityFeed(handle: string, options?: Record<string, any>): Promise<SocialActivity[]> {
    const posts = await socialProvider.listPosts(handle, options)

    return posts.map((post) => ({
      ...post,
      provider,
      source: provider
    }))
  }

  return {
    getProfile: socialProvider.getProfile,
    listPosts: socialProvider.listPosts,
    createPost: socialProvider.createPost,
    getActivityFeed
  }
}
