// layers/social/models/socialModels.ts

export interface SocialUser {
  id: string | number
  username: string
  name?: string
  avatarUrl?: string
  bio?: string
}

export interface SocialPost {
  id: string | number
  userId: string | number
  content: string
  createdAt: string
  updatedAt?: string
  spaceId?: string | number
}

export interface SocialComment {
  id: string | number
  postId: string | number
  userId: string | number
  content: string
  parentId?: string | number
  createdAt: string
}

export interface SocialSpace {
  id: string | number
  name: string
  description?: string
  ownerId: string | number
}

export interface SocialVibe {
  id: string | number
  userId: string | number
  videoUrl: string
  thumbnailUrl?: string
  createdAt: string
}

export interface SocialLive {
  id: string | number
  hostId: string | number
  startedAt: string
  endedAt?: string
  spaceId?: string | number
}