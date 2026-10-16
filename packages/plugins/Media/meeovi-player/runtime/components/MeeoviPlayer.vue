<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { isAudioKind, loadPlayer, mediaTag, skinTag } from '../loaders'
import type { MeeoviPlayerKind, MeeoviPlayerPublicConfig, MeeoviPlayerSkin } from '../types'

/**
 * The one media player for every app: video, audio, live video and live
 * radio, on Video.js 10 (@videojs/html custom elements).
 *
 *   <MeeoviPlayer :src="videoUrl" :poster="thumb" />
 *   <MeeoviPlayer :src="trackUrl" kind="audio" title="Episode 4" />
 *   <MeeoviPlayer :src="stationUrl" live />                 (radio: live audio)
 *   <MeeoviPlayer src="https://stream.mux.com/….m3u8" />   (HLS, auto-detected)
 *
 * `kind` is detected from `type` (MIME) or the file extension when omitted.
 * The Video.js elements are registered client-side the first time a player
 * of that kind is shown; the server renders a same-sized placeholder.
 * Video players include the Google Cast extension.
 */
const props = withDefaults(defineProps<{
  src?: string | null
  /** video | audio | live-video | live-audio — detected when omitted. */
  kind?: MeeoviPlayerKind
  /** Live stream (radio, live video): no seek bar, a Live button instead. */
  live?: boolean
  /** MIME type, e.g. 'audio/mpeg' or 'application/x-mpegURL'. */
  type?: string | null
  /** Poster image (video). Set on the player, so the skin shows it. */
  poster?: string | null
  /** Content title, shown by the skin (the player's `content-title`). */
  title?: string | null
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  skin?: MeeoviPlayerSkin
  /** Video aspect ratio. Default '16 / 9'. */
  aspectRatio?: string
  /** Shown when there's no source. */
  unavailableText?: string
}>(), {
  src: null, live: false, type: null, poster: null, title: null,
  autoplay: false, muted: false, loop: false, preload: 'metadata',
  aspectRatio: '16 / 9', unavailableText: '',
})

const emit = defineEmits<{
  (e: 'play' | 'pause' | 'ended' | 'error', event: Event): void
}>()

const config = useRuntimeConfig().public.meeoviPlayer as MeeoviPlayerPublicConfig | undefined
const skin = computed<MeeoviPlayerSkin>(() => props.skin || config?.skin || 'default')

const AUDIO_EXT = /\.(mp3|m4a|aac|oga|ogg|opus|wav|flac|weba)(\?|#|$)/i
const isHls = computed(() => /mpegurl/i.test(props.type || '') || /\.m3u8(\?|#|$)/i.test(props.src || ''))
const isAudio = computed(() => {
  if (props.kind) return isAudioKind(props.kind)
  if (props.type) return props.type.toLowerCase().startsWith('audio/')
  return AUDIO_EXT.test(props.src || '')
})
const kind = computed<MeeoviPlayerKind>(() => {
  if (props.kind) return props.kind
  if (props.live) return isAudio.value ? 'live-audio' : 'live-video'
  return isAudio.value ? 'audio' : 'video'
})

// Elements registered for this player's kind/skin/engine yet?
const ready = ref(false)
const failed = ref(false)
async function register() {
  ready.value = false
  try {
    await loadPlayer(kind.value, skin.value, isHls.value)
    ready.value = true
  } catch (e) {
    console.error('[meeovi-player] could not load Video.js', e)
    failed.value = true
  }
}
onMounted(register)
watch([kind, skin, isHls], () => { if (ready.value || failed.value) register() })

const unavailable = computed(() => !props.src || failed.value)
const message = computed(() => props.unavailableText || (isAudio.value ? 'Audio is not available' : 'Video is not available'))

// Player > packaged skin > media, by tag name.
const playerTag = computed(() => `${kind.value}-player`)
const skinElement = computed(() => skinTag(kind.value, skin.value))
const mediaElement = computed(() => mediaTag(kind.value, isHls.value))

/** The player element's store: its state and actions (play, pause, seek…). */
interface PlayerStore {
  paused: boolean
  play: () => Promise<void>
  pause: () => void
  subscribe: (listener: () => void) => () => void
}

// The player element owns playback state, including while casting, so
// actions go through its store rather than the media element.
const player = ref<(HTMLElement & { store: PlayerStore }) | null>(null)
// The underlying <video>/<audio>/<hlsjs-video>/<hls-audio> element, for
// callers that need it directly (currentTime, native events, …).
const media = ref<HTMLMediaElement | null>(null)
defineExpose({
  player,
  media,
  play: () => player.value?.store.play(),
  pause: () => player.value?.store.pause(),
})

// Metadata lives on the player: the skin's poster and title read it there.
const playerAttrs = computed(() => ({
  'poster': isAudio.value ? undefined : props.poster || undefined,
  'content-title': props.title || undefined,
}))

const mediaAttrs = computed(() => ({
  src: props.src || undefined,
  autoplay: props.autoplay || undefined,
  muted: props.muted || undefined,
  loop: props.loop || undefined,
  preload: props.preload,
  playsinline: '',
}))
const on = {
  play: (e: Event) => emit('play', e),
  pause: (e: Event) => emit('pause', e),
  ended: (e: Event) => emit('ended', e),
  error: (e: Event) => emit('error', e),
}
</script>

<template>
  <div
    class="meeovi-player"
    :class="[`meeovi-player--${isAudio ? 'audio' : 'video'}`]"
    :style="isAudio ? undefined : { aspectRatio }"
  >
    <!-- Video.js 10: player (state) > packaged skin (UI) > media. -->
    <component :is="playerTag" v-if="ready && !unavailable" ref="player" v-bind="playerAttrs">
      <component :is="skinElement">
        <component :is="mediaElement" ref="media" v-bind="mediaAttrs" v-on="on" />
        <google-cast v-if="!isAudio" />
      </component>
    </component>

    <!-- Server render / loading, and "nothing to play" -->
    <div v-else class="meeovi-player__placeholder" :aria-busy="!unavailable">
      <template v-if="unavailable">
        <v-icon :icon="isAudio ? 'fas fa-volume-xmark' : 'fas fa-video-slash'" size="28" />
        <span>{{ message }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.meeovi-player {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.meeovi-player--video {
  background: #000;
}

.meeovi-player--audio {
  min-height: 56px;
}

/* Skins fill the player box. */
.meeovi-player :deep(video-skin),
.meeovi-player :deep(video-neutral-skin),
.meeovi-player :deep(video-compat-skin),
.meeovi-player :deep(live-video-skin),
.meeovi-player :deep(live-video-neutral-skin),
.meeovi-player :deep(live-video-compat-skin) {
  display: block;
  width: 100%;
  height: 100%;
}

.meeovi-player :deep(audio-skin),
.meeovi-player :deep(audio-neutral-skin),
.meeovi-player :deep(audio-compat-skin),
.meeovi-player :deep(live-audio-skin),
.meeovi-player :deep(live-audio-neutral-skin),
.meeovi-player :deep(live-audio-compat-skin) {
  display: block;
  width: 100%;
}

.meeovi-player__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  min-height: inherit;
  font-size: 0.9rem;
}

.meeovi-player--video .meeovi-player__placeholder {
  color: rgba(255, 255, 255, 0.85);
}

.meeovi-player--audio .meeovi-player__placeholder {
  flex-direction: row;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.12);
  opacity: 0.8;
}
</style>
