export interface BookmarkitModuleOptions {
  /** false registers nothing. */
  enabled?: boolean
  /** Prefix of the API routes. */
  apiBase?: string
  /** Path of the bookmarks page, or false for no page (use <Bookmarkit /> yourself). */
  page?: string | false
  /** The Directus `lists_type` a bookmark folder has. */
  listType?: string
  /** Answers with `{ user: { id } }` for the signed-in user (better-auth). */
  sessionEndpoint?: string
  /** Where guests are sent to sign in. */
  loginPath?: string
  /**
   * Directus. Leave both empty to use DIRECTUS_URL and
   * NUXTUS_DIRECTUS_STATIC_TOKEN at runtime; NUXT_BOOKMARKIT_DIRECTUS_URL /
   * NUXT_BOOKMARKIT_DIRECTUS_TOKEN override them.
   */
  directus?: { url?: string, token?: string }
}

export interface BookmarkitPublicConfig {
  apiBase: string
  page: string | false
  loginPath: string
}

/** A folder is one of the user's lists of type "Bookmarks". */
export interface BookmarkFolder {
  id: number
  name: string
  description: string
  count: number
}

/** A bookmark is a `list_items` row in one of those lists. */
export interface Bookmark {
  id: number
  title: string
  url: string
  description: string
  folderId: number
  createdAt: string | null
}

export interface BookmarksResponse {
  folders: BookmarkFolder[]
  bookmarks: Bookmark[]
}

export interface BookmarkInput {
  url: string
  title?: string
  description?: string
  /** Leave out to use the oldest folder (made if there is none). */
  folderId?: number
}

export interface FolderInput {
  name: string
  description?: string
}
