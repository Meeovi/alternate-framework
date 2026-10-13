<template>
    <section class="space-media" :aria-label="`${kindLabel} discussion`">
        <div v-if="state === 'loading'" class="space-media__center">
            <v-progress-circular indeterminate size="24" width="2" />
        </div>

        <v-alert v-else-if="state === 'error'" type="info" variant="tonal" class="ma-4"
            :text="`The ${kindLabel.toLowerCase()} discussion isn't available right now.`" />

        <!-- Members only: everyone else is invited to join. -->
        <v-card v-else-if="!info?.member" variant="tonal" class="ma-4 text-center pa-4">
            <v-icon :icon="kindIcon" size="32" class="mb-2" />
            <v-card-title>{{ kindLabel }} discussion</v-card-title>
            <v-card-text>Join this space to {{ verbs }} and post {{ kindNoun }} messages.</v-card-text>
            <v-card-actions class="justify-center">
                <FollowButton entity-type="space" :id="String(spaceId)" follow-label="Join space" unfollow-label="Leave space"
                    @change="load()" />
            </v-card-actions>
        </v-card>

        <template v-else>
            <!-- Composer: record or upload; no text. -->
            <v-card variant="outlined" class="ma-4">
                <v-card-text>
                    <div v-if="recorder.state === 'idle' && !draft" class="d-flex flex-wrap ga-2 align-center">
                        <v-btn v-if="canRecord" color="primary" variant="flat" :prepend-icon="kindIcon" @click="startRecording">
                            Record {{ kindNoun }}
                        </v-btn>
                        <v-btn variant="tonal" prepend-icon="fas fa-upload" :loading="posting" @click="fileInput?.click()">
                            Upload {{ kindNoun }}
                        </v-btn>
                        <input ref="fileInput" type="file" class="d-none" :accept="accept" @change="onFile">
                        <span v-if="!canRecord" class="text-caption text-medium-emphasis">
                            Recording needs a secure (https) page and a {{ kinds.includes('video') ? 'camera' : 'microphone' }}; you can still upload.
                        </span>
                    </div>

                    <!-- Recording -->
                    <div v-else-if="recorder.state === 'recording'" class="d-flex flex-column ga-2">
                        <video v-if="recordKind === 'video'" ref="livePreview" class="space-media__live" muted playsinline autoplay />
                        <div class="d-flex align-center ga-3">
                            <span class="space-media__dot" aria-hidden="true" />
                            <span>Recording {{ clock(recorder.seconds) }} / {{ clock(maxSeconds) }}</span>
                            <v-spacer />
                            <v-btn color="error" variant="flat" prepend-icon="fas fa-stop" @click="stopRecording">Stop</v-btn>
                        </div>
                    </div>

                    <!-- Review before posting -->
                    <div v-else-if="draft" class="d-flex flex-column ga-2">
                        <MeeoviPlayer :src="draft.url" :type="draft.type" :kind="draft.kind" :title="`Your ${draft.kind} message`" />
                        <div class="d-flex ga-2 justify-end">
                            <v-btn variant="text" :disabled="posting" @click="discardDraft">Discard</v-btn>
                            <v-btn color="primary" variant="flat" prepend-icon="fas fa-paper-plane" :loading="posting" @click="postDraft">Post</v-btn>
                        </div>
                    </div>

                    <v-alert v-if="error" type="warning" variant="tonal" density="compact" class="mt-3" :text="error" closable
                        @click:close="error = ''" />
                </v-card-text>
            </v-card>

            <!-- Feed -->
            <div v-if="messages.length" class="px-4 pb-4">
                <v-card v-for="m in messages" :key="m.id" variant="flat" class="space-media__item mb-3">
                    <v-card-item>
                        <template #prepend>
                            <v-avatar size="36"><v-img :src="m.author.avatar" :alt="m.author.name" /></v-avatar>
                        </template>
                        <v-card-title class="text-subtitle-2">{{ m.author.name }}</v-card-title>
                        <v-card-subtitle>{{ when(m.at) }}</v-card-subtitle>
                        <template #append>
                            <v-btn v-if="m.canDelete" icon="fas fa-trash" variant="text" size="small"
                                :aria-label="m.mine ? 'Delete your message' : 'Remove this message'" :loading="deleting === m.id"
                                @click="remove(m)" />
                        </template>
                    </v-card-item>
                    <v-card-text class="pt-0">
                        <MeeoviPlayer :src="m.src" :type="m.type" :kind="m.kind" :title="`${m.author.name}'s ${m.kind} message`" />
                    </v-card-text>
                </v-card>
                <div v-if="hasMore" class="text-center">
                    <v-btn variant="text" :loading="loadingMore" @click="loadMore">Load earlier messages</v-btn>
                </div>
            </div>
            <p v-else class="text-center text-medium-emphasis py-6">
                No {{ kindNoun }} messages yet. Be the first to post one.
            </p>
        </template>
    </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import FollowButton from '#social/app/components/blocks/FollowButton.vue'

/**
 * Audio-only / video-only discussion for Audio and Video spaces: voice or
 * video messages, stored in the space's private Rocket.Chat group (see
 * server/utils/spaceMedia.ts). Members only; space admins can remove any
 * message, members their own.
 */
const props = defineProps<{ spaceId: string | number }>()

type Kind = 'audio' | 'video'
type Message = {
    id: string, kind: Kind, src: string, type: string, name: string,
    author: { name: string, avatar: string }, at: string, mine: boolean, canDelete: boolean,
}
type Info = { member: boolean, admin: boolean, kinds: Kind[], limits: Partial<Record<Kind, number>>, messages: Message[], hasMore: boolean, before: string | null }

const api = computed(() => `/api/social/spaces/${props.spaceId}/media`)
const state = ref<'loading' | 'ready' | 'error'>('loading')
const info = ref<Info | null>(null)
const messages = ref<Message[]>([])
const hasMore = ref(false)
const cursor = ref<string | null>(null)
const loadingMore = ref(false)
const error = ref('')

const kinds = computed<Kind[]>(() => info.value?.kinds ?? [])
// A space that's both Audio and Video records video (which has sound).
const recordKind = computed<Kind>(() => (kinds.value.includes('video') ? 'video' : 'audio'))
const kindLabel = computed(() => (kinds.value.length > 1 ? 'Audio & video' : recordKind.value === 'video' ? 'Video' : 'Audio'))
const kindNoun = computed(() => (kinds.value.length > 1 ? 'audio or video' : recordKind.value === 'video' ? 'video' : 'voice'))
const kindIcon = computed(() => (recordKind.value === 'video' ? 'fas fa-video' : 'fas fa-microphone'))
const verbs = computed(() => (kinds.value.length > 1 ? 'listen, watch' : recordKind.value === 'video' ? 'watch' : 'listen'))
const accept = computed(() => kinds.value.map((k) => `${k}/*`).join(',') || 'audio/*')
// Kept well under the upload limits for typical bitrates.
const maxSeconds = computed(() => (recordKind.value === 'video' ? 180 : 300))

async function load() {
    try {
        const res = await $fetch<Info>(api.value)
        info.value = res
        messages.value = res.messages
        hasMore.value = res.hasMore
        cursor.value = res.before
        state.value = 'ready'
    } catch (e: any) {
        if (!info.value) state.value = 'error'
    }
}

async function loadMore() {
    if (!cursor.value) return
    loadingMore.value = true
    try {
        const res = await $fetch<Info>(api.value, { query: { before: cursor.value } })
        const seen = new Set(messages.value.map((m) => m.id))
        messages.value.push(...res.messages.filter((m) => !seen.has(m.id)))
        hasMore.value = res.hasMore
        cursor.value = res.before
    } finally {
        loadingMore.value = false
    }
}

/** New messages since the last load (keeps anything already paged in). */
async function refreshNewest() {
    if (!info.value?.member || document.hidden) return
    const res = await $fetch<Info>(api.value).catch(() => null)
    if (!res) return
    const fresh = res.messages
    const freshIds = new Set(fresh.map((m) => m.id))
    const oldestFresh = fresh[fresh.length - 1]?.at
    const older = messages.value.filter((m) => !freshIds.has(m.id) && (!oldestFresh || m.at < oldestFresh))
    messages.value = [...fresh, ...older]
}

// -- posting -----------------------------------------------------------------
const posting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function upload(blob: Blob, filename: string) {
    const kind = blob.type.split('/')[0] as Kind
    if (!kinds.value.includes(kind)) {
        error.value = `This space only takes ${kinds.value.join(' or ')} messages.`
        return false
    }
    const limit = info.value?.limits?.[kind]
    if (limit && blob.size > limit) {
        error.value = `That ${kind} is too large (max ${Math.round(limit / 1024 / 1024)} MB).`
        return false
    }
    posting.value = true
    error.value = ''
    try {
        const form = new FormData()
        form.append('file', blob, filename)
        await $fetch(api.value, { method: 'POST', body: form })
        await load()
        return true
    } catch (e: any) {
        error.value = e?.data?.statusMessage || e?.statusMessage || "Couldn't post that. Please try again."
        return false
    } finally {
        posting.value = false
    }
}

/** Does this file have a picture? (false for audio-only, null if unknown) */
function hasVideoTrack(file: Blob): Promise<boolean | null> {
    return new Promise((resolve) => {
        const el = document.createElement('video')
        const url = URL.createObjectURL(file)
        const done = (v: boolean | null) => { URL.revokeObjectURL(url); resolve(v) }
        el.preload = 'metadata'
        el.muted = true
        el.onloadedmetadata = () => done(el.videoWidth > 0)
        el.onerror = () => done(null)
        setTimeout(() => done(null), 5000)
        el.src = url
    })
}

async function onFile(event: Event) {
    const input = event.target as HTMLInputElement
    let file: Blob | undefined = input.files?.[0]
    input.value = ''
    if (!file) return
    const name = (file as File).name
    // Browsers label .webm/.ogg/.mp4 files as video by extension, even when
    // they only hold sound: relabel audio-only files as audio (refused in a
    // Video space, accepted in an Audio one).
    if (file.type.startsWith('video/') && await hasVideoTrack(file) === false) {
        if (!kinds.value.includes('audio')) {
            error.value = "That file has no picture. This space only takes video messages."
            return
        }
        file = new Blob([file], { type: file.type.replace(/^video\//, 'audio/') })
    }
    await upload(file, name)
}

// -- recording ---------------------------------------------------------------
const canRecord = ref(false)
const recorder = reactive({ state: 'idle' as 'idle' | 'recording', seconds: 0 })
const livePreview = ref<HTMLVideoElement | null>(null)
const draft = ref<{ blob: Blob, url: string, type: string, kind: Kind } | null>(null)
let media: MediaRecorder | null = null
let stream: MediaStream | null = null
let chunks: Blob[] = []
let ticker: ReturnType<typeof setInterval> | null = null

function pickMime(kind: Kind) {
    const options = kind === 'video'
        ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
        : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
    return options.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

async function startRecording() {
    error.value = ''
    const kind = recordKind.value
    try {
        stream = await navigator.mediaDevices.getUserMedia(kind === 'video' ? { audio: true, video: true } : { audio: true })
    } catch {
        error.value = kind === 'video' ? 'Allow camera and microphone access to record.' : 'Allow microphone access to record.'
        return
    }
    const mimeType = pickMime(kind)
    media = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    chunks = []
    media.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
    media.onstop = () => {
        const type = (media?.mimeType || mimeType || `${kind}/webm`).split(';')[0]!
        const blob = new Blob(chunks, { type })
        draft.value = { blob, url: URL.createObjectURL(blob), type, kind }
        releaseStream()
    }
    media.start(1000)
    recorder.state = 'recording'
    recorder.seconds = 0
    ticker = setInterval(() => {
        recorder.seconds += 1
        if (recorder.seconds >= maxSeconds.value) stopRecording()
    }, 1000)
    if (kind === 'video') requestAnimationFrame(() => { if (livePreview.value) livePreview.value.srcObject = stream })
}

function stopRecording() {
    if (ticker) clearInterval(ticker)
    ticker = null
    recorder.state = 'idle'
    if (media && media.state !== 'inactive') media.stop()
}

function releaseStream() {
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
}

function discardDraft() {
    if (draft.value) URL.revokeObjectURL(draft.value.url)
    draft.value = null
}

async function postDraft() {
    if (!draft.value) return
    const ext = draft.value.type.split('/')[1]?.replace(/[^a-z0-9]/g, '') || 'webm'
    const ok = await upload(draft.value.blob, `${draft.value.kind}-message-${Date.now()}.${ext}`)
    if (ok) discardDraft()
}

// -- removing ----------------------------------------------------------------
const deleting = ref<string | null>(null)
async function remove(m: Message) {
    const prompt = m.mine ? 'Delete your message?' : `Remove ${m.author.name}'s message from this space?`
    if (!window.confirm(prompt)) return
    deleting.value = m.id
    try {
        await $fetch(`${api.value}/${encodeURIComponent(m.id)}`, { method: 'DELETE' })
        messages.value = messages.value.filter((x) => x.id !== m.id)
    } catch (e: any) {
        error.value = e?.data?.statusMessage || "Couldn't remove that message."
    } finally {
        deleting.value = null
    }
}

// -- helpers -----------------------------------------------------------------
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
function when(at: string) {
    const d = new Date(at)
    const mins = Math.round((Date.now() - d.getTime()) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' })
}

let poll: ReturnType<typeof setInterval> | null = null
onMounted(async () => {
    canRecord.value = Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined')
    await load()
    poll = setInterval(refreshNewest, 20000)
})
onBeforeUnmount(() => {
    if (poll) clearInterval(poll)
    if (ticker) clearInterval(ticker)
    if (media && media.state !== 'inactive') media.stop()
    releaseStream()
    discardDraft()
})
</script>

<style scoped>
.space-media__center {
    display: flex;
    justify-content: center;
    padding: 32px 0;
}

.space-media__item {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.space-media__live {
    width: 100%;
    max-height: 360px;
    border-radius: 8px;
    background: #000;
}

.space-media__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgb(var(--v-theme-error));
    animation: space-media-pulse 1s infinite;
}

@keyframes space-media-pulse {
    50% { opacity: 0.3; }
}
</style>
