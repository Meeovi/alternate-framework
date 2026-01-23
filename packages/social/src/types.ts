export interface SocialProfile {
  id: string
  username: string
  displayName?: string
  avatarUrl?: string
  url?: string
  [key: string]: any
}

export interface SocialPost {
  id: string
  content: string
  createdAt: string
  author: SocialProfile
  url?: string
  [key: string]: any
}

export interface SocialActivity extends SocialPost {
  provider: string
  source?: string
}

export interface SocialProvider {
  getProfile(handle: string): Promise<SocialProfile>
  listPosts(handle: string, options?: Record<string, any>): Promise<SocialPost[]>
  createPost?(content: string, options?: Record<string, any>): Promise<SocialPost>
}
