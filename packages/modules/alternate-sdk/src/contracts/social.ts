export interface Post {
  id: string
  authorId: string
  content: string
  createdAt: string
  updatedAt?: string
  spaceId?: string
  hashtags?: string[]
  isPoll?: boolean
  pollOptions?: PollOption[]
  isMemory?: boolean
  memoryDate?: string
  isRadio?: boolean
  radioGenre?: string
  federationProtocol?: 'activitypub' | 'atproto'
  federationVisibility?: 'public' | 'unlisted' | 'private' | 'direct' | 'followers' | 'lists'
}

export interface PollOption {
  id: string
  text: string
  voteCount: number
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: string
  parentId?: string
  replies?: Comment[]
}

export interface Reaction {
  type: string
  count: number
}

export interface Space {
  id: string
  name: string
  slug?: string
  description?: string
  memberCount?: number
  createdAt?: string
}

export interface Vibe {
  id: string
  url: string
  authorId?: string
  createdAt?: string
}

export interface LiveStream {
  id: string
  title?: string
  viewerCount?: number
  isLive: boolean
}

export interface Notification {
  id: string
  type: 'like' | 'repost' | 'comment' | 'follow' | 'mention'
  actorId: string
  targetId?: string
  read: boolean
  createdAt: string
}

export interface PostFilters {
  spaceId?: string
  hashtag?: string
  authorId?: string
  limit?: number
  offset?: number
  [key: string]: unknown
}

export interface SocialDriver {
  getPosts(filters?: PostFilters): Promise<Post[]>
  getPost(id: string): Promise<Post | null>
  createPost(input: CreatePostInput): Promise<Post>
  updatePost(id: string, input: Partial<CreatePostInput>): Promise<Post>
  deletePost(id: string): Promise<{ success: boolean }>
  repost(postId: string): Promise<{ success: boolean }>
  unrepost(postId: string): Promise<{ success: boolean }>
  isReposted(postId: string): Promise<{ reposted: boolean }>
  getReposts(postId: string, opts?: PostFilters): Promise<Post[]>
  mutePost(postId: string): Promise<{ success: boolean }>
  blockPost(postId: string): Promise<{ success: boolean }>
}

export interface CommentDriver {
  getComments(postId: string, opts?: { limit?: number; offset?: number }): Promise<Comment[]>
  getThread(commentId: string): Promise<Comment | null>
  createComment(postId: string, input: CreateCommentInput): Promise<Comment>
  replyToComment(commentId: string, input: CreateCommentInput): Promise<Comment>
  deleteComment(commentId: string): Promise<{ success: boolean }>
  reactToComment(commentId: string, reaction: string): Promise<{ success: boolean }>
  reportComment(commentId: string, reason: string): Promise<{ success: boolean }>
}

export interface FeedDriver {
  getFeed(type: string, opts?: PostFilters): Promise<Post[]>
  getUserFeed(userId: string, opts?: PostFilters): Promise<Post[]>
  getNotifications(opts?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<Notification[]>
  markNotificationRead(notificationId: string): Promise<{ success: boolean }>
}

export interface SpacesDriver {
  getSpaces(opts?: { limit?: number; query?: string }): Promise<Space[]>
  getSpace(id: string): Promise<Space | null>
  createSpace(input: CreateSpaceInput): Promise<Space>
  joinSpace(spaceId: string): Promise<{ success: boolean }>
  leaveSpace(spaceId: string): Promise<{ success: boolean }>
  getSpaceMembers(spaceId: string, opts?: { limit?: number }): Promise<UserProfile[]>
  getSpacePosts(spaceId: string, opts?: PostFilters): Promise<Post[]>
}

export interface VibezDriver {
  getVibez(opts?: { limit?: number }): Promise<Vibe[]>
  uploadVibe(data: FormData): Promise<Vibe>
  likeVibe(vibeId: string): Promise<{ success: boolean }>
  getVibe(vibeId: string): Promise<Vibe | null>
  startLive(opts?: StartLiveInput): Promise<LiveStream>
  stopLive(liveId: string): Promise<{ success: boolean }>
  getLive(liveId: string): Promise<LiveStream | null>
  getLiveViewers(liveId: string): Promise<{ count: number }>
}

export interface UserProfile {
  id: string
  name?: string
  username?: string
  avatar?: string
}

export interface CreatePostInput {
  userId: string
  content: string
  spaceId?: string
  hashtags?: string[]
  isPoll?: boolean
  pollOptions?: string[]
  pollExpiresInSeconds?: number
  isMemory?: boolean
  memoryDate?: string
  isRadio?: boolean
  radioGenre?: string
  federationProtocol?: 'activitypub' | 'atproto'
  federationVisibility?: 'public' | 'unlisted' | 'private' | 'direct' | 'followers' | 'lists'
}

export interface CreateCommentInput {
  content: string
  authorId?: string
}

export interface CreateSpaceInput {
  name: string
  slug?: string
  description?: string
}

export interface StartLiveInput {
  title?: string
}

export interface SocialDriverContract {
  posts: SocialDriver
  comments: CommentDriver
  feed: FeedDriver
  spaces: SpacesDriver
  vibez: VibezDriver
  getUser(userId: string): Promise<UserProfile | null>
  searchUsers(query: string): Promise<UserProfile[]>
  follow(userId: string): Promise<{ success: boolean }>
  unfollow(userId: string): Promise<{ success: boolean }>
  getFollowers(userId: string, opts?: { limit?: number }): Promise<UserProfile[]>
  getFollowing(userId: string, opts?: { limit?: number }): Promise<UserProfile[]>
}

const socialRegistry = new Map<string, SocialDriverContract>()
let defaultSocialDriver: SocialDriverContract | undefined

export function registerSocialDriver(name: string, driver: SocialDriverContract): void {
  socialRegistry.set(name, driver)
}

export function getSocialDriver(name?: string): SocialDriverContract | undefined {
  if (name) return socialRegistry.get(name)
  return defaultSocialDriver
}

export function setDefaultSocialDriver(driver: SocialDriverContract): void {
  defaultSocialDriver = driver
}

export const SocialDriverRegistry = {
  register: registerSocialDriver,
  get: getSocialDriver,
  getDefaultDriver: () => defaultSocialDriver,
  setDefaultDriver: setDefaultSocialDriver,
}