<template>
  <div class="vibe-editor">
    <!-- 1. Source: record with the camera, or pick a video -->
    <section v-if="step === 'source'" class="vibe-editor__source">
      <div class="vibe-editor__stage">
        <video v-show="cameraStream" ref="cameraVideo" class="vibe-editor__camera" autoplay muted playsinline />
        <div v-if="!cameraStream" class="vibe-editor__empty">
          <v-icon icon="fas fa-video" size="40" class="mb-3" />
          <p>Record a vibe with your camera, or choose a video (up to {{ MAX_SECONDS / 60 }} minutes).</p>
        </div>
        <div v-if="recording" class="vibe-editor__rec" aria-live="polite">● {{ formatSeconds(recordSeconds) }}</div>
      </div>
      <div class="d-flex flex-wrap ga-2 mt-3 justify-center">
        <template v-if="!cameraStream">
          <v-btn color="primary" prepend-icon="fas fa-camera" @click="startCamera">Use camera</v-btn>
          <v-btn variant="tonal" prepend-icon="fas fa-file-video" @click="fileInput?.click()">Choose a video</v-btn>
          <input ref="fileInput" type="file" accept="video/*" hidden @change="onFile">
        </template>
        <template v-else>
          <v-btn v-if="!recording" color="red" prepend-icon="fas fa-circle" @click="startRecording">Record</v-btn>
          <v-btn v-else color="red" variant="tonal" prepend-icon="fas fa-stop" @click="stopRecording">Stop</v-btn>
          <v-btn v-if="!recording" variant="text" @click="stopCamera">Cancel</v-btn>
        </template>
      </div>
      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3">{{ error }}</v-alert>
    </section>

    <!-- 2. Edit: live preview with effects -->
    <section v-else-if="step === 'edit'" class="vibe-editor__edit">
      <div class="vibe-editor__preview">
        <div class="vibe-editor__stage">
          <canvas ref="canvas" class="vibe-editor__canvas" :class="{ 'vibe-editor__canvas--drag': dragging }"
            @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp" />
          <div v-if="segmenterLoading" class="vibe-editor__badge">Loading background removal…</div>
        </div>
        <video ref="previewVideo" class="d-none" playsinline loop :muted="muted" @loadedmetadata="onPreviewReady" />
        <div class="d-flex align-center ga-2 mt-2">
          <v-btn :icon="playing ? 'fas fa-pause' : 'fas fa-play'" size="small" variant="tonal" :aria-label="playing ? 'Pause' : 'Play'" @click="togglePlay" />
          <v-slider v-model="scrub" :max="duration || 1" step="0.1" hide-details density="compact" class="flex-grow-1"
            aria-label="Position" @update:model-value="seek" />
          <span class="text-caption">{{ formatSeconds(scrub) }} / {{ formatSeconds(duration) }}</span>
          <v-btn :icon="muted ? 'fas fa-volume-xmark' : 'fas fa-volume-high'" size="small" variant="text" :aria-label="muted ? 'Unmute' : 'Mute'" @click="muted = !muted" />
        </div>
        <p v-if="duration > MAX_SECONDS" class="text-caption text-warning">Only the first {{ MAX_SECONDS / 60 }} minutes will be posted.</p>
      </div>

      <div class="vibe-editor__panel">
        <v-tabs v-model="panel" density="compact" grow>
          <v-tab value="filter">Filters</v-tab>
          <v-tab value="sticker">Stickers</v-tab>
          <v-tab value="background">Backgrounds</v-tab>
        </v-tabs>

        <div class="pa-3">
          <!-- Selected sticker -->
          <div v-if="panel === 'sticker' && selected" class="vibe-editor__selected mb-3">
            <div class="d-flex align-center mb-1">
              <strong>Selected sticker</strong><v-spacer />
              <v-btn size="small" variant="text" color="error" prepend-icon="fas fa-trash" @click="removeSticker(selected.id)">Remove</v-btn>
            </div>
            <v-slider v-model="selected.scale" label="Size" :min="0.05" :max="0.8" step="0.01" hide-details density="compact" />
            <v-slider v-model="selected.rotation" label="Turn" :min="-180" :max="180" step="1" hide-details density="compact" />
            <div class="d-flex align-center flex-wrap ga-2 mt-1 text-body-2">
              <span>Shows {{ selected.start === null ? 'from the start' : `from ${formatSeconds(selected.start)}` }}
                {{ selected.end === null ? 'to the end' : `until ${formatSeconds(selected.end)}` }}</span>
              <v-btn size="x-small" variant="tonal" @click="selected.start = round(scrub)">From now</v-btn>
              <v-btn size="x-small" variant="tonal" @click="setEnd(selected)">Until now</v-btn>
              <v-btn size="x-small" variant="text" @click="selected.start = null; selected.end = null">Whole video</v-btn>
            </div>
            <p class="text-caption text-medium-emphasis mt-1">Drag stickers on the video to move them.</p>
          </div>

          <!-- Filter sliders -->
          <div v-if="panel === 'filter'" class="mb-3">
            <div class="d-flex align-center mb-1">
              <strong>{{ filterName || 'Adjust' }}</strong><v-spacer />
              <v-btn size="small" variant="text" @click="resetFilter">Reset</v-btn>
            </div>
            <v-slider v-for="s in SLIDERS" :key="s.key" :model-value="state.filter[s.key] ?? s.neutral" :label="s.label"
              :min="s.min" :max="s.max" :step="s.step" hide-details density="compact"
              @update:model-value="setFilter(s.key, $event)" />
          </div>

          <!-- Background -->
          <div v-if="panel === 'background' && state.background.mode !== 'none'" class="mb-3 d-flex align-center">
            <span class="text-body-2">Background: <strong>{{ state.background.mode === 'blur' ? 'Blur' : backgroundName }}</strong></span>
            <v-spacer />
            <v-btn size="small" variant="text" @click="state.background = { mode: 'none' }">Remove</v-btn>
          </div>
          <v-slider v-if="panel === 'background' && state.background.mode === 'blur'" v-model="state.background.amount"
            label="Blur" :min="4" :max="24" step="1" hide-details density="compact" class="mb-3" />

          <effectPicker :kind="panel" :reload="reloadEffects" @pick="pick" />
          <v-btn class="mt-3" size="small" variant="tonal" prepend-icon="fas fa-plus" @click="makeOpen = true">Make your own {{ panel }}</v-btn>
        </div>
      </div>

      <div class="vibe-editor__post">
        <v-text-field v-model="title" label="Title" placeholder="My awesome vibe" maxlength="200" density="comfortable" hide-details="auto" />
        <div class="d-flex flex-wrap ga-2 mt-3">
          <v-btn variant="text" @click="startOver">Start over</v-btn>
          <v-spacer />
          <v-btn color="primary" prepend-icon="fas fa-paper-plane" :disabled="!title.trim()" @click="post">Post vibe</v-btn>
        </div>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3">{{ error }}</v-alert>
      </div>
    </section>

    <!-- 3. Posting -->
    <section v-else-if="step === 'posting'" class="vibe-editor__status">
      <p class="mb-2">{{ phase }}</p>
      <v-progress-linear :model-value="progress * 100" height="10" rounded color="primary" />
      <p v-if="phase.startsWith('Adding')" class="text-caption text-medium-emphasis mt-2">
        Your effects are added as the video plays through once. Keep this tab open.
      </p>
      <v-btn class="mt-3" variant="text" @click="cancelPost">Cancel</v-btn>
    </section>

    <!-- 4. Done -->
    <section v-else class="vibe-editor__status">
      <v-icon icon="fas fa-circle-check" color="success" size="40" class="mb-2" />
      <p class="mb-3">Your vibe is posted! 🎉</p>
      <div class="d-flex flex-wrap ga-2 justify-center">
        <v-btn v-if="uploadedId" color="primary" :to="`/connect/vibe/${uploadedId}`" prepend-icon="fas fa-tag">Tag the products in it</v-btn>
        <v-btn variant="tonal" @click="startOver">Make another</v-btn>
      </div>
    </section>

    <makeEffectDialog v-model="makeOpen" :kind="panel" :filter="state.filter" @saved="onMade" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import effectPicker from './effectPicker.vue'
import makeEffectDialog from './makeEffectDialog.vue'
import { formatSeconds } from '../../../../composables/vibez/useVibeProducts'
import { MAX_SECONDS, exportVibe, hasEffects, outputSize, recorderType } from '../../../../utils/vibeEditor/exporter'
import { normalizeFilter } from '../../../../utils/vibeEditor/filters'
import { FrameRenderer, type SegmentFn } from '../../../../utils/vibeEditor/renderer'
import { loadSegmenter } from '../../../../utils/vibeEditor/segmenter'
import { emptyState, type EditorState, type FilterConfig, type StickerPlacement } from '../../../../utils/vibeEditor/types'

/**
 * The vibe editor: record or pick a video, add filters, stickers and
 * backgrounds in a live preview, then post. Effects are baked into the
 * uploaded file in the browser (utils/vibeEditor/exporter.ts); with none,
 * the original file is uploaded as is.
 */
const emit = defineEmits<{ posted: [result: { id: number | string, url: string }] }>()

const step = ref<'source' | 'edit' | 'posting' | 'done'>('source')
const error = ref('')
const source = ref<Blob | null>(null)
let sourceUrl = ''

// -- 1. Camera -------------------------------------------------------------------
const cameraVideo = ref<HTMLVideoElement | null>(null)
const cameraStream = ref<MediaStream | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const recording = ref(false)
const recordSeconds = ref(0)
let recorder: MediaRecorder | null = null
let recordTimer: ReturnType<typeof setInterval> | undefined

async function startCamera() {
  error.value = ''
  try {
    cameraStream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', height: { ideal: 720 } }, audio: true })
    await nextTick()
    if (cameraVideo.value) cameraVideo.value.srcObject = cameraStream.value
  } catch {
    error.value = "Meeovi can't use your camera. Allow camera and microphone access in your browser, or choose a video instead."
  }
}

function stopCamera() {
  cameraStream.value?.getTracks().forEach((track) => track.stop())
  cameraStream.value = null
}

function startRecording() {
  const type = recorderType()
  if (!cameraStream.value || !type) { error.value = "This browser can't record video."; return }
  const chunks: Blob[] = []
  recorder = new MediaRecorder(cameraStream.value, { mimeType: type })
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
  recorder.onstop = () => {
    clearInterval(recordTimer)
    recording.value = false
    stopCamera()
    if (chunks.length) setSource(new Blob(chunks, { type: type.split(';')[0] }))
  }
  recorder.start(1000)
  recording.value = true
  recordSeconds.value = 0
  recordTimer = setInterval(() => {
    recordSeconds.value += 1
    if (recordSeconds.value >= MAX_SECONDS) stopRecording()
  }, 1000)
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') recorder.stop()
}

function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('video/')) { error.value = 'Choose a video file.'; return }
  if (file.size > 200 * 1024 * 1024) { error.value = 'That video is too big (up to 200 MB).'; return }
  if (!title.value) title.value = file.name.replace(/\.[^.]+$/, '').slice(0, 200)
  setSource(file)
}

// -- 2. Editing ------------------------------------------------------------------
const state = reactive<EditorState>(emptyState())
const panel = ref<'filter' | 'sticker' | 'background'>('filter')
const filterName = ref('')
const backgroundName = ref('')
const title = ref('')
const muted = ref(true)
const playing = ref(false)
const duration = ref(0)
const scrub = ref(0)
const canvas = ref<HTMLCanvasElement | null>(null)
const previewVideo = ref<HTMLVideoElement | null>(null)
const selectedId = ref<string | null>(null)
const makeOpen = ref(false)
const reloadEffects = ref(0)
const segmenterLoading = ref(false)
let segment: SegmentFn | null = null
let renderer: FrameRenderer | null = null
let frame = 0

const selected = computed(() => state.stickers.find((s) => s.id === selectedId.value) ?? null)

const SLIDERS: Array<{ key: keyof FilterConfig, label: string, min: number, max: number, step: number, neutral: number }> = [
  { key: 'brightness', label: 'Brightness', min: 0.5, max: 1.5, step: 0.01, neutral: 1 },
  { key: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.01, neutral: 1 },
  { key: 'saturate', label: 'Colour', min: 0, max: 2, step: 0.01, neutral: 1 },
  { key: 'warmth', label: 'Warmth', min: 0, max: 0.6, step: 0.01, neutral: 0 },
  { key: 'hue', label: 'Hue', min: -180, max: 180, step: 1, neutral: 0 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 0.8, step: 0.01, neutral: 0 },
]

const round = (n: number) => Math.round(n * 10) / 10

function setSource(blob: Blob) {
  error.value = ''
  source.value = blob
  if (sourceUrl) URL.revokeObjectURL(sourceUrl)
  sourceUrl = URL.createObjectURL(blob)
  step.value = 'edit'
  nextTick(() => {
    if (!previewVideo.value) return
    previewVideo.value.src = sourceUrl
  })
}

function onPreviewReady() {
  const video = previewVideo.value!
  duration.value = Number.isFinite(video.duration) ? video.duration : 0
  const size = outputSize(video.videoWidth, video.videoHeight, 540)
  canvas.value!.width = size.width
  canvas.value!.height = size.height
  renderer = new FrameRenderer(canvas.value!)
  video.currentTime = 0
  loop()
}

function loop() {
  cancelAnimationFrame(frame)
  const draw = () => {
    const video = previewVideo.value
    if (!video || !renderer || step.value !== 'edit') return
    if (playing.value || video.readyState >= 2) {
      renderer.render(video, state, video.currentTime, segment)
      if (playing.value) scrub.value = video.currentTime
    }
    frame = requestAnimationFrame(draw)
  }
  frame = requestAnimationFrame(draw)
}

async function togglePlay() {
  const video = previewVideo.value
  if (!video) return
  if (video.paused) { await video.play().catch(() => {}); playing.value = !video.paused } else { video.pause(); playing.value = false }
}

function seek(value: number) {
  const video = previewVideo.value
  if (video && Math.abs(video.currentTime - value) > 0.05) video.currentTime = value
}

function setFilter(key: keyof FilterConfig, value: number) {
  state.filter = { ...state.filter, [key]: value }
  filterName.value = ''
  state.filterEffectId = null
}

function resetFilter() {
  state.filter = {}
  filterName.value = ''
  state.filterEffectId = null
}

function setEnd(sticker: StickerPlacement) {
  const now = round(scrub.value)
  sticker.end = sticker.start !== null && now <= sticker.start ? null : now
}

function removeSticker(id: string) {
  state.stickers = state.stickers.filter((s) => s.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

async function pick(effect: Record<string, any>) {
  if (effect.kind === 'filter') {
    state.filter = normalizeFilter(effect.config)
    filterName.value = effect.name
    state.filterEffectId = typeof effect.id === 'number' ? effect.id : null
  } else if (effect.kind === 'sticker' && effect.asset_url) {
    if (state.stickers.length >= 20) { error.value = 'Up to 20 stickers per vibe.'; return }
    const sticker: StickerPlacement = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      src: effect.asset_url, effectId: typeof effect.id === 'number' ? effect.id : null,
      x: 0.5, y: 0.4, scale: 0.25, rotation: 0, start: null, end: null,
    }
    state.stickers = [...state.stickers, sticker]
    selectedId.value = sticker.id
  } else if (effect.kind === 'background') {
    backgroundName.value = effect.name
    state.background = effect.id === 'builtin:blur'
      ? { mode: 'blur', amount: 12 }
      : { mode: 'image', src: effect.asset_url, effectId: typeof effect.id === 'number' ? effect.id : null }
  }
}

function onMade() {
  reloadEffects.value += 1
}

// Background removal loads the first time a background is chosen.
watch(() => state.background.mode, async (mode) => {
  if (mode === 'none' || segment) return
  segmenterLoading.value = true
  try {
    const segmenter = await loadSegmenter()
    segment = (frameSource) => segmenter.segment(frameSource)
  } catch (e) {
    console.error('[vibe-editor] segmenter', e)
    error.value = "Background removal isn't available in this browser."
    state.background = { mode: 'none' }
  } finally {
    segmenterLoading.value = false
  }
})

// Dragging stickers on the preview.
const dragging = ref(false)
let dragOffset = { x: 0, y: 0 }
function pointAt(event: PointerEvent) {
  const rect = canvas.value!.getBoundingClientRect()
  return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }
}
function hit(point: { x: number, y: number }): StickerPlacement | null {
  const c = canvas.value!
  const aspect = c.width / c.height
  for (let i = state.stickers.length - 1; i >= 0; i--) {
    const s = state.stickers[i]!
    const half = s.scale / 2
    if (Math.abs(point.x - s.x) <= half && Math.abs(point.y - s.y) <= half * aspect) return s
  }
  return null
}
function onPointerDown(event: PointerEvent) {
  const point = pointAt(event)
  const sticker = hit(point)
  if (!sticker) { selectedId.value = null; return }
  selectedId.value = sticker.id
  panel.value = 'sticker'
  dragging.value = true
  dragOffset = { x: point.x - sticker.x, y: point.y - sticker.y }
  canvas.value!.setPointerCapture(event.pointerId)
}
function onPointerMove(event: PointerEvent) {
  if (!dragging.value || !selected.value) return
  const point = pointAt(event)
  selected.value.x = Math.min(1, Math.max(0, point.x - dragOffset.x))
  selected.value.y = Math.min(1, Math.max(0, point.y - dragOffset.y))
}
function onPointerUp() {
  dragging.value = false
}

// -- 3. Posting ------------------------------------------------------------------
const phase = ref('')
const progress = ref(0)
const uploadedId = ref<number | string | null>(null)
let abort: AbortController | null = null

async function post() {
  if (!source.value) return
  error.value = ''
  previewVideo.value?.pause()
  playing.value = false
  abort = new AbortController()
  step.value = 'posting'
  try {
    let file: Blob = source.value
    if (hasEffects(state)) {
      phase.value = 'Adding your effects…'
      progress.value = 0
      file = await exportVibe({ source: source.value, state, segment, signal: abort.signal, onProgress: (p) => { progress.value = p } })
    }
    phase.value = 'Uploading…'
    progress.value = 1
    const ext = file.type.includes('webm') ? 'webm' : file.type.includes('quicktime') ? 'mov' : 'mp4'
    const form = new FormData()
    form.append('name', title.value.trim())
    form.append('video', new File([file], `vibe.${ext}`, { type: file.type.split(';')[0] || 'video/mp4' }))
    const result = await $fetch<{ id: number | string, url: string }>('/api/upload-video', { method: 'POST', body: form, signal: abort.signal })
    uploadedId.value = result.id
    step.value = 'done'
    emit('posted', result)
  } catch (e: any) {
    if (e?.name === 'AbortError') { step.value = 'edit'; return }
    error.value = e?.data?.statusMessage || e?.message || "Your vibe couldn't be posted. Please try again."
    step.value = 'edit'
  }
}

function cancelPost() {
  abort?.abort()
}

watch(step, (value) => {
  if (value === 'edit') nextTick(() => { if (previewVideo.value && sourceUrl && previewVideo.value.src !== sourceUrl) previewVideo.value.src = sourceUrl; else if (renderer) loop() })
})

function startOver() {
  stopCamera()
  cancelAnimationFrame(frame)
  if (sourceUrl) URL.revokeObjectURL(sourceUrl)
  sourceUrl = ''
  source.value = null
  Object.assign(state, emptyState())
  selectedId.value = null
  filterName.value = ''
  title.value = ''
  uploadedId.value = null
  error.value = ''
  renderer = null
  step.value = 'source'
}

onBeforeUnmount(() => {
  stopCamera()
  cancelAnimationFrame(frame)
  clearInterval(recordTimer)
  abort?.abort()
  if (sourceUrl) URL.revokeObjectURL(sourceUrl)
})
</script>

<style scoped>
.vibe-editor__stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  overflow: hidden;
  border-radius: 12px;
  background: #111;
  color: #fff;
}

.vibe-editor__camera,
.vibe-editor__canvas {
  display: block;
  max-width: 100%;
  max-height: 70vh;
}

.vibe-editor__camera {
  transform: scaleX(-1);
}

.vibe-editor__canvas {
  touch-action: none;
  cursor: grab;
}

.vibe-editor__canvas--drag {
  cursor: grabbing;
}

.vibe-editor__empty {
  max-width: 320px;
  padding: 24px;
  text-align: center;
}

.vibe-editor__rec {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(220, 0, 0, 0.85);
  font-weight: 700;
}

.vibe-editor__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  font-size: 0.8rem;
}

.vibe-editor__edit {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 3fr) minmax(280px, 2fr);
}

.vibe-editor__panel {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  max-height: 80vh;
  overflow: auto;
}

.vibe-editor__post {
  grid-column: 1 / -1;
}

.vibe-editor__selected {
  padding: 8px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.06);
}

.vibe-editor__status {
  max-width: 480px;
  margin: 48px auto;
  text-align: center;
}

@media (max-width: 900px) {
  .vibe-editor__edit {
    grid-template-columns: 1fr;
  }
}
</style>
