// Shared types for @mframework/meeovi-ratings.

/** Where an item records its creator (better-auth user id), for "no
 *  self-rating" and creator scores. */
export interface RatingOwnerField {
  /** Directus collection holding the items, e.g. 'shorts'. */
  collection: string
  /** Field with the creator's user id, e.g. 'creator_id'. */
  field: string
  /** Label for the creator score breakdown, e.g. 'Vibes'. */
  label: string
}

export interface MeeoviRatingsModuleOptions {
  /** API route prefix. Default '/api/ratings'. */
  apiBase?: string
  /** Rateable item types (`type` of `<MeeoviRating type id>`); others 404. */
  types?: string[]
  /** Item types that record their creator. */
  owners?: Record<string, RatingOwnerField>
  /** Session endpoint (better-auth by default). */
  sessionEndpoint?: string
  /** Login page for the signed-out hint. Default '/login'. */
  loginPath?: string
  /** Directus collection for ratings. Default 'content_ratings'. */
  collection?: string
  /** Directus connection. Server-only. */
  directus?: { url?: string, token?: string }
}

export interface RatingSummary {
  /** Average stars (0 when unrated), one decimal. */
  average: number
  count: number
  /** The signed-in user's own rating, or null. */
  mine: number | null
  /** Signed in, and not the item's creator. */
  canRate: boolean
  /** The signed-in user created this item. */
  own: boolean
}

/** GET {apiBase}?items=type:id,… */
export interface RatingsBatchResponse {
  signedIn: boolean
  items: Record<string, RatingSummary>
}

/** GET {apiBase}/creator/:userId */
export interface CreatorRating {
  average: number
  count: number
  byType: Array<{ type: string, label: string, average: number, count: number }>
}

export interface MeeoviRatingsPublicConfig {
  apiBase: string
  loginPath: string
}
