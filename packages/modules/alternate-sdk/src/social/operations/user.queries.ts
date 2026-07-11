import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { gql } from '@mframework/adapter-gateway/client'

export type GetUserQueryResponse = {
  user: {
    id: string
    name: string
    username: string
    avatar?: string
  } | null
}

export type GetUserQueryVariables = {
  userId: string
}

export type SearchUsersQueryResponse = {
  searchUsers: Array<{
    id: string
    name: string
    username: string
    avatar?: string
  }>
}

export type SearchUsersQueryVariables = {
  query: string
}

export type FollowMutationResponse = {
  follow: { success: boolean }
}

export type FollowMutationVariables = {
  userId: string
}

export type UnfollowMutationResponse = {
  unfollow: { success: boolean }
}

export type UnfollowMutationVariables = {
  userId: string
}

export type GetFollowersQueryResponse = {
  followers: Array<{
    id: string
    name: string
    username: string
    avatar?: string
  }>
}

export type GetFollowersQueryVariables = {
  userId: string
  limit?: number
}

export type GetFollowingQueryResponse = {
  following: Array<{
    id: string
    name: string
    username: string
    avatar?: string
  }>
}

export type GetFollowingQueryVariables = {
  userId: string
  limit?: number
}

export const GetUserQuery: TypedDocumentNode<GetUserQueryResponse, GetUserQueryVariables> = gql`
  query GetUser($userId: ID!) {
    user(userId: $userId) {
      id
      name
      username
      avatar
    }
  }
`

export const SearchUsersQuery: TypedDocumentNode<SearchUsersQueryResponse, SearchUsersQueryVariables> = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      username
      avatar
    }
  }
`

export const FollowMutation: TypedDocumentNode<FollowMutationResponse, FollowMutationVariables> = gql`
  mutation Follow($userId: ID!) {
    follow(userId: $userId) { success }
  }
`

export const UnfollowMutation: TypedDocumentNode<UnfollowMutationResponse, UnfollowMutationVariables> = gql`
  mutation Unfollow($userId: ID!) {
    unfollow(userId: $userId) { success }
  }
`

export const GetFollowersQuery: TypedDocumentNode<GetFollowersQueryResponse, GetFollowersQueryVariables> = gql`
  query GetFollowers($userId: ID!, $limit: Int) {
    followers(userId: $userId, limit: $limit) {
      id
      name
      username
      avatar
    }
  }
`

export const GetFollowingQuery: TypedDocumentNode<GetFollowingQueryResponse, GetFollowingQueryVariables> = gql`
  query GetFollowing($userId: ID!, $limit: Int) {
    following(userId: $userId, limit: $limit) {
      id
      name
      username
      avatar
    }
  }
`