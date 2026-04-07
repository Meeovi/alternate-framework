import { getSocialConfig } from './core/config'
import { getSocialProvider } from './core/registry'
import type { SocialActivity, SocialPost } from './core/types'

export function useSocial() {
  const { provider } = getSocialConfig()
  const socialProvider = getSocialProvider(provider)

  async function getActivityFeed(handle: string, options?: Record<string, any>): Promise<SocialActivity[]> {
    const posts = await socialProvider.listPosts(handle, options)

    return posts.map((post: SocialPost) => ({
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
