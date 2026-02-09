export type EntityType = 'user' | 'space' | 'shop'

export interface FollowPayload {
  entityType: EntityType
  entityId: string
  userId?: string
  [key: string]: any
}

export interface FollowersResult {
  total: number
  data: string[]
}

export interface FollowingResult {
  total: number
  data: { entityType: EntityType; entityId: string }[]
}

export interface RepostResult {
  total: number
  data: string[]
}

export interface SocialServerAdapter {
  follow?(payload: FollowPayload): Promise<any | { ok?: boolean }>
  unfollow?(payload: FollowPayload): Promise<any | { ok?: boolean }>
  isFollowing?(payload: { entityType: EntityType; entityId: string; userId?: string }): Promise<boolean | { following: boolean }>
  getFollowers?(params: { entityType: EntityType; entityId: string; limit?: number; offset?: number }): Promise<FollowersResult>
  getFollowing?(params: { userId: string; limit?: number; offset?: number }): Promise<FollowingResult>

  repost?(payload: { postId: string; userId?: string }): Promise<any | { ok?: boolean }>
  unrepost?(payload: { postId: string; userId?: string }): Promise<any | { ok?: boolean }>
  isReposted?(payload: { postId: string; userId?: string }): Promise<boolean | { reposted: boolean }>
  getReposts?(params: { postId: string; limit?: number; offset?: number }): Promise<RepostResult>
}

declare global {
  // server-side adapter registration
  var __adapterServer: SocialServerAdapter | undefined
  // client-side adapter (any)
  var __adapter: any

  // optional in-memory fallback stores
  var __social_follow_store: Map<string, Set<string>> | undefined
  var __social_repost_store: Map<string, Set<string>> | undefined
}

export {}
