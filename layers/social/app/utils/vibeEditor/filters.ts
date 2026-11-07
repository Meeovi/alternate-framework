import { normalizeFilter } from '#shared/shared/vibeFilter'
import type { FilterConfig } from './types'

/**
 * Filters are canvas filters (CSS filter functions, applied by the browser
 * while drawing a frame) plus an optional vignette drawn over the frame.
 */

export { normalizeFilter }

/** The canvas `filter` string; `scale` = frame height / 720 (blur is in 720p pixels). */
export function canvasFilter(config: FilterConfig, scale = 1): string {
  const f = normalizeFilter(config)
  const parts: string[] = []
  if (f.brightness !== undefined && f.brightness !== 1) parts.push(`brightness(${f.brightness})`)
  if (f.contrast !== undefined && f.contrast !== 1) parts.push(`contrast(${f.contrast})`)
  if (f.saturate !== undefined && f.saturate !== 1) parts.push(`saturate(${f.saturate})`)
  if (f.hue) parts.push(`hue-rotate(${f.hue}deg)`)
  if (f.warmth) parts.push(`sepia(${f.warmth})`)
  if (f.grayscale) parts.push(`grayscale(${f.grayscale})`)
  if (f.blur) parts.push(`blur(${Math.round(f.blur * scale * 10) / 10}px)`)
  return parts.length ? parts.join(' ') : 'none'
}

export function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  if (!(amount > 0)) return
  const radius = Math.hypot(width, height) / 2
  const gradient = ctx.createRadialGradient(width / 2, height / 2, radius * 0.45, width / 2, height / 2, radius)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.8, amount)})`)
  ctx.save()
  ctx.filter = 'none'
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

/** Free filters every member has. */
export const BUILTIN_FILTERS: Array<{ id: string, name: string, config: FilterConfig }> = [
  { id: 'builtin:vivid', name: 'Vivid', config: { saturate: 1.4, contrast: 1.1 } },
  { id: 'builtin:warm', name: 'Warm', config: { warmth: 0.25, saturate: 1.1 } },
  { id: 'builtin:cool', name: 'Cool', config: { hue: -12, saturate: 0.9, brightness: 1.05 } },
  { id: 'builtin:mono', name: 'Mono', config: { grayscale: 1, contrast: 1.15 } },
  { id: 'builtin:fade', name: 'Fade', config: { contrast: 0.85, brightness: 1.08, saturate: 0.8 } },
  { id: 'builtin:dream', name: 'Dream', config: { blur: 1, brightness: 1.1, vignette: 0.35 } },
  { id: 'builtin:noir', name: 'Noir', config: { grayscale: 1, contrast: 1.4, vignette: 0.6 } },
]

/** Free emoji stickers every member has (drawn to an image once). */
export const BUILTIN_STICKERS = ['😂', '😍', '🔥', '✨', '👍', '🎉', '💯', '🛍️', '❤️', '😎', '🙌', '👀']

const emojiCache = new Map<string, string>()
export function emojiImage(emoji: string): string {
  const cached = emojiCache.get(emoji)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 160
  const ctx = canvas.getContext('2d')!
  ctx.font = '128px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 80, 88)
  const url = canvas.toDataURL('image/png')
  emojiCache.set(emoji, url)
  return url
}
