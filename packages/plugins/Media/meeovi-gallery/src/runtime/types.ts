export interface MeeoviGalleryModuleOptions {
  /** Set false to register nothing. */
  enabled?: boolean
  /** Base path of the gallery's server routes. */
  apiBase?: string
  /** Route of the full-page gallery, or false for no page. */
  page?: string | false
  /** The app's upload route (multipart `file` + `category`), see useAssetUpload. */
  uploadEndpoint?: string
  /** Folder new uploads go into when the gallery isn't inside one. */
  uploadCategory?: string
  sessionEndpoint?: string
  loginPath?: string
  /**
   * Pixanomy (Nextcloud) access. Empty values fall back, at runtime, to the
   * app's own `runtimeConfig.pixanomy` (NUXT_PIXANOMY_*), which is where
   * /api/assets/upload writes.
   */
  pixanomy?: {
    url?: string
    username?: string
    appPassword?: string
    root?: string
  }
}

export interface MeeoviGalleryPublicConfig {
  apiBase: string
  page: string | false
  uploadEndpoint: string
  uploadCategory: string
  loginPath: string
}

export type GalleryMediaKind = 'image' | 'video' | 'audio' | 'other'

/** One entry for SVAR File Manager: a folder, or a file with its links. */
export interface GalleryEntry {
  /** Path-like id inside the user's gallery, e.g. "/posts/2026-10/beach.jpg". */
  id: string
  type: 'file' | 'folder'
  size?: number
  /** ISO timestamp (the client turns it into a Date for SVAR). */
  date?: string | null
  contentType?: string
  kind?: GalleryMediaKind
  /** Public direct-download URL, or null if the file has no public link. */
  url?: string | null
  /** Public share page (Nextcloud's viewer). */
  shareUrl?: string | null
}

export interface GalleryFilesResponse {
  files: GalleryEntry[]
  drive: { used: number }
}

/** A recent upload with its links, for <MeeoviRelatedMedia>. */
export interface GalleryMediaItem {
  id: string
  name: string
  contentType: string
  kind: GalleryMediaKind
  size: number
  date: string | null
  url: string
  shareUrl: string
  /** Upload category folder, e.g. "posts", "vibez", "avatars". */
  category: string | null
}

export interface GalleryRecentResponse {
  media: GalleryMediaItem[]
}
