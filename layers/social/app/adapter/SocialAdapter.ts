export interface SocialAdapter {
  // POSTS
  getPosts?: (opts?: any) => Promise<any>
  getPost?: (payload: { postId: string | number }) => Promise<any>
  createPost?: (data: any) => Promise<any>
  updatePost?: (payload: { postId: string | number } & any) => Promise<any>
  deletePost?: (payload: { postId: string | number }) => Promise<any>

  repost?: (payload: { postId: string | number }) => Promise<any>
  unrepost?: (payload: { postId: string | number }) => Promise<any>
  isReposted?: (payload: { postId: string | number }) => Promise<any>
  getReposts?: (payload: { postId: string | number }) => Promise<any>

  mutePost?: (payload: { postId: string | number }) => Promise<any>
  blockPost?: (payload: { postId: string | number }) => Promise<any>

  // COMMENTS
  getComments?: (payload: { postId: string | number }) => Promise<any>
  getThread?: (payload: { commentId: string | number }) => Promise<any>
  createComment?: (payload: { postId: string | number } & any) => Promise<any>
  replyToComment?: (payload: { commentId: string | number } & any) => Promise<any>
  deleteComment?: (payload: { commentId: string | number }) => Promise<any>
  reactToComment?: (payload: { commentId: string | number, reaction: string }) => Promise<any>
  reportComment?: (payload: { commentId: string | number, reason: string }) => Promise<any>

  // FEEDS
  getFeed?: (payload: { type: string } & any) => Promise<any>
  getUserFeed?: (payload: { userId: string | number } & any) => Promise<any>
  getNotifications?: (opts?: any) => Promise<any>
  markNotificationRead?: (payload: { notificationId: string | number }) => Promise<any>

  // VIBEZ
  getVibez?: (opts?: any) => Promise<any>
  uploadVibe?: (data: FormData) => Promise<any>
  likeVibe?: (payload: { vibeId: string | number }) => Promise<any>
  getVibe?: (payload: { vibeId: string | number }) => Promise<any>

  startLive?: (opts?: any) => Promise<any>
  stopLive?: (payload: { liveId: string | number }) => Promise<any>
  getLive?: (payload: { liveId: string | number }) => Promise<any>
  getLiveViewers?: (payload: { liveId: string | number }) => Promise<any>

  // SPACES
  getSpaces?: (opts?: any) => Promise<any>
  getSpace?: (payload: { spaceId: string | number }) => Promise<any>
  createSpace?: (data: any) => Promise<any>
  joinSpace?: (payload: { spaceId: string | number }) => Promise<any>
  leaveSpace?: (payload: { spaceId: string | number }) => Promise<any>
  getSpaceMembers?: (payload: { spaceId: string | number }) => Promise<any>
  getSpacePosts?: (payload: { spaceId: string | number } & any) => Promise<any>

  // USER
  getUser?: (payload: { userId: string | number }) => Promise<any>
  searchUsers?: (payload: { query: string }) => Promise<any>

  follow?: (payload: { userId: string | number }) => Promise<any>
  unfollow?: (payload: { userId: string | number }) => Promise<any>

  getFollowers?: (payload: { userId: string | number }) => Promise<any>
  getFollowing?: (payload: { userId: string | number }) => Promise<any>

  addToCircle?: (payload: { userId: string | number, circle: string }) => Promise<any>
  removeFromCircle?: (payload: { userId: string | number, circle: string }) => Promise<any>

  blockUser?: (payload: { userId: string | number }) => Promise<any>
  unblockUser?: (payload: { userId: string | number }) => Promise<any>

  muteUser?: (payload: { userId: string | number }) => Promise<any>
  unmuteUser?: (payload: { userId: string | number }) => Promise<any>

    // FEDERATION (via alternate-federation under the hood)
  getFederatedPosts?: (opts?: any) => Promise<any>
  getFederatedUserFeed?: (payload: { userId: string | number } & any) => Promise<any>
  publishPostToFederation?: (payload: { postId: string | number }) => Promise<any>
  createFederatedPost?: (data: any) => Promise<any>

  // MODERATION / QUEUES
  enqueueModerationItem?: (payload: { type: 'post' | 'comment', id: string | number }) => Promise<any>
  getModerationQueue?: (opts?: any) => Promise<any>
  resolveModerationItem?: (payload: { id: string | number, action: 'approve' | 'reject' | 'shadowban' }) => Promise<any>

  // SHADOW BANNING
  shadowBanUser?: (payload: { userId: string | number }) => Promise<any>
  unshadowBanUser?: (payload: { userId: string | number }) => Promise<any>
}
