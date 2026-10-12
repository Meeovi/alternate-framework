<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DiscussionInfo, DiscussionSession, MeeoviDiscussionsPublicConfig } from '../types'

/**
 * The live discussion for one content object — a Rocket.Chat room shown in
 * its embedded layout (just the conversation), signed in with the visitor's
 * Meeovi session. Guests see a sign-in prompt.
 *
 *   <MeeoviDiscussion type="product" :id="product.id" :title="product.name" />
 *   <MeeoviDiscussion type="post" :id="post.id" collapsed />   (feeds: opens on click)
 */
const props = withDefaults(defineProps<{
  /** Object type: post, product, outlet, video, vibe, space, station, … */
  type: string
  id: string | number
  /** Shown as the room topic when the room is first created. */
  title?: string
  /** Show a "Join the live discussion" bar and load the room on click. */
  collapsed?: boolean
  height?: string
}>(), { title: '', collapsed: false, height: '520px' })

const config = useRuntimeConfig().public.meeoviDiscussions as MeeoviDiscussionsPublicConfig | undefined
const apiBase = config?.apiBase || '/api/discussions'
const rcOrigin = (() => { try { return new URL(config?.url || '').origin } catch { return '' } })()
const path = computed(() => `${apiBase}/${encodeURIComponent(props.type)}/${encodeURIComponent(String(props.id))}`)
const route = useRoute()

type State = 'loading' | 'guest' | 'closed' | 'opening' | 'open' | 'unavailable'
const state = ref<State>('loading')
const info = ref<DiscussionInfo | null>(null)
const session = ref<DiscussionSession | null>(null)
const frame = ref<HTMLIFrameElement | null>(null)

const count = computed(() => info.value?.messages ?? 0)
const countLabel = computed(() => (count.value === 1 ? '1 message' : `${count.value.toLocaleString()} messages`))
const loginUrl = computed(() => `${config?.loginPath || '/login'}?redirect=${encodeURIComponent(route.fullPath)}`)

async function open() {
  state.value = 'opening'
  try {
    session.value = await $fetch<DiscussionSession>(`${path.value}/session`, { method: 'POST', body: { title: props.title } })
    state.value = 'open'
  } catch (e: any) {
    state.value = (e?.statusCode ?? e?.status) === 401 ? 'guest' : 'unavailable'
  }
}

// Log the embed in: Rocket.Chat's iframe integration accepts
// `login-with-token` from the embedding page. Sent when the iframe loads and
// again when Rocket.Chat reports it has started (whichever comes later).
function sendLogin() {
  if (!session.value || !frame.value?.contentWindow || !rcOrigin) return
  frame.value.contentWindow.postMessage({ externalCommand: 'login-with-token', token: session.value.token }, rcOrigin)
}
function onMessage(event: MessageEvent) {
  if (event.origin !== rcOrigin || event.source !== frame.value?.contentWindow) return
  if (event.data?.eventName === 'startup') sendLogin()
}

onMounted(async () => {
  window.addEventListener('message', onMessage)
  try {
    info.value = await $fetch<DiscussionInfo>(path.value)
  } catch {
    state.value = 'unavailable'
    return
  }
  if (!info.value.signedIn) state.value = 'guest'
  else if (props.collapsed) state.value = 'closed'
  else await open()
})
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <section class="meeovi-discussion" aria-label="Live discussion">
    <div v-if="state === 'loading'" class="meeovi-discussion__bar">
      <v-progress-circular indeterminate size="18" width="2" />
      <span>Loading the discussion…</span>
    </div>

    <v-card v-else-if="state === 'guest'" variant="tonal" class="meeovi-discussion__prompt">
      <v-card-item prepend-icon="fas fa-comments">
        <v-card-title>Live discussion</v-card-title>
        <v-card-subtitle v-if="count">{{ countLabel }}</v-card-subtitle>
      </v-card-item>
      <v-card-text>Sign in to join the live discussion.</v-card-text>
      <v-card-actions>
        <v-btn :href="loginUrl" color="primary" variant="flat" text="Sign in" />
      </v-card-actions>
    </v-card>

    <v-btn v-else-if="state === 'closed' || (collapsed && state === 'opening')" block variant="tonal"
      prepend-icon="fas fa-comments" :loading="state === 'opening'" @click="open">
      Join the live discussion<template v-if="count"> ({{ count.toLocaleString() }})</template>
    </v-btn>

    <div v-else-if="state === 'opening'" class="meeovi-discussion__bar">
      <v-progress-circular indeterminate size="18" width="2" />
      <span>Joining the discussion…</span>
    </div>

    <iframe v-else-if="state === 'open' && session" ref="frame" :src="session.embedUrl" :style="{ height }"
      class="meeovi-discussion__frame" title="Live discussion" allow="clipboard-write; fullscreen" @load="sendLogin" />

    <v-alert v-else type="info" variant="tonal" density="compact" text="The live discussion isn't available right now." />
  </section>
</template>

<style scoped>
.meeovi-discussion {
  margin-top: 16px;
}

.meeovi-discussion__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  opacity: 0.7;
}

.meeovi-discussion__frame {
  display: block;
  width: 100%;
  border: 0;
  border-radius: 8px;
}
</style>
