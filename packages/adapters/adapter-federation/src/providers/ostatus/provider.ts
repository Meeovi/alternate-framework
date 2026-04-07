import { encodeSalmonEnvelope } from './salmon'
import { buildWebsubSubscribeRequest } from './websub'

export type OStatusProfile = {
  id: string
  handle: string
  url?: string
  salmonEndpoint?: string
  hub?: string
}

export type OStatusPost = {
  id: string
  protocol: 'ostatus'
  author: string
  content: string
  createdAt: string
  url?: string
  envelope: string
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function normalizeOStatusProfile(input: Record<string, unknown>): OStatusProfile {
  return {
    id: asString(input.id) || asString(input.url),
    handle: asString(input.handle) || asString(input.preferredUsername),
    url: asString(input.url) || undefined,
    salmonEndpoint: asString(input.salmonEndpoint) || undefined,
    hub: asString(input.hub) || undefined,
  }
}

export function createOStatusPost(input: {
  id: string
  author: string
  content: string
  createdAt?: string
  url?: string
}): OStatusPost {
  const createdAt = input.createdAt ?? new Date().toISOString()
  const payload = {
    id: input.id,
    author: input.author,
    content: input.content,
    createdAt,
    url: input.url,
  }

  return {
    id: input.id,
    protocol: 'ostatus',
    author: input.author,
    content: input.content,
    createdAt,
    url: input.url,
    envelope: encodeSalmonEnvelope(payload),
  }
}

export function createOStatusProvider() {
  return {
    normalizeProfile: normalizeOStatusProfile,
    createPost: createOStatusPost,
    buildSubscribeRequest: buildWebsubSubscribeRequest,
    encodeEnvelope: encodeSalmonEnvelope,
  }
}
