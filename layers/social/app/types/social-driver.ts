export type SocialTimelineType = 'home' | 'local' | 'federated'

export interface SocialDriverPost {
  id: string
  [key: string]: any
}

export interface SocialDriverUser {
  id?: string
  handle?: string
  [key: string]: any
}

export interface SocialDriver<
  TPost extends SocialDriverPost = SocialDriverPost,
  TUser extends SocialDriverUser = SocialDriverUser,
> {
  getTimeline(type: SocialTimelineType): Promise<TPost[]>
  createPost(content: string): Promise<TPost>
  toggleLike(id: string): Promise<TPost>
  getUserProfile(handle: string): Promise<TUser>
}