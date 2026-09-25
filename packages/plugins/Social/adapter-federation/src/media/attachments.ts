export type FederationMediaAttachment = {
  id: string
  type: 'image' | 'video' | 'audio' | 'document' | 'unknown'
  url: string
  mimeType?: string
  width?: number
  height?: number
  alt?: string
}

export type MediaProtocol = 'activitypub' | 'atproto' | 'ostatus' | 'forgefed'

function detectType(mimeType?: string): FederationMediaAttachment['type'] {
  if (!mimeType) return 'unknown'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf') || mimeType.includes('text') || mimeType.includes('application/')) return 'document'
  return 'unknown'
}

function toAttachment(raw: any, fallbackId: string): FederationMediaAttachment | null {
  const url = String(raw?.url ?? raw?.href ?? '')
  if (!url) {
    return null
  }

  const mimeType = raw?.mediaType ?? raw?.mimeType
  const width = typeof raw?.width === 'number' ? raw.width : undefined
  const height = typeof raw?.height === 'number' ? raw.height : undefined

  return {
    id: String(raw?.id ?? fallbackId),
    type: detectType(mimeType),
    url,
    mimeType: typeof mimeType === 'string' ? mimeType : undefined,
    width,
    height,
    alt: typeof raw?.name === 'string' ? raw.name : (typeof raw?.alt === 'string' ? raw.alt : undefined),
  }
}

export function extractFederationAttachments(protocol: MediaProtocol, payload: unknown): FederationMediaAttachment[] {
  const value: any = payload

  if (protocol === 'activitypub' || protocol === 'ostatus' || protocol === 'forgefed') {
    const candidates = value?.object?.attachment ?? value?.attachment ?? []
    const list = Array.isArray(candidates) ? candidates : [candidates]
    return list.map((item, idx) => toAttachment(item, `${protocol}-${idx}`)).filter((item): item is FederationMediaAttachment => Boolean(item))
  }

  const embeds = value?.post?.embed?.images ?? value?.post?.embed?.media ?? []
  const list = Array.isArray(embeds) ? embeds : [embeds]
  return list.map((item, idx) => toAttachment(item?.image ?? item, `atproto-${idx}`)).filter((item): item is FederationMediaAttachment => Boolean(item))
}
