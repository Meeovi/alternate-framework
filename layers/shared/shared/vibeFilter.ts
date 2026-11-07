/**
 * A vibe editor filter's settings, cleaned: only known fields, inside their
 * ranges (filters come from members and sellers). Used by the editor
 * (layers/social app/utils/vibeEditor/filters.ts) and by the servers that
 * save filters (social effects, business seller products).
 */
export type VibeFilterConfig = {
  brightness?: number
  contrast?: number
  saturate?: number
  hue?: number
  warmth?: number
  grayscale?: number
  blur?: number
  vignette?: number
}

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/** Keeps only known fields, inside their ranges (filters can come from members). */
export function normalizeFilter(config: unknown): VibeFilterConfig {
  const c = (config && typeof config === 'object' ? config : {}) as Record<string, unknown>
  const out: VibeFilterConfig = {}
  if (c.brightness !== undefined) out.brightness = clamp(c.brightness, 0.5, 1.5, 1)
  if (c.contrast !== undefined) out.contrast = clamp(c.contrast, 0.5, 1.5, 1)
  if (c.saturate !== undefined) out.saturate = clamp(c.saturate, 0, 2, 1)
  if (c.hue !== undefined) out.hue = clamp(c.hue, -180, 180, 0)
  if (c.warmth !== undefined) out.warmth = clamp(c.warmth, 0, 0.6, 0)
  if (c.grayscale !== undefined) out.grayscale = clamp(c.grayscale, 0, 1, 0)
  if (c.blur !== undefined) out.blur = clamp(c.blur, 0, 4, 0)
  if (c.vignette !== undefined) out.vignette = clamp(c.vignette, 0, 0.8, 0)
  return out
}
