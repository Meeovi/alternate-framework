import { canvasFilter, drawVignette } from './filters'
import type { EditorState, StickerPlacement } from './types'

/**
 * Draws one frame of a vibe with its effects: background (behind the person,
 * from the segmentation mask), filter, vignette, then the stickers showing
 * at that moment. Used for the live preview and for the export, so what you
 * see is what's uploaded.
 */
export type SegmentFn = (frame: TexImageSource) => { width: number, height: number, data: Float32Array } | null

export function stickerVisible(sticker: StickerPlacement, time: number): boolean {
  if (sticker.start !== null && time < sticker.start) return false
  if (sticker.end !== null && time >= sticker.end) return false
  return true
}

/** Where `inner` covers `outer` (like object-fit: cover). */
export function coverRect(innerW: number, innerH: number, outerW: number, outerH: number) {
  const scale = Math.max(outerW / innerW, outerH / innerH)
  const w = innerW * scale
  const h = innerH * scale
  return { x: (outerW - w) / 2, y: (outerH - h) / 2, w, h }
}

export class FrameRenderer {
  private images = new Map<string, HTMLImageElement>()
  private base = document.createElement('canvas')
  private person = document.createElement('canvas')
  private mask = document.createElement('canvas')

  constructor(private canvas: HTMLCanvasElement) {}

  /** Images must allow CORS, or the canvas can't be recorded. */
  image(src: string): HTMLImageElement | null {
    let img = this.images.get(src)
    if (!img) {
      img = new Image()
      if (!src.startsWith('data:') && !src.startsWith('blob:')) img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      img.src = src
      this.images.set(src, img)
    }
    return img.complete && img.naturalWidth ? img : null
  }

  /** Waits for every image the state uses (before an export). */
  async preload(state: EditorState): Promise<void> {
    const srcs = [...state.stickers.map((s) => s.src), ...(state.background.mode === 'image' ? [state.background.src] : [])]
    await Promise.all(srcs.map((src) => new Promise<void>((resolve) => {
      this.image(src)
      const img = this.images.get(src)!
      if (img.complete) return resolve()
      img.addEventListener('load', () => resolve(), { once: true })
      img.addEventListener('error', () => resolve(), { once: true })
    })))
  }

  render(video: HTMLVideoElement, state: EditorState, time: number, segment?: SegmentFn | null) {
    const W = this.canvas.width
    const H = this.canvas.height
    const ctx = this.canvas.getContext('2d')!
    const scale = H / 720
    if (!video.videoWidth) return
    const frame = coverRect(video.videoWidth, video.videoHeight, W, H)

    // 1. The frame, with the background replaced behind the person.
    if (this.base.width !== W || this.base.height !== H) { this.base.width = W; this.base.height = H }
    const b = this.base.getContext('2d')!
    b.save()
    b.filter = 'none'
    b.clearRect(0, 0, W, H)
    const background = state.background
    const mask = background.mode !== 'none' && segment ? segment(video) : null
    if (mask) {
      if (background.mode === 'blur') {
        b.filter = `blur(${Math.max(2, background.amount * scale)}px)`
        b.drawImage(video, frame.x, frame.y, frame.w, frame.h)
        b.filter = 'none'
      } else if (background.mode === 'image') {
        const img = this.image(background.src)
        if (img) {
          const r = coverRect(img.naturalWidth, img.naturalHeight, W, H)
          b.drawImage(img, r.x, r.y, r.w, r.h)
        } else {
          b.drawImage(video, frame.x, frame.y, frame.w, frame.h)
        }
      }
      b.drawImage(this.cutOut(video, mask, frame, W, H), 0, 0)
    } else {
      b.drawImage(video, frame.x, frame.y, frame.w, frame.h)
    }
    b.restore()

    // 2. Filter and vignette over the whole picture.
    ctx.save()
    ctx.clearRect(0, 0, W, H)
    ctx.filter = canvasFilter(state.filter, scale)
    ctx.drawImage(this.base, 0, 0)
    ctx.filter = 'none'
    drawVignette(ctx, W, H, state.filter.vignette ?? 0)

    // 3. Stickers showing now.
    for (const sticker of state.stickers) {
      if (!stickerVisible(sticker, time)) continue
      const img = this.image(sticker.src)
      if (!img) continue
      const w = sticker.scale * W
      const h = w * (img.naturalHeight / img.naturalWidth)
      ctx.save()
      ctx.translate(sticker.x * W, sticker.y * H)
      ctx.rotate((sticker.rotation * Math.PI) / 180)
      ctx.drawImage(img, -w / 2, -h / 2, w, h)
      ctx.restore()
    }
    ctx.restore()
  }

  /** The person alone (the frame where the mask is confident). */
  private cutOut(video: HTMLVideoElement, mask: { width: number, height: number, data: Float32Array }, frame: { x: number, y: number, w: number, h: number }, W: number, H: number) {
    if (this.mask.width !== mask.width || this.mask.height !== mask.height) { this.mask.width = mask.width; this.mask.height = mask.height }
    const m = this.mask.getContext('2d')!
    const pixels = m.createImageData(mask.width, mask.height)
    for (let i = 0; i < mask.data.length; i++) {
      // Soft edge: below 0.3 is background, above 0.7 is person.
      const a = Math.min(1, Math.max(0, (mask.data[i]! - 0.3) / 0.4))
      pixels.data[i * 4 + 3] = a * 255
    }
    m.putImageData(pixels, 0, 0)

    if (this.person.width !== W || this.person.height !== H) { this.person.width = W; this.person.height = H }
    const p = this.person.getContext('2d')!
    p.save()
    p.globalCompositeOperation = 'source-over'
    p.clearRect(0, 0, W, H)
    p.drawImage(video, frame.x, frame.y, frame.w, frame.h)
    p.globalCompositeOperation = 'destination-in'
    // The mask matches the video frame, so it goes where the frame went.
    p.drawImage(this.mask, frame.x, frame.y, frame.w, frame.h)
    p.restore()
    return this.person
  }
}
