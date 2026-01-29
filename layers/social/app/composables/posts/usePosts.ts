// composables/usePosts.ts - use registered social provider (adapter) under the hood
import { getSocialConfig } from '../config'
import { getSocialProvider } from '../registry'

export const usePosts = () => {
  const config = getSocialConfig()
  const provider = getSocialProvider(config.provider)

  const createPost = async (text: string, embed?: any, reply?: any) => {
    if (typeof provider.createPost !== 'function') {
      throw new Error('Social provider does not support createPost')
    }
    return provider.createPost(text, { embed, reply })
  }

  const getTimeline = async (handle?: string, limit = 20) => {
    // If provider exposes listPosts, use it. Otherwise, try a provider-specific timeline method.
    if (typeof provider.listPosts === 'function') {
      return provider.listPosts(handle || '', { limit })
    }
    // fallback: empty array
    return []
  }

  return { createPost, getTimeline }
}