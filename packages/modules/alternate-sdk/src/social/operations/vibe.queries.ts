import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
const gql = (s: TemplateStringsArray): any => s[0]

export type GetVibezQueryResponse = {
  vibez: Array<{
    id: string
    url: string
    authorId: string
    createdAt: string
  }>
}

export type GetVibezQueryVariables = {
  limit?: number
}

export type UploadVibeMutationResponse = {
  uploadVibe: {
    id: string
    url: string
    authorId: string
    createdAt: string
  } | null
}

export type UploadVibeMutationVariables = {
  file: File
}

export type LikeVibeMutationResponse = {
  likeVibe: { success: boolean }
}

export type LikeVibeMutationVariables = {
  vibeId: string
}

export type GetVibeQueryResponse = {
  vibe: {
    id: string
    url: string
    authorId: string
    createdAt: string
  } | null
}

export type GetVibeQueryVariables = {
  vibeId: string
}

export type StartLiveMutationResponse = {
  startLive: {
    id: string
    title: string
    viewerCount: number
    isLive: boolean
  } | null
}

export type StartLiveMutationVariables = {
  input?: {
    title?: string
    spaceId?: string
  }
}

export type StopLiveMutationResponse = {
  stopLive: { success: boolean }
}

export type StopLiveMutationVariables = {
  liveId: string
}

export type GetLiveQueryResponse = {
  live: {
    id: string
    title: string
    viewerCount: number
    isLive: boolean
  } | null
}

export type GetLiveQueryVariables = {
  liveId: string
}

export type GetLiveViewersQueryResponse = {
  liveViewers: { count: number }
}

export type GetLiveViewersQueryVariables = {
  liveId: string
}

export const GetVibezQuery: TypedDocumentNode<GetVibezQueryResponse, GetVibezQueryVariables> = gql`
  query GetVibez($limit: Int) {
    vibez(limit: $limit) {
      id
      url
      authorId
      createdAt
    }
  }
`

export const UploadVibeMutation: TypedDocumentNode<UploadVibeMutationResponse, UploadVibeMutationVariables> = gql`
  mutation UploadVibe($file: Upload!) {
    uploadVibe(file: $file) {
      id
      url
      authorId
      createdAt
    }
  }
`

export const LikeVibeMutation: TypedDocumentNode<LikeVibeMutationResponse, LikeVibeMutationVariables> = gql`
  mutation LikeVibe($vibeId: ID!) {
    likeVibe(vibeId: $vibeId) { success }
  }
`

export const GetVibeQuery: TypedDocumentNode<GetVibeQueryResponse, GetVibeQueryVariables> = gql`
  query GetVibe($vibeId: ID!) {
    vibe(vibeId: $vibeId) {
      id
      url
      authorId
      createdAt
    }
  }
`

export const StartLiveMutation: TypedDocumentNode<StartLiveMutationResponse, StartLiveMutationVariables> = gql`
  mutation StartLive($input: StartLiveInput) {
    startLive(input: $input) {
      id
      title
      viewerCount
      isLive
    }
  }
`

export const StopLiveMutation: TypedDocumentNode<StopLiveMutationResponse, StopLiveMutationVariables> = gql`
  mutation StopLive($liveId: ID!) {
    stopLive(liveId: $liveId) { success }
  }
`

export const GetLiveQuery: TypedDocumentNode<GetLiveQueryResponse, GetLiveQueryVariables> = gql`
  query GetLive($liveId: ID!) {
    live(liveId: $liveId) {
      id
      title
      viewerCount
      isLive
    }
  }
`

export const GetLiveViewersQuery: TypedDocumentNode<GetLiveViewersQueryResponse, GetLiveViewersQueryVariables> = gql`
  query GetLiveViewers($liveId: ID!) {
    liveViewers(liveId: $liveId) { count }
  }
`