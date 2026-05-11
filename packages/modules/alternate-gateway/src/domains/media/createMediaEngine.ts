import { createVideojsPlayer, type VideojsEngineOptions } from './players/videojs'

export type MediaEventHandler = (payload?: unknown) => void

export interface MediaSource {
  src: string
  type?: string
}

export interface MediaPlayer {
  loadSource: (source: MediaSource | string) => void
  play: () => Promise<void> | void
  pause: () => void
  dispose: () => void
  on: (event: string, handler: MediaEventHandler) => void
  off: (event: string, handler: MediaEventHandler) => void
  setMuted?: (muted: boolean) => void
  setVolume?: (volume: number) => void
  getCurrentTime?: () => number
}

export interface MediaEngine {
  mount: (element: HTMLVideoElement) => MediaPlayer
}

export interface MediaEngineFactoryOptions {
  player?: 'videojs' | string
  videojs?: VideojsEngineOptions
}

export const createMediaEngine = (options: MediaEngineFactoryOptions = {}): MediaEngine => {
  const selectedPlayer = options.player ?? 'videojs'

  switch (selectedPlayer) {
    case 'videojs':
      return {
        mount: (element) => createVideojsPlayer(element, options.videojs)
      }
    default:
      throw new Error(`Unsupported media player: ${selectedPlayer}`)
  }
}
