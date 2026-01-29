import type { SocialProvider, SocialPost, SocialProfile } from '../types'
import { registerSocialProvider } from '../registry'

const memoryProfiles: Record<string, SocialProfile> = {}
const memoryPosts: Record<string, SocialPost[]> = {}

const MemoryProvider: SocialProvider = {
  async getProfile(handle: string) {
    if (!memoryProfiles[handle]) {
      memoryProfiles[handle] = { id: handle, username: handle, displayName: handle }
    }
    return memoryProfiles[handle]
  },

  async listPosts(handle: string, options?: Record<string, any>) {
    const posts = memoryPosts[handle] || []
    const limit = options?.limit || 20
    return posts.slice(0, limit)
  },

  async createPost(content: string, options?: Record<string, any>) {
    const handle = options?.handle || 'local'
    const profile = await this.getProfile(handle)
    const post: SocialPost = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      content,
      createdAt: new Date().toISOString(),
      author: profile
    }
    if (!memoryPosts[handle]) memoryPosts[handle] = []
    memoryPosts[handle].unshift(post)
    return post
  }
}

registerSocialProvider('memory', MemoryProvider)

export default MemoryProvider
