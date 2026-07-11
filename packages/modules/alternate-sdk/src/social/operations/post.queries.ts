import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { gql } from '@mframework/adapter-gateway/client'

export type GetPostsQueryResponse = {
  posts: Array<{
    id: string
    authorId: string
    content: string
    createdAt: string
    spaceId?: string
    hashtags: string[]
    isPoll: boolean
    isMemory: boolean
    isRadio: boolean
  }>
}

export type GetPostsQueryVariables = {
  filter?: {
    search?: string
    spaceId?: string
    limit?: number
  }
}

export type GetPostQueryResponse = {
  post: {
    id: string
    authorId: string
    content: string
    createdAt: string
    spaceId?: string
    hashtags: string[]
    isPoll: boolean
    isMemory: boolean
    isRadio: boolean
    pollOptions?: Array<{
      id: string
      text: string
      voteCount: number
    }>
  } | null
}

export type GetPostQueryVariables = {
  id: string
}

export type CreatePostMutationResponse = {
  createPost: {
    id: string
    authorId: string
    content: string
    createdAt: string
  } | null
}

export type CreatePostMutationVariables = {
  input: {
    content: string
    spaceId?: string
    hashtags?: string[]
  }
}

export type UpdatePostMutationResponse = {
  updatePost: {
    id: string
    authorId: string
    content: string
    createdAt: string
  } | null
}

export type UpdatePostMutationVariables = {
  id: string
  input: {
    content?: string
    hashtags?: string[]
  }
}

export type DeletePostMutationResponse = {
  deletePost: { success: boolean }
}

export type DeletePostMutationVariables = {
  id: string
}

export type RepostMutationResponse = {
  repost: { success: boolean }
}

export type RepostMutationVariables = {
  postId: string
}

export type UnrepostMutationResponse = {
  unrepost: { success: boolean }
}

export type UnrepostMutationVariables = {
  postId: string
}

export type IsRepostedQueryResponse = {
  isReposted: { reposted: boolean }
}

export type IsRepostedQueryVariables = {
  postId: string
}

export type GetRepostsQueryResponse = {
  reposts: Array<{
    id: string
    authorId: string
    content: string
    createdAt: string
  }>
}

export type GetRepostsQueryVariables = {
  postId: string
  filter?: {
    search?: string
    limit?: number
  }
}

export type MutePostMutationResponse = {
  mutePost: { success: boolean }
}

export type MutePostMutationVariables = {
  postId: string
}

export type BlockPostMutationResponse = {
  blockPost: { success: boolean }
}

export type BlockPostMutationVariables = {
  postId: string
}

export const GetPostsQuery: TypedDocumentNode<GetPostsQueryResponse, GetPostsQueryVariables> = gql`
  query GetPosts($filter: PostFilter) {
    posts(filter: $filter) {
      id
      authorId
      content
      createdAt
      spaceId
      hashtags
      isPoll
      isMemory
      isRadio
    }
  }
`

export const GetPostQuery: TypedDocumentNode<GetPostQueryResponse, GetPostQueryVariables> = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      authorId
      content
      createdAt
      spaceId
      hashtags
      isPoll
      isMemory
      isRadio
      pollOptions {
        id
        text
        voteCount
      }
    }
  }
`

export const CreatePostMutation: TypedDocumentNode<CreatePostMutationResponse, CreatePostMutationVariables> = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      authorId
      content
      createdAt
    }
  }
`

export const UpdatePostMutation: TypedDocumentNode<UpdatePostMutationResponse, UpdatePostMutationVariables> = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      authorId
      content
      createdAt
    }
  }
`

export const DeletePostMutation: TypedDocumentNode<DeletePostMutationResponse, DeletePostMutationVariables> = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) { success }
  }
`

export const RepostMutation: TypedDocumentNode<RepostMutationResponse, RepostMutationVariables> = gql`
  mutation Repost($postId: ID!) {
    repost(postId: $postId) { success }
  }
`

export const UnrepostMutation: TypedDocumentNode<UnrepostMutationResponse, UnrepostMutationVariables> = gql`
  mutation Unrepost($postId: ID!) {
    unrepost(postId: $postId) { success }
  }
`

export const IsRepostedQuery: TypedDocumentNode<IsRepostedQueryResponse, IsRepostedQueryVariables> = gql`
  query IsReposted($postId: ID!) {
    isReposted(postId: $postId) { reposted }
  }
`

export const GetRepostsQuery: TypedDocumentNode<GetRepostsQueryResponse, GetRepostsQueryVariables> = gql`
  query GetReposts($postId: ID!, $filter: PostFilter) {
    reposts(postId: $postId, filter: $filter) {
      id
      authorId
      content
      createdAt
    }
  }
`

export const MutePostMutation: TypedDocumentNode<MutePostMutationResponse, MutePostMutationVariables> = gql`
  mutation MutePost($postId: ID!) {
    mutePost(postId: $postId) { success }
  }
`

export const BlockPostMutation: TypedDocumentNode<BlockPostMutationResponse, BlockPostMutationVariables> = gql`
  mutation BlockPost($postId: ID!) {
    blockPost(postId: $postId) { success }
  }
`