import type { SocialDriverContract, Post, CreatePostInput, PostFilters } from 'alternate-sdk/contracts'
import { useSocialDriver } from '../useSocialDriver'

export const usePosts = () => {
  const social = useSocialDriver()

  const getPosts = async (opts?: PostFilters): Promise<Post[]> => {
    return social.posts.getPosts?.(opts) ?? []
  }

  // SocialDriver.getPost takes only an id per the contract — no filters param.
  const getPost = async (postId: string | number): Promise<Post | null> => {
    return social.posts.getPost?.(String(postId)) ?? null
  }

  const createPost = async (data: CreatePostInput): Promise<Post> => {
    return social.posts.createPost?.(data) as Promise<Post>
  }

  const updatePost = async (
    postId: string | number,
    data: Partial<CreatePostInput>
  ): Promise<Post> => {
    return social.posts.updatePost?.(String(postId), data) as Promise<Post>
  }

  const deletePost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.posts.deletePost?.(String(postId)) ?? { success: false }
  }

  const repost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.posts.repost?.(String(postId)) ?? { success: false }
  }

  const unrepost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.posts.unrepost?.(String(postId)) ?? { success: false }
  }

  // SocialDriver.isReposted takes only a postId per the contract.
  const isReposted = async (postId: string | number): Promise<{ reposted: boolean }> => {
    return social.posts.isReposted?.(String(postId)) ?? { reposted: false }
  }

  const toggleRepost = async (postId: string | number): Promise<{ success: boolean }> => {
    const exists = await isReposted(postId)
    if (exists.reposted) {
      return unrepost(postId)
    }
    return repost(postId)
  }

  const getReposts = async (postId: string | number, opts?: PostFilters): Promise<Post[]> => {
    return social.posts.getReposts?.(String(postId), opts) ?? []
  }

  const mutePost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.posts.mutePost?.(String(postId)) ?? { success: false }
  }

  const blockPost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.posts.blockPost?.(String(postId)) ?? { success: false }
  }

  const getPostsByHashtag = async (hashtag: string, opts?: PostFilters): Promise<Post[]> => {
    return social.posts.getPosts?.({ ...(opts ?? {}), hashtag }) ?? []
  }

  const getUserMemories = async (userId: string | number, opts?: PostFilters): Promise<Post[]> => {
    return social.feed.getUserFeed?.(String(userId), { ...(opts ?? {}), type: 'memories' }) ?? []
  }

  const createPoll = async (data: CreatePostInput): Promise<Post> => {
    return social.posts.createPost?.({ ...data, isPoll: true }) as Promise<Post>
  }

  const votePoll = async (pollId: string | number, optionId: string | number): Promise<{ success: boolean }> => {
    return social.comments.reactToComment?.(String(pollId), String(optionId)) ?? { success: false }
  }

  return {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    repost,
    unrepost,
    isReposted,
    toggleRepost,
    getReposts,
    mutePost,
    blockPost,
    getPostsByHashtag,
    getUserMemories,
    createPoll,
    votePoll
  }
}
