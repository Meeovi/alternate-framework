// layers/social/permissions/socialPermissions.ts

import type { SocialUser, SocialPost } from '../models/socialModels'

export type Visibility =
  | 'public'
  | 'friends'
  | 'followers'
  | 'circles'
  | 'space'
  | 'muted'
  | 'blocked'
  | 'shadowbanned'


export interface VisibilityRule {
  type: Visibility
  circle?: string
  spaceId?: string | number
}

export const canViewPost = (
  viewer: SocialUser | null,
  post: SocialPost,
  rule: VisibilityRule,
  context: {
    isFriend?: (viewerId: any, ownerId: any) => boolean
    isFollower?: (viewerId: any, ownerId: any) => boolean
    isInCircle?: (viewerId: any, ownerId: any, circle: string) => boolean
    isInSpace?: (viewerId: any, spaceId: any) => boolean
  }
): boolean => {
  if (rule.type === 'public') return true
  if (!viewer) return false

  const viewerId = viewer.id
  const ownerId = post.userId

  switch (rule.type) {
    case 'friends':
      return !!context.isFriend?.(viewerId, ownerId)
    case 'followers':
      return !!context.isFollower?.(viewerId, ownerId)
    case 'circles':
      return rule.circle ? !!context.isInCircle?.(viewerId, ownerId, rule.circle) : false
    case 'space':
      return rule.spaceId ? !!context.isInSpace?.(viewerId, rule.spaceId) : false
    default:
      return false
  }
}
