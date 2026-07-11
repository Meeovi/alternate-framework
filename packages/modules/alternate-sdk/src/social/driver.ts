import type { SocialDriverContract, Post, Comment, Space, Vibe, LiveStream, UserProfile, PostFilters, CreatePostInput, CreateCommentInput, CreateSpaceInput, StartLiveInput, Notification } from '../contracts/social.js'
import { executeMesh } from '@mframework/adapter-gateway/client'
import * as PostQueries from './operations/post.queries.js'
import * as CommentQueries from './operations/comment.queries.js'
import * as FeedQueries from './operations/feed.queries.js'
import * as SpaceQueries from './operations/space.queries.js'
import * as VibeQueries from './operations/vibe.queries.js'
import * as UserQueries from './operations/user.queries.js'

class SocialMeshDriver implements SocialDriverContract {
  posts = {
    getPosts: async (filters: PostFilters = {}): Promise<Post[]> => {
      const result = await executeMesh(PostQueries.GetPostsQuery, { filter: filters })
      return result?.posts ?? []
    },

    getPost: async (id: string): Promise<Post | null> => {
      const result = await executeMesh(PostQueries.GetPostQuery, { id })
      return result?.post ?? null
    },

    createPost: async (input: CreatePostInput): Promise<Post> => {
      const result = await executeMesh(PostQueries.CreatePostMutation, { input })
      if (!result?.createPost) {
        throw new Error('MFramework Driver Exception: Failed to create post downstream.')
      }
      return result.createPost
    },

    updatePost: async (id: string, input: Partial<CreatePostInput>): Promise<Post> => {
      const result = await executeMesh(PostQueries.UpdatePostMutation, { id, input })
      if (!result?.updatePost) {
        throw new Error('MFramework Driver Exception: Failed to update post downstream.')
      }
      return result.updatePost
    },

    deletePost: async (id: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(PostQueries.DeletePostMutation, { id })
      return result?.deletePost ?? { success: false }
    },

    repost: async (postId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(PostQueries.RepostMutation, { postId })
      return result?.repost ?? { success: false }
    },

    unrepost: async (postId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(PostQueries.UnrepostMutation, { postId })
      return result?.unrepost ?? { success: false }
    },

    isReposted: async (postId: string): Promise<{ reposted: boolean }> => {
      const result = await executeMesh(PostQueries.IsRepostedQuery, { postId })
      return result?.isReposted ?? { reposted: false }
    },

    getReposts: async (postId: string, opts?: PostFilters): Promise<Post[]> => {
      const result = await executeMesh(PostQueries.GetRepostsQuery, { postId, filter: opts })
      return result?.reposts ?? []
    },

    mutePost: async (postId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(PostQueries.MutePostMutation, { postId })
      return result?.mutePost ?? { success: false }
    },

    blockPost: async (postId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(PostQueries.BlockPostMutation, { postId })
      return result?.blockPost ?? { success: false }
    }
  }

  comments = {
    getComments: async (postId: string, opts?: { limit?: number; offset?: number }): Promise<Comment[]> => {
      const result = await executeMesh(CommentQueries.GetCommentsQuery, { postId, limit: opts?.limit, offset: opts?.offset })
      return result?.comments ?? []
    },

    getThread: async (commentId: string): Promise<Comment | null> => {
      const result = await executeMesh(CommentQueries.GetThreadQuery, { commentId })
      return result?.thread ?? null
    },

    createComment: async (postId: string, input: CreateCommentInput): Promise<Comment> => {
      const result = await executeMesh(CommentQueries.CreateCommentMutation, { postId, input })
      if (!result?.createComment) {
        throw new Error('MFramework Driver Exception: Failed to create comment downstream.')
      }
      return result.createComment
    },

    replyToComment: async (commentId: string, input: CreateCommentInput): Promise<Comment> => {
      const result = await executeMesh(CommentQueries.ReplyToCommentMutation, { commentId, input })
      if (!result?.replyToComment) {
        throw new Error('MFramework Driver Exception: Failed to reply to comment downstream.')
      }
      return result.replyToComment
    },

    deleteComment: async (commentId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(CommentQueries.DeleteCommentMutation, { commentId })
      return result?.deleteComment ?? { success: false }
    },

    reactToComment: async (commentId: string, reaction: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(CommentQueries.ReactToCommentMutation, { commentId, reaction })
      return result?.reactToComment ?? { success: false }
    },

    reportComment: async (commentId: string, reason: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(CommentQueries.ReportCommentMutation, { commentId, reason })
      return result?.reportComment ?? { success: false }
    }
  }

  feed = {
    getFeed: async (type: string, opts?: PostFilters): Promise<Post[]> => {
      const result = await executeMesh(FeedQueries.GetFeedQuery, { type, filter: opts })
      return result?.feed ?? []
    },

    getUserFeed: async (userId: string, opts?: PostFilters): Promise<Post[]> => {
      const result = await executeMesh(FeedQueries.GetUserFeedQuery, { userId, filter: opts })
      return result?.userFeed ?? []
    },

    getNotifications: async (opts?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<Notification[]> => {
      const result = await executeMesh(FeedQueries.GetNotificationsQuery, { limit: opts?.limit, offset: opts?.offset, unreadOnly: opts?.unreadOnly })
      return result?.notifications ?? []
    },

    markNotificationRead: async (notificationId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(FeedQueries.MarkNotificationReadMutation, { notificationId })
      return result?.markNotificationRead ?? { success: false }
    }
  }

  spaces = {
    getSpaces: async (opts?: { limit?: number; query?: string }): Promise<Space[]> => {
      const result = await executeMesh(SpaceQueries.GetSpacesQuery, { limit: opts?.limit, query: opts?.query })
      return result?.spaces ?? []
    },

    getSpace: async (id: string): Promise<Space | null> => {
      const result = await executeMesh(SpaceQueries.GetSpaceQuery, { id })
      return result?.space ?? null
    },

    createSpace: async (input: CreateSpaceInput): Promise<Space> => {
      const result = await executeMesh(SpaceQueries.CreateSpaceMutation, { input })
      if (!result?.createSpace) {
        throw new Error('MFramework Driver Exception: Failed to create space downstream.')
      }
      return result.createSpace
    },

    joinSpace: async (spaceId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(SpaceQueries.JoinSpaceMutation, { spaceId })
      return result?.joinSpace ?? { success: false }
    },

    leaveSpace: async (spaceId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(SpaceQueries.LeaveSpaceMutation, { spaceId })
      return result?.leaveSpace ?? { success: false }
    },

    getSpaceMembers: async (spaceId: string, opts?: { limit?: number }): Promise<UserProfile[]> => {
      const result = await executeMesh(SpaceQueries.GetSpaceMembersQuery, { spaceId, limit: opts?.limit })
      return result?.members ?? []
    },

    getSpacePosts: async (spaceId: string, opts?: PostFilters): Promise<Post[]> => {
      const result = await executeMesh(SpaceQueries.GetSpacePostsQuery, { spaceId, filter: opts })
      return result?.spacePosts ?? []
    }
  }

  vibez = {
    getVibez: async (opts?: { limit?: number }): Promise<Vibe[]> => {
      const result = await executeMesh(VibeQueries.GetVibezQuery, { limit: opts?.limit })
      return result?.vibez ?? []
    },

    uploadVibe: async (data: FormData): Promise<Vibe> => {
      const file = data.get('file') as File | null
      if (!file) {
        throw new Error('MFramework Driver Exception: No file provided for vibe upload.')
      }
      const result = await executeMesh(VibeQueries.UploadVibeMutation, { file })
      if (!result?.uploadVibe) {
        throw new Error('MFramework Driver Exception: Failed to upload vibe downstream.')
      }
      return result.uploadVibe
    },

    likeVibe: async (vibeId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(VibeQueries.LikeVibeMutation, { vibeId })
      return result?.likeVibe ?? { success: false }
    },

    getVibe: async (vibeId: string): Promise<Vibe | null> => {
      const result = await executeMesh(VibeQueries.GetVibeQuery, { vibeId })
      return result?.vibe ?? null
    },

    startLive: async (opts?: StartLiveInput): Promise<LiveStream> => {
      const result = await executeMesh(VibeQueries.StartLiveMutation, { input: opts })
      if (!result?.startLive) {
        throw new Error('MFramework Driver Exception: Failed to start live stream downstream.')
      }
      return result.startLive
    },

    stopLive: async (liveId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(VibeQueries.StopLiveMutation, { liveId })
      return result?.stopLive ?? { success: false }
    },

    getLive: async (liveId: string): Promise<LiveStream | null> => {
      const result = await executeMesh(VibeQueries.GetLiveQuery, { liveId })
      return result?.live ?? null
    },

    getLiveViewers: async (liveId: string): Promise<{ count: number }> => {
      const result = await executeMesh(VibeQueries.GetLiveViewersQuery, { liveId })
      return result?.liveViewers ?? { count: 0 }
    }
  }

  async getUser(userId: string): Promise<UserProfile | null> {
    const result = await executeMesh(UserQueries.GetUserQuery, { userId })
    return result?.user ?? null
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    const result = await executeMesh(UserQueries.SearchUsersQuery, { query })
    return result?.searchUsers ?? []
  }

  async follow(userId: string): Promise<{ success: boolean }> {
    const result = await executeMesh(UserQueries.FollowMutation, { userId })
    return result?.follow ?? { success: false }
  }

  async unfollow(userId: string): Promise<{ success: boolean }> {
    const result = await executeMesh(UserQueries.UnfollowMutation, { userId })
    return result?.unfollow ?? { success: false }
  }

  async getFollowers(userId: string, opts?: { limit?: number }): Promise<UserProfile[]> {
    const result = await executeMesh(UserQueries.GetFollowersQuery, { userId, limit: opts?.limit })
    return result?.followers ?? []
  }

  async getFollowing(userId: string, opts?: { limit?: number }): Promise<UserProfile[]> {
    const result = await executeMesh(UserQueries.GetFollowingQuery, { userId, limit: opts?.limit })
    return result?.following ?? []
  }
}

export default SocialMeshDriver