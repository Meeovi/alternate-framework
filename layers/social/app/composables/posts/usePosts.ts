import type { SocialDriverContract, Post, CreatePostInput, PostFilters } from '@mframework/alternate-sdk/contracts/social'

const useSocialDriver = (): SocialDriverContract => {
  const nuxtApp = useNuxtApp()
  return nuxtApp?.$sdk?.social ?? {} as SocialDriverContract
}

export const usePosts = () => {
  const social = useSocialDriver()

  const getPosts = async (opts?: PostFilters): Promise<Post[]> => {
    return social.getPosts?.(opts) ?? []
  }

  const getPost = async (postId: string | number, opts?: PostFilters): Promise<Post | null> => {
    return social.getPost?.(String(postId), opts) ?? null
  }

  const createPost = async (data: CreatePostInput): Promise<Post> => {
    return social.createPost?.(data) as Promise<Post>
  }

  const updatePost = async (
    postId: string | number,
    data: Partial<CreatePostInput>
  ): Promise<Post> => {
    return social.updatePost?.(String(postId), data) as Promise<Post>
  }

  const deletePost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.deletePost?.(String(postId)) ?? { success: false }
  }

  const repost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.repost?.(String(postId)) ?? { success: false }
  }

  const unrepost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.unrepost?.(String(postId)) ?? { success: false }
  }

  const isReposted = async (postId: string | number, opts?: PostFilters): Promise<{ reposted: boolean }> => {
    return social.isReposted?.(String(postId), opts) ?? { reposted: false }
  }

  const toggleRepost = async (postId: string | number, opts?: PostFilters): Promise<{ success: boolean }> => {
    const exists = await isReposted(postId, opts)
    if (exists.reposted) {
      return unrepost(postId)
    }
    return repost(postId)
  }

  const getReposts = async (postId: string | number, opts?: PostFilters): Promise<Post[]> => {
    return social.getReposts?.(String(postId), opts) ?? []
  }

  const mutePost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.mutePost?.(String(postId)) ?? { success: false }
  }

  const blockPost = async (postId: string | number): Promise<{ success: boolean }> => {
    return social.blockPost?.(String(postId)) ?? { success: false }
  }

  const getPostsByHashtag = async (hashtag: string, opts?: PostFilters): Promise<Post[]> => {
    return social.getPosts?.({ ...(opts ?? {}), hashtag }) ?? []
  }

  const getUserMemories = async (userId: string | number, opts?: PostFilters): Promise<Post[]> => {
    return social.getUserFeed?.(String(userId), { ...(opts ?? {}), type: 'memories' }) ?? []
  }

  const createPoll = async (data: CreatePostInput): Promise<Post> => {
    return social.createPost?.({ ...data, isPoll: true }) as Promise<Post>
  }

  const votePoll = async (pollId: string | number, optionId: string | number): Promise<{ success: boolean }> => {
    return social.reactToComment?.(String(pollId), String(optionId)) ?? { success: false }
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