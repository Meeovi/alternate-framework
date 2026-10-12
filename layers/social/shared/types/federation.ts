// Federation contract (the social layer's built-in federation core).
//
// Each network — AT Protocol (Bluesky), ActivityPub (Mastodon & the wider
// Fediverse), and whatever comes next — is its own plugin
// (@mframework/meeovi-atproto, @mframework/meeovi-activitypub, …) that
// implements FederationNetwork and registers it from a Nitro plugin under
// FEDERATION_REGISTRY. The social layer only talks to networks through this
// contract (server/utils/federation.ts, /api/social/federation/*), so adding
// a network never means touching the layer.
//
// Plugins can't import from a layer, so each one keeps a structural copy of
// these types; keep them in step when this file changes.

/** globalThis key of the Map<id, FederationNetwork> registry. */
export const FEDERATION_REGISTRY = Symbol.for('meeovi.federation.networks')

export type FederatedActor = {
  /** Network-native id (DID, Mastodon account id, …). */
  id: string
  network: string
  /** @handle on its network (alice.bsky.social, alice@mastodon.social). */
  handle: string
  displayName?: string
  avatar?: string
  bio?: string
  url?: string
  followers?: number
  following?: number
  posts?: number
}

export type FederatedMedia = {
  url: string
  preview?: string
  alt?: string
  type: 'image' | 'video' | 'audio' | 'other'
}

export type FederatedPost = {
  /** Network-native id (at:// URI, Mastodon status id, …). */
  id: string
  network: string
  /** Public web link to the post, when the network has one. */
  url?: string
  /** Plain text. */
  text: string
  /** Sanitize before rendering — remote HTML (ActivityPub) only. */
  html?: string
  createdAt: string
  author: FederatedActor
  media?: FederatedMedia[]
  hashtags?: string[]
  replies?: number
  reposts?: number
  likes?: number
}

export type FederationStatus = {
  /** Credentials / an instance are configured for this network. */
  configured: boolean
  /** The service answered just now. */
  connected: boolean
  /** PDS / instance URL. */
  service: string
  /** Service account it acts as, when signed in. */
  account?: string | null
  detail?: string
}

export type FederationCapability = 'profile' | 'feed' | 'searchPosts' | 'publish'

export interface FederationNetwork {
  /** 'atproto', 'activitypub', … — used in /api/social/federation/:network. */
  id: string
  /** Shown to people: 'Bluesky', 'Fediverse'. */
  label: string
  status(): Promise<FederationStatus>
  profile?(handle: string): Promise<FederatedActor | null>
  feed?(actor: string, options?: { limit?: number }): Promise<FederatedPost[]>
  searchPosts?(query: string, options?: { limit?: number }): Promise<FederatedPost[]>
  /** Post as the network's service account. */
  publish?(input: { text: string, [key: string]: unknown }): Promise<FederatedPost>
}
