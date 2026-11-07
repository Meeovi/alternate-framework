import { FrameRenderer, type SegmentFn } from './renderer'
import type { EditorState } from './types'

/**
 * Bakes the effects into the video, in the browser: the source plays once
 * (in real time) into a canvas drawn by FrameRenderer, and the canvas plus
 * the source's sound are recorded with MediaRecorder. The result is what's
 * uploaded, so it looks the same everywhere (Meeovi, Bluesky, downloads).
 */

export const MAX_SECONDS = 180
export const MAX_HEIGHT = 720

/** True when nothing would change the video (upload the original as is). */
export function hasEffects(state: EditorState): boolean {
  const f = state.filter
  return state.stickers.length > 0
    || state.background.mode !== 'none'
    || Object.entries(f).some(([key, value]) => value !== undefined && value !== (['brightness', 'contrast', 'saturate'].includes(key) ? 1 : 0))
}

const TYPES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

export function recorderType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  return TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

/** Output size: the source's, at most 720 px tall, even numbers (encoders need them). */
export function outputSize(width: number, height: number, maxHeight = MAX_HEIGHT) {
  const scale = Math.min(1, maxHeight / height)
  const even = (n: number) => Math.max(2, Math.round(n * scale / 2) * 2)
  return { width: even(width), height: even(height) }
}

export type ExportOptions = {
  source: Blob
  state: EditorState
  segment?: SegmentFn | null
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

export async function exportVibe({ source, state, segment, onProgress, signal }: ExportOptions): Promise<Blob> {
  const type = recorderType()
  if (!type) throw new Error("This browser can't record video. Try Chrome, Edge, Firefox or Safari 14.1+.")

  const url = URL.createObjectURL(source)
  const video = document.createElement('video')
  video.src = url
  video.playsInline = true
  video.preload = 'auto'
  // Played unmuted into Web Audio only (not the speakers), so the sound is recorded.
  video.muted = false
  video.crossOrigin = 'anonymous'
  const audio = new AudioContext()
  try {
    await new Promise<void>((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => resolve(), { once: true })
      video.addEventListener('error', () => reject(new Error("That video can't be read.")), { once: true })
    })
    const size = outputSize(video.videoWidth, video.videoHeight)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const renderer = new FrameRenderer(canvas)
    await renderer.preload(state)

    const stream = canvas.captureStream(30)
    const destination = audio.createMediaStreamDestination()
    audio.createMediaElementSource(video).connect(destination)
    for (const track of destination.stream.getAudioTracks()) stream.addTrack(track)
    await audio.resume()

    const duration = Math.min(MAX_SECONDS, Number.isFinite(video.duration) ? video.duration : MAX_SECONDS)
    const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 128_000 })
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve() })

    let done = false
    const finish = () => {
      if (done) return
      done = true
      video.pause()
      if (recorder.state !== 'inactive') recorder.stop()
    }
    signal?.addEventListener('abort', finish, { once: true })
    video.addEventListener('ended', finish, { once: true })

    const draw = () => {
      if (done) return
      renderer.render(video, state, video.currentTime, segment)
      onProgress?.(Math.min(1, video.currentTime / duration))
      if (video.currentTime >= duration) return finish()
      if ('requestVideoFrameCallback' in video) (video as any).requestVideoFrameCallback(draw)
      else requestAnimationFrame(draw)
    }

    video.currentTime = 0
    renderer.render(video, state, 0, segment)
    recorder.start(1000)
    await video.play()
    draw()
    await stopped
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    onProgress?.(1)
    return new Blob(chunks, { type: type.split(';')[0] })
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(url)
    audio.close().catch(() => {})
  }
}
