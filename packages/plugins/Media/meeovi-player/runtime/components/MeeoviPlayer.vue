<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { isAudioKind, loadPlayer } from '../loaders'
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
 */
const props = withDefaults(defineProps<{
  src?: string | null
  /** video | audio | live-video | live-audio — detected when omitted. */
  kind?: MeeoviPlayerKind
  /** Live stream (radio, live video): no seek bar, a Live button instead. */
  live?: boolean
  /** MIME type, e.g. 'audio/mpeg' or 'application/x-mpegURL'. */
  type?: string | null
  poster?: string | null
  /** Accessible name / shown by audio skins. */
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

// The underlying <video>/<audio>/<hls-*> element, for callers that control
// playback themselves (play(), pause(), currentTime, …).
const media = ref<HTMLMediaElement | null>(null)
defineExpose({
  media,
  play: () => media.value?.play(),
  pause: () => media.value?.pause(),
})

const mediaAttrs = computed(() => ({
  src: props.src || undefined,
  poster: isAudio.value ? undefined : props.poster || undefined,
  title: props.title || undefined,
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
    <template v-if="ready && !unavailable">
      <!-- One branch per preset: Video.js 10 player > skin > media. -->
      <video-player v-if="kind === 'video'">
        <video-skin v-if="skin === 'default'">
          <hls-video v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <video v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </video-skin>
        <video-neutral-skin v-else-if="skin === 'neutral'">
          <hls-video v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <video v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </video-neutral-skin>
        <video-compat-skin v-else>
          <hls-video v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <video v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </video-compat-skin>
      </video-player>

      <live-video-player v-else-if="kind === 'live-video'">
        <live-video-skin v-if="skin === 'default'">
          <hls-video v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <video v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </live-video-skin>
        <live-video-neutral-skin v-else-if="skin === 'neutral'">
          <hls-video v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <video v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </live-video-neutral-skin>
        <live-video-compat-skin v-else>
          <hls-video v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <video v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </live-video-compat-skin>
      </live-video-player>

      <audio-player v-else-if="kind === 'audio'">
        <audio-skin v-if="skin === 'default'">
          <hls-audio v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <audio v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </audio-skin>
        <audio-neutral-skin v-else-if="skin === 'neutral'">
          <hls-audio v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <audio v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </audio-neutral-skin>
        <audio-compat-skin v-else>
          <hls-audio v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <audio v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </audio-compat-skin>
      </audio-player>

      <live-audio-player v-else>
        <live-audio-skin v-if="skin === 'default'">
          <hls-audio v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <audio v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </live-audio-skin>
        <live-audio-neutral-skin v-else-if="skin === 'neutral'">
          <hls-audio v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <audio v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </live-audio-neutral-skin>
        <live-audio-compat-skin v-else>
          <hls-audio v-if="isHls" ref="media" v-bind="mediaAttrs" v-on="on" />
          <audio v-else ref="media" v-bind="mediaAttrs" v-on="on" />
        </live-audio-compat-skin>
      </live-audio-player>
    </template>

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
