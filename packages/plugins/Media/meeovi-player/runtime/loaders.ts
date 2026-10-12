import type { MeeoviPlayerKind, MeeoviPlayerSkin } from './types'

/**
 * Video.js 10 registers its custom elements through side-effect imports.
 * Each player loads only the preset, skin and media engine it needs, the
 * first time one is shown (literal paths, so the bundler can split them).
 */
const players: Record<MeeoviPlayerKind, () => Promise<unknown>> = {
  'video': () => import('@videojs/html/video/player'),
  'audio': () => import('@videojs/html/audio/player'),
  'live-video': () => import('@videojs/html/live-video/player'),
  'live-audio': () => import('@videojs/html/live-audio/player'),
}

const skins: Record<MeeoviPlayerKind, Record<MeeoviPlayerSkin, () => Promise<unknown>>> = {
  'video': {
    default: () => import('@videojs/html/video/skin'),
    neutral: () => import('@videojs/html/video/neutral-skin'),
    compat: () => import('@videojs/html/video/compat-skin'),
  },
  'audio': {
    default: () => import('@videojs/html/audio/skin'),
    neutral: () => import('@videojs/html/audio/neutral-skin'),
    compat: () => import('@videojs/html/audio/compat-skin'),
  },
  'live-video': {
    default: () => import('@videojs/html/live-video/skin'),
    neutral: () => import('@videojs/html/live-video/neutral-skin'),
    compat: () => import('@videojs/html/live-video/compat-skin'),
  },
  'live-audio': {
    default: () => import('@videojs/html/live-audio/skin'),
    neutral: () => import('@videojs/html/live-audio/neutral-skin'),
    compat: () => import('@videojs/html/live-audio/compat-skin'),
  },
}

// HLS (.m3u8: Mux streams, live radio, …) — Video.js's own lightweight engine.
const hls = {
  video: () => import('@videojs/html/media/hls-video'),
  audio: () => import('@videojs/html/media/hls-audio'),
}

export const isAudioKind = (kind: MeeoviPlayerKind) => kind === 'audio' || kind === 'live-audio'

/** Register what a player of this kind / skin / engine needs. */
export async function loadPlayer(kind: MeeoviPlayerKind, skin: MeeoviPlayerSkin, useHls: boolean): Promise<void> {
  await Promise.all([
    players[kind](),
    (skins[kind][skin] ?? skins[kind].default)(),
    useHls ? hls[isAudioKind(kind) ? 'audio' : 'video']() : Promise.resolve(),
  ])
}

/** Every tag this plugin renders — for Vue's isCustomElement (exact names). */
export const PLAYER_TAGS = [
  ...(['video', 'audio', 'live-video', 'live-audio'] as const).flatMap((k) => [
    `${k}-player`, `${k}-skin`, `${k}-neutral-skin`, `${k}-compat-skin`,
  ]),
  'hls-video',
  'hls-audio',
]

/** Every module the loaders above import — for Vite's optimizeDeps. */
export const PLAYER_IMPORTS = [
  ...(['video', 'audio', 'live-video', 'live-audio'] as const).flatMap((k) => [
    `@videojs/html/${k}/player`, `@videojs/html/${k}/skin`, `@videojs/html/${k}/neutral-skin`, `@videojs/html/${k}/compat-skin`,
  ]),
  '@videojs/html/media/hls-video',
  '@videojs/html/media/hls-audio',
]
