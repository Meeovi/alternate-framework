import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { gql } from '@mframework/adapter-gateway/client'

export type GetFeedQueryResponse = {
  feed: Array<{
    id: string
    authorId: string
    content: string
    createdAt: string
    spaceId?: string
    hashtags: string[]
  }>
}

export type GetFeedQueryVariables = {
  type: string
  filter?: {
    search?: string
    spaceId?: string
    limit?: number
  }
}

export type GetUserFeedQueryResponse = {
  userFeed: Array<{
    id: string
    authorId: string
    content: string
    createdAt: string
    hashtags: string[]
  }>
}

export type GetUserFeedQueryVariables = {
  userId: string
  filter?: {
    search?: string
    spaceId?: string
    limit?: number
  }
}

export type GetNotificationsQueryResponse = {
  notifications: Array<{
    id: string
    type: string
    actorId: string
    read: boolean
    createdAt: string
  }>
}

export type GetNotificationsQueryVariables = {
  limit?: number
  offset?: number
  unreadOnly?: boolean
}

export type MarkNotificationReadMutationResponse = {
  markNotificationRead: { success: boolean }
}

export type MarkNotificationReadMutationVariables = {
  notificationId: string
}

export const GetFeedQuery: TypedDocumentNode<GetFeedQueryResponse, GetFeedQueryVariables> = gql`
  query GetFeed($type: String!, $filter: PostFilter) {
    feed(type: $type, filter: $filter) {
      id
      authorId
      content
      createdAt
      hashtags
    }
  }
`

export const GetUserFeedQuery: TypedDocumentNode<GetUserFeedQueryResponse, GetUserFeedQueryVariables> = gql`
  query GetUserFeed($userId: ID!, $filter: PostFilter) {
    userFeed(userId: $userId, filter: $filter) {
      id
      authorId
      content
      createdAt
      hashtags
    }
  }
`

export const GetNotificationsQuery: TypedDocumentNode<GetNotificationsQueryResponse, GetNotificationsQueryVariables> = gql`
  query GetNotifications($limit: Int, $offset: Int, $unreadOnly: Boolean) {
    notifications(limit: $limit, offset: $offset, unreadOnly: $unreadOnly) {
      id
      type
      actorId
      read
      createdAt
    }
  }
`

export const MarkNotificationReadMutation: TypedDocumentNode<MarkNotificationReadMutationResponse, MarkNotificationReadMutationVariables> = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) { success }
  }
`