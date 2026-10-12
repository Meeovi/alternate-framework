<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MeeoviDiscussionsPublicConfig, MessagesConversation, MessagesMember, MessagesSession } from '../types'

/**
 * Private messages between members: your conversations on the left, the
 * open one on the right in Rocket.Chat's embedded layout (just the
 * conversation), signed in with your Meeovi session.
 *
 *   <MeeoviMessages />
 *
 * `?to=<memberId>` starts a conversation with that member (e.g. a profile's
 * "Message" button); `?c=<roomId>` opens one.
 */
const props = withDefaults(defineProps<{ height?: string }>(), { height: 'calc(100vh - 220px)' })

const config = useRuntimeConfig().public.meeoviDiscussions as MeeoviDiscussionsPublicConfig | undefined
const apiBase = config?.apiBase || '/api/discussions'
const membersEndpoint = config?.membersEndpoint || '/api/social/members'
const route = useRoute()
const router = useRouter()

type State = 'loading' | 'guest' | 'ready' | 'unavailable'
const state = ref<State>('loading')
const conversations = ref<MessagesConversation[]>([])
const session = ref<MessagesSession | null>(null)
const activeRid = ref<string | null>(null)
const error = ref('')
const rcOrigin = computed(() => { try { return new URL(session.value?.url || config?.url || '').origin } catch { return '' } })
const active = computed(() => conversations.value.find((c) => c.rid === activeRid.value) ?? null)

// -- the embed ---------------------------------------------------------------
const frame = ref<HTMLIFrameElement | null>(null)
const frameSrc = ref('')
const frameLoaded = ref(false)
const pathFor = (rid: string) => `/direct/${encodeURIComponent(rid)}?layout=embedded`

function sendLogin() {
  if (!session.value || !frame.value?.contentWindow || !rcOrigin.value) return
  frame.value.contentWindow.postMessage({ externalCommand: 'login-with-token', token: session.value.token }, rcOrigin.value)
}
function onFrameLoad() {
  frameLoaded.value = true
  sendLogin()
}
/** Switch conversations inside the signed-in embed instead of reloading it. */
function showInFrame(rid: string) {
  const path = pathFor(rid)
  if (frameLoaded.value && frame.value?.contentWindow && rcOrigin.value) {
    frame.value.contentWindow.postMessage({ externalCommand: 'go', path }, rcOrigin.value)
  } else {
    frameSrc.value = `${rcOrigin.value}${path}`
  }
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null
function refreshSoon() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(loadConversations, 800)
}
function onMessage(event: MessageEvent) {
  if (event.origin !== rcOrigin.value || event.source !== frame.value?.contentWindow) return
  const name = event.data?.eventName
  if (name === 'startup') sendLogin()
  if (name === 'unread-changed' || name === 'new-message' || name === 'room-opened') refreshSoon()
}

// -- data --------------------------------------------------------------------
async function loadConversations() {
  try {
    conversations.value = (await $fetch<{ conversations: MessagesConversation[] }>(`${apiBase}/messages`)).conversations
  } catch (e: any) {
    if ((e?.statusCode ?? e?.status) === 401) state.value = 'guest'
  }
}

function select(rid: string) {
  activeRid.value = rid
  showInFrame(rid)
  const c = conversations.value.find((x) => x.rid === rid)
  if (c) c.unread = 0
  if (route.query.c !== rid || route.query.to) router.replace({ query: { ...route.query, c: rid, to: undefined } })
}

async function startWith(memberId: string) {
  error.value = ''
  try {
    const { rid } = await $fetch<{ rid: string }>(`${apiBase}/messages`, { method: 'POST', body: { userId: memberId } })
    await loadConversations()
    select(rid)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || "Couldn't start that conversation."
  }
}

// -- new message search ----------------------------------------------------
const search = ref('')
const results = ref<MessagesMember[]>([])
const searching = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (q) => {
  if (searchTimer) clearTimeout(searchTimer)
  const text = String(q || '').trim()
  if (text.length < 2) { results.value = []; return }
  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      results.value = await $fetch<MessagesMember[]>(membersEndpoint, { query: { q: text } })
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 250)
})
// Vuetify 3 wraps slot items ({ raw }); Vuetify 4 passes the item itself.
const memberOf = (item: any): MessagesMember => (item?.raw ?? item) as MessagesMember

function pick(member: MessagesMember | null) {
  if (!member?.id) return
  search.value = ''
  results.value = []
  startWith(member.id)
}

// -- helpers -----------------------------------------------------------------
function timeLabel(at: string | null) {
  if (!at) return ''
  const d = new Date(at)
  const now = new Date()
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  window.addEventListener('message', onMessage)
  try {
    session.value = await $fetch<MessagesSession>(`${apiBase}/messages/session`, { method: 'POST' })
  } catch (e: any) {
    state.value = (e?.statusCode ?? e?.status) === 401 ? 'guest' : 'unavailable'
    return
  }
  await loadConversations()
  if (state.value === 'guest') return
  state.value = 'ready'
  const to = typeof route.query.to === 'string' ? route.query.to : ''
  const c = typeof route.query.c === 'string' ? route.query.c : ''
  if (to) await startWith(to)
  else if (c) select(c)
  else if (conversations.value[0] && window.matchMedia('(min-width: 960px)').matches) select(conversations.value[0].rid)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  if (refreshTimer) clearTimeout(refreshTimer)
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <section class="meeovi-messages" :class="{ 'meeovi-messages--open': activeRid }" :style="{ height: props.height }" aria-label="Private messages">
    <div v-if="state === 'loading'" class="meeovi-messages__center">
      <v-progress-circular indeterminate size="24" width="2" />
    </div>

    <v-card v-else-if="state === 'guest'" variant="tonal" class="ma-4">
      <v-card-text>Sign in to see your messages.</v-card-text>
      <v-card-actions>
        <v-btn :href="`${config?.loginPath || '/login'}?redirect=${encodeURIComponent(route.fullPath)}`" color="primary" variant="flat" text="Sign in" />
      </v-card-actions>
    </v-card>

    <v-alert v-else-if="state === 'unavailable'" type="info" variant="tonal" class="ma-4"
      text="Messages aren't available right now. Please try again later." />

    <template v-else>
      <aside class="meeovi-messages__list">
        <v-autocomplete
          v-model:search="search"
          :items="results"
          :loading="searching"
          item-title="name"
          item-value="id"
          return-object
          no-filter
          hide-details
          clearable
          density="comfortable"
          variant="outlined"
          prepend-inner-icon="fas fa-pen-to-square"
          placeholder="New message: search members"
          class="ma-3"
          :no-data-text="search && search.trim().length >= 2 ? 'No members found' : 'Type a name'"
          @update:model-value="pick"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :title="memberOf(item).name" :subtitle="memberOf(item).username ? `@${memberOf(item).username}` : undefined">
              <template #prepend>
                <v-avatar size="32" color="grey-lighten-2">
                  <v-img v-if="memberOf(item).image" :src="memberOf(item).image!" />
                  <span v-else>{{ memberOf(item).name?.[0] }}</span>
                </v-avatar>
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>

        <v-alert v-if="error" type="warning" variant="tonal" density="compact" class="mx-3 mb-2" :text="error" closable @click:close="error = ''" />

        <v-list v-if="conversations.length" lines="two" class="py-0" nav>
          <v-list-item
            v-for="c in conversations"
            :key="c.rid"
            :active="c.rid === activeRid"
            :title="c.name"
            @click="select(c.rid)"
          >
            <template #prepend>
              <v-avatar size="40"><v-img :src="c.avatar" :alt="c.name" /></v-avatar>
            </template>
            <template #subtitle>
              <span :class="{ 'font-weight-bold': c.unread }">
                <template v-if="c.lastMessage?.mine">You: </template>{{ c.lastMessage?.text || 'No messages yet' }}
              </span>
            </template>
            <template #append>
              <div class="d-flex flex-column align-end ga-1">
                <span class="text-caption">{{ timeLabel(c.lastMessage?.at || c.updatedAt) }}</span>
                <v-badge v-if="c.unread" :content="c.unread" color="primary" inline />
              </div>
            </template>
          </v-list-item>
        </v-list>
        <p v-else class="text-medium-emphasis text-body-2 px-4 py-6">
          No messages yet. Search for a member above to start a conversation.
        </p>
      </aside>

      <div class="meeovi-messages__chat">
        <div v-if="active || activeRid" class="meeovi-messages__header">
          <v-btn class="meeovi-messages__back" icon="fas fa-arrow-left" variant="text" size="small" aria-label="Back to conversations"
            @click="activeRid = null" />
          <span class="text-subtitle-1">{{ active?.name }}</span>
        </div>
        <iframe v-show="activeRid" v-if="frameSrc" ref="frame" :src="frameSrc" class="meeovi-messages__frame"
          title="Private conversation" allow="clipboard-write; fullscreen; microphone; camera" @load="onFrameLoad" />
        <div v-if="!activeRid" class="meeovi-messages__center text-medium-emphasis">
          <v-icon icon="fas fa-comments" size="32" class="mb-2" />
          <span>Choose a conversation, or start a new one.</span>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.meeovi-messages {
  display: flex;
  min-height: 420px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}

.meeovi-messages__list {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.meeovi-messages__chat {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.meeovi-messages__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.meeovi-messages__back {
  display: none;
}

.meeovi-messages__frame {
  flex: 1;
  width: 100%;
  border: 0;
}

.meeovi-messages__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Phones: the list, or the open conversation. */
@media (max-width: 959px) {
  .meeovi-messages__list {
    width: 100%;
    border-right: 0;
  }

  .meeovi-messages__chat {
    display: none;
  }

  .meeovi-messages--open .meeovi-messages__list {
    display: none;
  }

  .meeovi-messages--open .meeovi-messages__chat {
    display: flex;
  }

  .meeovi-messages__back {
    display: inline-flex;
  }
}
</style>
