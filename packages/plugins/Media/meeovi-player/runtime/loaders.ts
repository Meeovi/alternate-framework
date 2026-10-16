import type { MeeoviPlayerKind, MeeoviPlayerSkin } from './types'

/**
 * Video.js 10 registers its custom elements through side-effect imports.
 * Registration is client-only (Video.js's Nuxt guide, "Use Nuxt"): each
 * player loads only the preset, skin, media and extensions it needs, the
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

// HLS (.m3u8): video plays through hls.js (@videojs/hlsjs-video), the media
// the installation guide picks for HLS; audio uses the audio-only HLS media.
const hls = {
  video: () => import('@videojs/html/media/hlsjs-video'),
  audio: () => import('@videojs/html/media/hls-audio'),
}

// Google Cast extension (@videojs/google-cast) — video players only. It
// renders nothing; the packaged skins already include the Cast button.
const googleCast = () => import('@videojs/html/extensions/google-cast')

export const isAudioKind = (kind: MeeoviPlayerKind) => kind === 'audio' || kind === 'live-audio'

/** The media element a player of this kind renders. */
export function mediaTag(kind: MeeoviPlayerKind, useHls: boolean): string {
  if (isAudioKind(kind)) return useHls ? 'hls-audio' : 'audio'
  return useHls ? 'hlsjs-video' : 'video'
}

/** The packaged skin element for this kind and skin. */
export function skinTag(kind: MeeoviPlayerKind, skin: MeeoviPlayerSkin): string {
  return skin === 'default' ? `${kind}-skin` : `${kind}-${skin}-skin`
}

/** Register what a player of this kind / skin / media needs. */
export async function loadPlayer(kind: MeeoviPlayerKind, skin: MeeoviPlayerSkin, useHls: boolean): Promise<void> {
  const audio = isAudioKind(kind)
  await Promise.all([
    players[kind](),
    (skins[kind][skin] ?? skins[kind].default)(),
    useHls ? hls[audio ? 'audio' : 'video']() : undefined,
    audio ? undefined : googleCast(),
  ])
  // Wait for the player itself before Vue renders it and reads its store.
  await customElements.whenDefined(`${kind}-player`)
}

const KINDS = ['video', 'audio', 'live-video', 'live-audio'] as const
const SKINS = ['default', 'neutral', 'compat'] as const

/** Every tag this plugin renders — for Vue's isCustomElement (exact names). */
export const PLAYER_TAGS = [
  ...KINDS.flatMap((k) => [`${k}-player`, ...SKINS.map((s) => skinTag(k, s))]),
  'hlsjs-video',
  'hls-audio',
  'google-cast',
]

/** Every module the loaders above import — for Vite's optimizeDeps. */
export const PLAYER_IMPORTS = [
  ...KINDS.flatMap((k) => [
    `@videojs/html/${k}/player`, `@videojs/html/${k}/skin`, `@videojs/html/${k}/neutral-skin`, `@videojs/html/${k}/compat-skin`,
  ]),
  '@videojs/html/media/hlsjs-video',
  '@videojs/html/media/hls-audio',
  '@videojs/html/extensions/google-cast',
]
