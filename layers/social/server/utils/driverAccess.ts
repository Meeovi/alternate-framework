/**
 * Access-control manifest for the `POST /api/social/driver` RPC proxy.
 *
 * The proxy forwards a method name from an untrusted request body straight
 * to the server-side social driver. Without a manifest, any caller could
 * invoke any method the driver object exposes. Every method that should be
 * reachable through the proxy has to be listed here explicitly; anything
 * not listed is rejected (fail closed).
 *
 * `public`  — read-only, safe for anonymous callers.
 * `authed`  — requires a signed-in session (writes, or data scoped to the
 *             current user). Per-object ownership (e.g. "can this user
 *             delete this post") remains the driver/backend's job — this
 *             layer only guarantees a session exists.
 */
export const SOCIAL_DRIVER_PUBLIC_METHODS: ReadonlySet<string> = new Set([
  'posts.getPosts',
  'posts.getPost',
  'posts.isReposted',
  'posts.getReposts',
  'comments.getComments',
  'comments.getThread',
  'feed.getFeed',
  'feed.getUserFeed',
  'spaces.getSpaces',
  'spaces.getSpace',
  'spaces.getSpaceMembers',
  'spaces.getSpacePosts',
  'vibez.getVibez',
  'vibez.getVibe',
  'vibez.getLive',
  'vibez.getLiveViewers',
  'getUser',
  'searchUsers',
  'getFollowers',
  'getFollowing',
])

export const SOCIAL_DRIVER_AUTHED_METHODS: ReadonlySet<string> = new Set([
  'posts.createPost',
  'posts.updatePost',
  'posts.deletePost',
  'posts.repost',
  'posts.unrepost',
  'posts.mutePost',
  'posts.blockPost',
  'comments.createComment',
  'comments.replyToComment',
  'comments.deleteComment',
  'comments.reactToComment',
  'comments.reportComment',
  'feed.getNotifications',
  'feed.markNotificationRead',
  'spaces.createSpace',
  'spaces.joinSpace',
  'spaces.leaveSpace',
  'vibez.uploadVibe',
  'vibez.likeVibe',
  'vibez.startLive',
  'vibez.stopLive',
  'follow',
  'unfollow',
])

export type SocialDriverAccess = 'public' | 'authed' | 'denied'

export function classifySocialDriverMethod(method: string): SocialDriverAccess {
  if (SOCIAL_DRIVER_PUBLIC_METHODS.has(method)) return 'public'
  if (SOCIAL_DRIVER_AUTHED_METHODS.has(method)) return 'authed'
  return 'denied'
}
