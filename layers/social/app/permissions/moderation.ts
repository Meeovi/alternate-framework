// layers/social/permissions/moderation.ts

export type Visibility =
  | 'public'
  | 'friends'
  | 'followers'
  | 'circles'
  | 'space'
  | 'direct'
  | 'activitypub_public'
  | 'activitypub_unlisted'
  | 'activitypub_private'
  | 'activitypub_direct'
  | 'atproto_public'
  | 'atproto_followers'
  | 'atproto_lists'
  | 'atproto_private'

export interface VisibilityRule {
  type: Visibility
  circle?: string
  spaceId?: string | number
  listId?: string
}

export interface MinimalUser {
  id: string | number
  shadowBanned?: boolean
}

export interface MinimalPost {
  id: string | number
  userId: string | number
  spaceId?: string | number
}

export interface ModerationContext {
  isFriend?: (viewerId: string | number, ownerId: string | number) => boolean
  isFollower?: (viewerId: string | number, ownerId: string | number) => boolean
  isInCircle?: (
    viewerId: string | number,
    ownerId: string | number,
    circle: string
  ) => boolean
  isInSpace?: (viewerId: string | number, spaceId: string | number) => boolean
  isInList?: (viewerId: string | number, listId: string) => boolean
}

export const isShadowBanned = (user: MinimalUser | null): boolean => {
  return !!user?.shadowBanned
}

export const shouldSendToModerationQueue = (content: string): boolean => {
  return content.length > 2000
}

export const canViewPost = (
  viewer: MinimalUser | null,
  post: MinimalPost,
  rule: VisibilityRule,
  ctx: ModerationContext
): boolean => {
  if (rule.type === 'public' || rule.type === 'activitypub_public' || rule.type === 'atproto_public') {
    return true
  }

  if (!viewer) return false

  const viewerId = viewer.id
  const ownerId = post.userId

  switch (rule.type) {
    case 'friends':
      return !!ctx.isFriend?.(viewerId, ownerId)
    case 'followers':
    case 'activitypub_unlisted':
    case 'activitypub_private':
    case 'activitypub_direct':
    case 'atproto_followers':
      return !!ctx.isFollower?.(viewerId, ownerId)
    case 'circles':
      return rule.circle ? !!ctx.isInCircle?.(viewerId, ownerId, rule.circle) : false
    case 'space':
      return rule.spaceId ? !!ctx.isInSpace?.(viewerId, rule.spaceId) : false
    case 'direct':
      return viewerId === ownerId
    case 'atproto_lists':
      return rule.listId ? !!ctx.isInList?.(viewerId, rule.listId) : false
    case 'atproto_private':
      return viewerId === ownerId
    default:
      return false
  }
}
