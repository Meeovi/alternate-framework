/**
 * The vibe editor's state (pages/connect/vibe/upload.vue): what is drawn on
 * every frame of the source video before the result is recorded into the
 * uploaded file.
 */

/** A filter's settings. Every field is optional; 1 / 0 = unchanged. */
export type FilterConfig = {
  brightness?: number  // 0.5 – 1.5
  contrast?: number    // 0.5 – 1.5
  saturate?: number    // 0 – 2
  hue?: number         // degrees, -180 – 180
  warmth?: number      // 0 – 0.6 (sepia)
  grayscale?: number   // 0 – 1
  blur?: number        // px at 720p, 0 – 4
  vignette?: number    // 0 – 0.8
}

export type StickerPlacement = {
  id: string
  /** Image URL (Pixanomy, or a built-in emoji drawn to a data URL). */
  src: string
  effectId?: number | null
  /** Centre, as a fraction of the frame (0 – 1). */
  x: number
  y: number
  /** Width as a fraction of the frame's width. */
  scale: number
  /** Degrees. */
  rotation: number
  /** Seconds; null = the whole video. */
  start: number | null
  end: number | null
}

export type BackgroundSetting =
  | { mode: 'none' }
  | { mode: 'blur', amount: number }
  | { mode: 'image', src: string, effectId?: number | null }

export type EditorState = {
  filter: FilterConfig
  filterEffectId?: number | null
  stickers: StickerPlacement[]
  background: BackgroundSetting
}

export const emptyState = (): EditorState => ({ filter: {}, stickers: [], background: { mode: 'none' } })

/** An effect from the picker (GET /api/social/vibez/effects). */
export type VibeEffect = {
  id: number | string
  kind: 'sticker' | 'filter' | 'background'
  name: string
  asset_url: string | null
  config: FilterConfig | null
  visibility?: 'private' | 'community'
  mine?: boolean
  product?: { id: number | string, name?: string, price?: string | number | null } | null
  builtin?: boolean
}
