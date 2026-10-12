// Shared types for @mframework/meeovi-discussions.

export interface MeeoviDiscussionsModuleOptions {
  /** API route prefix. Default '/api/discussions'. */
  apiBase?: string
  /** Rocket.Chat workspace URL (public — the embed loads from it). */
  url?: string
  /** Object types that may have a discussion (the `type` of
   *  `<MeeoviDiscussion type id>`); anything else is a 404. */
  types?: string[]
  /** Room name prefix: rooms are `${prefix}-${type}-${id}`. Default 'discussion'. */
  roomPrefix?: string
  /** Session endpoint used to identify the user (better-auth by default). */
  sessionEndpoint?: string
  /** Login page for the signed-out prompt. Default '/login'. */
  loginPath?: string
  /** Private messages: the app's member endpoint. `GET {membersEndpoint}?q=`
   *  searches members ([{ id, name, username?, image? }]) and
   *  `GET {membersEndpoint}/:id` returns one. Default '/api/social/members'. */
  membersEndpoint?: string
  /** Rocket.Chat admin credentials (Personal Access Token). Server-only. */
  admin?: {
    userId?: string
    token?: string
    /** Must equal CREATE_TOKENS_FOR_USERS_SECRET on the Rocket.Chat server
     *  (Rocket.Chat 7+ requires it for users.createToken). */
    tokenSecret?: string
  }
}

/** GET {apiBase}/:type/:id */
export interface DiscussionInfo {
  room: string
  /** Messages so far (cached briefly). */
  messages: number
  signedIn: boolean
  /** The room exists yet (it's created when the first signed-in user opens it). */
  exists: boolean
}

/** POST {apiBase}/:type/:id/session */
export interface DiscussionSession {
  room: string
  /** Rocket.Chat login token for the embed (postMessage login-with-token). */
  token: string
  /** iframe src: the room in Rocket.Chat's embedded layout. */
  embedUrl: string
}

/** A Meeovi member, as the members endpoint returns them. */
export interface MessagesMember {
  id: string
  name: string
  username?: string | null
  image?: string | null
}

/** GET {apiBase}/messages — the signed-in member's private conversations. */
export interface MessagesConversation {
  rid: string
  username: string
  name: string
  avatar: string
  unread: number
  lastMessage: { text: string, at: string | null, mine: boolean } | null
  updatedAt: string | null
}

/** POST {apiBase}/messages/session — signs the messages embed in. */
export interface MessagesSession {
  token: string
  /** Rocket.Chat workspace origin + path prefix for /direct/<rid>. */
  url: string
}

export interface MeeoviDiscussionsPublicConfig {
  apiBase: string
  url: string
  loginPath: string
  membersEndpoint: string
}
