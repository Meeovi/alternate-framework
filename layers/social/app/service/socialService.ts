// layers/social/service/socialService.ts

import { usePosts } from '../composables/posts/usePosts'
import { useComments } from '../composables/comments/useComments'
import { useFeeds } from '../composables/feeds/useFeeds'
import { useVibez } from '../composables/vibez/useVibez'
import { useSpaces } from '../composables/spaces/useSpaces'
import { useUser } from '../composables/profiles/useUser'
import { useSocialFederation } from './socialFederation'
import { emitSocialEvent } from '../events/socialEvents'
import {
  canViewPost,
  isShadowBanned,
  shouldSendToModerationQueue,
  type MinimalUser,
  type MinimalPost,
  type VisibilityRule
} from '../permissions/moderation'

const rateBuckets = new Map<string, { count: number; resetAt: number }>()

const rateLimit = (key: string, limit: number, windowMs: number) => {
  const now = Date.now()
  const bucket = rateBuckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (bucket.count >= limit) {
    throw new Error('Rate limit exceeded')
  }

  bucket.count++
}

const checkContentForAbuse = (content: string) => {
  const bannedWords = ['spamword1', 'spamword2']
  const lower = content.toLowerCase()
  for (const word of bannedWords) {
    if (lower.includes(word)) {
      throw new Error('Content violates guidelines')
    }
  }
}

export const useSocialService = () => {
  const posts = usePosts()
  const comments = useComments()
  const feeds = useFeeds()
  const vibez = useVibez()
  const spaces = useSpaces()
  const user = useUser()
  const federation = useSocialFederation()

  const createPost = async (
    data: any,
    actor: MinimalUser,
    visibilityRule?: VisibilityRule
  ): Promise<any> => {
    if (isShadowBanned(actor)) {
      throw new Error('User is shadow banned')
    }

    rateLimit(`post:${actor.id}`, 20, 60_000)
    checkContentForAbuse(data.content)

    const result = await posts.createPost({
      ...data,
      userId: actor.id
    })

    if (shouldSendToModerationQueue(data.content)) {
      await fetch('/api/social/moderation/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'post', id: result.id })
      })
    }

    emitSocialEvent('post:created', result)

    if (data.federationProtocol && data.federationVisibility) {
      await federation.publishPostToFederation(
        { id: result.id, content: result.content, hashtags: result.hashtags },
        data.federationProtocol,
        data.federationVisibility
      )
    }

    return result
  }

  const createComment = async (
    postId: string | number,
    data: any,
    actor: MinimalUser
  ): Promise<any> => {
    if (isShadowBanned(actor)) {
      throw new Error('User is shadow banned')
    }

    rateLimit(`comment:${actor.id}`, 60, 60_000)
    checkContentForAbuse(data.content)

    const result = await comments.createComment(postId, {
      ...data,
      userId: actor.id
    })

    if (shouldSendToModerationQueue(data.content)) {
      await fetch('/api/social/moderation/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'comment', id: result.id })
      })
    }

    emitSocialEvent('comment:created', result)
    return result
  }

  const getVisiblePost = async (
    postId: string | number,
    viewer: MinimalUser | null,
    rule: VisibilityRule,
    ctx: {
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
  ): Promise<any | null> => {
    const post = await posts.getPost(postId)
    const minimalPost: MinimalPost = {
      id: post.id,
      userId: post.userId,
      spaceId: post.spaceId
    }

    if (!canViewPost(viewer, minimalPost, rule, ctx)) {
      return null
    }

    return post
  }

  const muteUser = async (userId: string | number): Promise<any> => {
    const result = await user.muteUser(userId)
    emitSocialEvent('user:muted', result)
    return result
  }

  const blockUser = async (userId: string | number): Promise<any> => {
    const result = await user.blockUser(userId)
    emitSocialEvent('user:blocked', result)
    return result
  }

  const mutePost = async (postId: string | number): Promise<any> => {
    const result = await posts.mutePost(postId)
    emitSocialEvent('post:muted', result)
    return result
  }

  const blockPost = async (postId: string | number): Promise<any> => {
    const result = await posts.blockPost(postId)
    emitSocialEvent('post:blocked', result)
    return result
  }

  const getFederatedPosts = async (opts?: {
    protocol?: 'activitypub' | 'atproto'
    hashtag?: string
    limit?: number
  }) => {
    return federation.getFederatedPosts(opts)
  }

  const getFederatedUserFeed = async (
    userHandle: string,
    opts?: { protocol?: 'activitypub' | 'atproto'; limit?: number }
  ) => {
    return federation.getFederatedUserFeed(userHandle, opts)
  }

  const createFederatedPost = async (payload: any) => {
    checkContentForAbuse(payload.content)
    return federation.createFederatedPost(payload)
  }

  const getHashtagFeed = async (hashtag: string, opts?: any) => {
    return posts.getPostsByHashtag(hashtag, opts)
  }

  const getUserMemories = async (userId: string | number, opts?: any) => {
    return posts.getUserMemories(userId, opts)
  }

  const createPollPost = async (data: any, actor: MinimalUser) => {
    return createPost(
      {
        ...data,
        isPoll: true
      },
      actor
    )
  }

  const votePoll = async (pollId: string | number, optionId: string | number) => {
    return posts.votePoll(pollId, optionId)
  }

  const setBirthday = async (userId: string | number, date: string) => {
    const res = await fetch(`/api/social/user/${userId}/birthday`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    })
    return res.json()
  }

  const getBirthdayMemories = async (userId: string | number) => {
    const res = await fetch(`/api/social/user/${userId}/birthday/memories`)
    return res.json()
  }

  const getLists = async (userId: string | number) => {
    const res = await fetch(`/api/social/user/${userId}/lists`)
    return res.json()
  }

  const createList = async (userId: string | number, name: string) => {
    const res = await fetch(`/api/social/user/${userId}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    return res.json()
  }

  const getRadioChannels = async (genre?: string) => {
    const params = new URLSearchParams(genre ? { genre } : {})
    const res = await fetch(`/api/social/radio/channels?${params.toString()}`)
    return res.json()
  }

  const createRadioChannel = async (data: { name: string; genre: string }) => {
    const res = await fetch('/api/social/radio/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  }

  const getChatThread = async (threadId: string | number) => {
    const res = await fetch(`/api/social/chats/${threadId}`)
    return res.json()
  }

  const sendChatMessage = async (
    threadId: string | number,
    data: { content: string; senderId: string | number }
  ) => {
    checkContentForAbuse(data.content)
    const res = await fetch(`/api/social/chats/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    emitSocialEvent('comment:created', json)
    return json
  }

  return {
    posts,
    comments,
    feeds,
    vibez,
    spaces,
    user,
    createPost,
    createComment,
    getVisiblePost,
    muteUser,
    blockUser,
    mutePost,
    blockPost,
    getFederatedPosts,
    getFederatedUserFeed,
    createFederatedPost,
    getHashtagFeed,
    getUserMemories,
    createPollPost,
    votePoll,
    setBirthday,
    getBirthdayMemories,
    getLists,
    createList,
    getRadioChannels,
    createRadioChannel,
    getChatThread,
    sendChatMessage
  }
}