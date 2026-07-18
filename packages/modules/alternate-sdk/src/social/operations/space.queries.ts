import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
const gql = (s: TemplateStringsArray): any => s[0]

export type GetSpacesQueryResponse = {
  spaces: Array<{
    id: string
    name: string
    slug: string
    description: string
    memberCount: number
    createdAt: string
  }>
}

export type GetSpacesQueryVariables = {
  limit?: number
  query?: string
}

export type GetSpaceQueryResponse = {
  space: {
    id: string
    name: string
    slug: string
    description: string
    memberCount: number
    createdAt: string
  } | null
}

export type GetSpaceQueryVariables = {
  id: string
}

export type CreateSpaceMutationResponse = {
  createSpace: {
    id: string
    name: string
    slug: string
  } | null
}

export type CreateSpaceMutationVariables = {
  input: {
    name: string
    slug: string
    description?: string
  }
}

export type JoinSpaceMutationResponse = {
  joinSpace: { success: boolean }
}

export type JoinSpaceMutationVariables = {
  spaceId: string
}

export type LeaveSpaceMutationResponse = {
  leaveSpace: { success: boolean }
}

export type LeaveSpaceMutationVariables = {
  spaceId: string
}

export type GetSpaceMembersQueryResponse = {
  members: Array<{
    id: string
    name: string
    username: string
    avatar?: string
  }>
}

export type GetSpaceMembersQueryVariables = {
  spaceId: string
  limit?: number
}

export type GetSpacePostsQueryResponse = {
  spacePosts: Array<{
    id: string
    authorId: string
    content: string
    createdAt: string
    hashtags: string[]
  }>
}

export type GetSpacePostsQueryVariables = {
  spaceId: string
  filter?: {
    search?: string
    limit?: number
  }
}

export const GetSpacesQuery: TypedDocumentNode<GetSpacesQueryResponse, GetSpacesQueryVariables> = gql`
  query GetSpaces($limit: Int, $query: String) {
    spaces(limit: $limit, query: $query) {
      id
      name
      slug
      description
      memberCount
      createdAt
    }
  }
`

export const GetSpaceQuery: TypedDocumentNode<GetSpaceQueryResponse, GetSpaceQueryVariables> = gql`
  query GetSpace($id: ID!) {
    space(id: $id) {
      id
      name
      slug
      description
      memberCount
      createdAt
    }
  }
`

export const CreateSpaceMutation: TypedDocumentNode<CreateSpaceMutationResponse, CreateSpaceMutationVariables> = gql`
  mutation CreateSpace($input: CreateSpaceInput!) {
    createSpace(input: $input) {
      id
      name
      slug
    }
  }
`

export const JoinSpaceMutation: TypedDocumentNode<JoinSpaceMutationResponse, JoinSpaceMutationVariables> = gql`
  mutation JoinSpace($spaceId: ID!) {
    joinSpace(spaceId: $spaceId) { success }
  }
`

export const LeaveSpaceMutation: TypedDocumentNode<LeaveSpaceMutationResponse, LeaveSpaceMutationVariables> = gql`
  mutation LeaveSpace($spaceId: ID!) {
    leaveSpace(spaceId: $spaceId) { success }
  }
`

export const GetSpaceMembersQuery: TypedDocumentNode<GetSpaceMembersQueryResponse, GetSpaceMembersQueryVariables> = gql`
  query GetSpaceMembers($spaceId: ID!, $limit: Int) {
    members(spaceId: $spaceId, limit: $limit) {
      id
      name
      username
      avatar
    }
  }
`

export const GetSpacePostsQuery: TypedDocumentNode<GetSpacePostsQueryResponse, GetSpacePostsQueryVariables> = gql`
  query GetSpacePosts($spaceId: ID!, $filter: PostFilter) {
    spacePosts(spaceId: $spaceId, filter: $filter) {
      id
      authorId
      content
      createdAt
      hashtags
    }
  }
`