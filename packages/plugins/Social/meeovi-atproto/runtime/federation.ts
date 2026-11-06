// Structural copy of the social layer's federation contract
// (layers/social/shared/types/federation.ts) — plugins can't import from a
// layer. Keep in step with that file.

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
  /** Moderation and self-label values on the account. */
  labels?: string[]
  /** What moderation does with it (hide / blur / warn), from its labels. */
  moderation?: FederatedModeration
}

/** See runtime/moderation.ts in meeovi-atproto. */
export type FederatedModeration = {
  action: 'hide' | 'blur' | 'warn'
  reasons: string[]
  signedInOnly?: boolean
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
  /** Moderation and self-label values (the note's and its author's). */
  labels?: string[]
  moderation?: FederatedModeration
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

export type FederationCapability = 'profile' | 'feed' | 'searchPosts' | 'thread' | 'list' | 'publish' | 'forMember' | 'report'

export interface FederationNetwork {
  /** 'atproto', 'activitypub', … — used in /api/social/federation/:network. */
  id: string
  /** Shown to people: 'Bluesky', 'Fediverse'. */
  label: string
  status(): Promise<FederationStatus>
  profile?(handle: string): Promise<FederatedActor | null>
  feed?(actor: string, options?: { limit?: number }): Promise<FederatedPost[]>
  searchPosts?(query: string, options?: { limit?: number }): Promise<FederatedPost[]>
  /** One post (a note, as Meeovi calls them) by `author` (handle or
   *  network id) and its network key, with its direct replies; null when
   *  it doesn't exist. */
  thread?(author: string, key: string, options?: { limit?: number }): Promise<{ post: FederatedPost, replies: FederatedPost[] } | null>
  /** A public list (of accounts) by its network id, with its items, for
   *  its page on this site; null when it doesn't exist or isn't public. */
  list?(id: string, options?: { limit?: number }): Promise<{ list: FederatedList, items: FederatedListItem[] } | null>
  /** Post as the network's service account. */
  publish?(input: { text: string, [key: string]: unknown }): Promise<FederatedPost>
  /**
   * Act as one of this site's members on the network: their timeline,
   * notes, likes, follows and lists. Null when the member has no account
   * there (never connected it, or the stored credentials stopped working).
   * The social layer stores and hands over the credentials, so a plugin
   * never touches the site's database.
   */
  forMember?(member: FederationMember): Promise<FederationMemberSession | null>
  /**
   * Report a note or account to this site's moderators on the network
   * (Bluesky: a report in Meeovi's Ozone). Files it as the site's service
   * account; `reason` says which member reported it.
   */
  report?(input: FederatedReport): Promise<{ id: string }>
}

export type FederatedReportReason = 'spam' | 'violation' | 'misleading' | 'sexual' | 'rude' | 'other'

export type FederatedReport = {
  subject: { kind: 'note', id: string } | { kind: 'account', id: string }
  reasonType: FederatedReportReason
  /** What the member wrote, plus who they are on this site. */
  reason?: string
}

// --- Acting as a member ------------------------------------------------------
// The social layer is a client over every network: what a member sees and
// does (timeline, notes, likes, reposts, follows, lists) goes through their
// session on each network they're connected to. "directus" (this site's own
// members, notes and lists) is one network among them.

export type FederationMember = {
  /** This site's user id. */
  id: string
  /** What the network stored for this member when they connected it
   *  (e.g. an AT Protocol session), or undefined for networks that need
   *  none (this site's own). */
  credentials?: unknown
  /** Persist refreshed credentials (token refresh). */
  saveCredentials?(credentials: unknown): Promise<void>
}

/** A list: of accounts (Bluesky and Mastodon lists) or of things on this
 *  site (products, notes, vibez, spaces…). */
export type FederatedList = {
  /** Network-native id (at:// URI, Mastodon list id, Directus id). */
  id: string
  network: string
  name: string
  description?: string
  kind: 'accounts' | 'items'
  visibility?: 'public' | 'private'
  /** This site's list type, for item lists (Wishlist, Bookmarks…). */
  type?: string
  avatar?: string
  itemCount?: number
  /** Link to the list's page on this site. */
  path?: string
  /** The list on its own network (bsky.app, the Mastodon instance), shown
   *  as the source on Meeovi's page for it, never used as its link. */
  url?: string
}

export type FederatedListItem = {
  /** The item's own id within the list (what removeFromList takes). */
  id: string
  /** 'account', 'note', or a site kind ('product', 'vibe', 'space'…). */
  kind: string
  actor?: FederatedActor
  post?: FederatedPost
  /** A thing on this site: its kind's collection and id, with a title and
   *  picture to show. */
  ref?: { id: string | number, title?: string, image?: string, path?: string }
  addedAt?: string
}

export type FederatedListInput = {
  name: string
  description?: string
  visibility?: 'public' | 'private'
  /** This site's list type by name (Wishlist, Bookmarks…). */
  type?: string
}

/** What to add to a list: an account, a note, or a thing on this site. */
export type FederatedListItemInput =
  | { kind: 'account', actor: string }
  | { kind: 'note', post: string }
  | { kind: string, id: string | number }

export interface FederationMemberSession {
  network: string
  /** The member's own account on this network. */
  account: FederatedActor
  /** Notes from the accounts they follow. */
  timeline?(options?: { limit?: number }): Promise<FederatedPost[]>
  /** A new note, or a reply when `replyTo` (a note id) is given. */
  publish?(input: { text: string, replyTo?: string }): Promise<FederatedPost>
  like?(postId: string): Promise<void>
  unlike?(postId: string): Promise<void>
  repost?(postId: string): Promise<void>
  unrepost?(postId: string): Promise<void>
  follow?(actorId: string): Promise<void>
  unfollow?(actorId: string): Promise<void>
  lists?(): Promise<FederatedList[]>
  list?(id: string): Promise<{ list: FederatedList, items: FederatedListItem[] } | null>
  createList?(input: FederatedListInput): Promise<FederatedList>
  updateList?(id: string, input: Partial<FederatedListInput>): Promise<FederatedList>
  deleteList?(id: string): Promise<void>
  addToList?(listId: string, item: FederatedListItemInput): Promise<FederatedListItem>
  removeFromList?(listId: string, itemId: string): Promise<void>
}

export type FederationMemberCapability = Exclude<keyof FederationMemberSession, 'network' | 'account'>
