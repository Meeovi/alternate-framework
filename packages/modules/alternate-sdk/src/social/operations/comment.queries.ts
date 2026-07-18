import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
const gql = (s: TemplateStringsArray): any => s[0]

export type GetCommentsQueryResponse = {
  comments: Array<{
    id: string
    postId: string
    authorId: string
    content: string
    createdAt: string
    parentId?: string
  }>
}

export type GetCommentsQueryVariables = {
  postId: string
  limit?: number
  offset?: number
}

export type GetThreadQueryResponse = {
  thread: {
    id: string
    postId: string
    authorId: string
    content: string
    createdAt: string
    parentId?: string
    replies: Array<{
      id: string
      postId: string
      authorId: string
      content: string
      createdAt: string
    }>
  } | null
}

export type GetThreadQueryVariables = {
  commentId: string
}

export type CreateCommentMutationResponse = {
  createComment: {
    id: string
    postId: string
    authorId: string
    content: string
    createdAt: string
  } | null
}

export type CreateCommentMutationVariables = {
  postId: string
  input: {
    content: string
    parentId?: string
  }
}

export type ReplyToCommentMutationResponse = {
  replyToComment: {
    id: string
    postId: string
    authorId: string
    content: string
    createdAt: string
    parentId?: string
  } | null
}

export type ReplyToCommentMutationVariables = {
  commentId: string
  input: {
    content: string
  }
}

export type DeleteCommentMutationResponse = {
  deleteComment: { success: boolean }
}

export type DeleteCommentMutationVariables = {
  commentId: string
}

export type ReactToCommentMutationResponse = {
  reactToComment: { success: boolean }
}

export type ReactToCommentMutationVariables = {
  commentId: string
  reaction: string
}

export type ReportCommentMutationResponse = {
  reportComment: { success: boolean }
}

export type ReportCommentMutationVariables = {
  commentId: string
  reason: string
}

export const GetCommentsQuery: TypedDocumentNode<GetCommentsQueryResponse, GetCommentsQueryVariables> = gql`
  query GetComments($postId: ID!, $limit: Int, $offset: Int) {
    comments(postId: $postId, limit: $limit, offset: $offset) {
      id
      postId
      authorId
      content
      createdAt
      parentId
    }
  }
`

export const GetThreadQuery: TypedDocumentNode<GetThreadQueryResponse, GetThreadQueryVariables> = gql`
  query GetThread($commentId: ID!) {
    thread(commentId: $commentId) {
      id
      postId
      authorId
      content
      createdAt
      parentId
      replies {
        id
        postId
        authorId
        content
        createdAt
      }
    }
  }
`

export const CreateCommentMutation: TypedDocumentNode<CreateCommentMutationResponse, CreateCommentMutationVariables> = gql`
  mutation CreateComment($postId: ID!, $input: CreateCommentInput!) {
    createComment(postId: $postId, input: $input) {
      id
      postId
      authorId
      content
      createdAt
    }
  }
`

export const ReplyToCommentMutation: TypedDocumentNode<ReplyToCommentMutationResponse, ReplyToCommentMutationVariables> = gql`
  mutation ReplyToComment($commentId: ID!, $input: CreateCommentInput!) {
    replyToComment(commentId: $commentId, input: $input) {
      id
      postId
      authorId
      content
      createdAt
      parentId
    }
  }
`

export const DeleteCommentMutation: TypedDocumentNode<DeleteCommentMutationResponse, DeleteCommentMutationVariables> = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) { success }
  }
`

export const ReactToCommentMutation: TypedDocumentNode<ReactToCommentMutationResponse, ReactToCommentMutationVariables> = gql`
  mutation ReactToComment($commentId: ID!, $reaction: String!) {
    reactToComment(commentId: $commentId, reaction: $reaction) { success }
  }
`

export const ReportCommentMutation: TypedDocumentNode<ReportCommentMutationResponse, ReportCommentMutationVariables> = gql`
  mutation ReportComment($commentId: ID!, $reason: String!) {
    reportComment(commentId: $commentId, reason: $reason) { success }
  }
`