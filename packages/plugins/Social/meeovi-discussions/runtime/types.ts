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

export interface MeeoviDiscussionsPublicConfig {
  apiBase: string
  url: string
  loginPath: string
}
