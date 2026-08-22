<template>
  <v-container class="py-6" fluid>
    <v-row style="height: 75vh;">
      <v-col cols="12" sm="4" class="d-flex flex-column" style="border-right: 1px solid rgba(0,0,0,0.08);">
        <div class="d-flex align-center pa-2">
          <v-text-field
            v-model="newConversationEmail"
            label="Start a conversation by email"
            density="compact"
            variant="outlined"
            hide-details
            @keyup.enter="startConversation"
          />
          <v-btn class="ml-2" icon="fas fa-paper-plane" size="small" @click="startConversation" :loading="startingConversation" />
        </div>
        <p v-if="startError" class="text-caption text-error px-2">{{ startError }}</p>

        <v-list lines="two" nav>
          <v-list-item
            v-for="room in rooms"
            :key="room.id"
            :active="room.id === activeRoomId"
            :title="room.otherUser?.name || 'Unknown user'"
            subtitle="Direct message"
            @click="openRoom(room.id)"
          />
          <v-list-item v-if="!rooms.length" subtitle="No conversations yet" />
        </v-list>
      </v-col>

      <v-col cols="12" sm="8" class="d-flex flex-column">
        <template v-if="activeRoomId">
          <div class="flex-grow-1 overflow-y-auto pa-2">
            <div
              v-for="message in messages"
              :key="message.id"
              class="mb-2 d-flex"
              :class="message.userId === currentUser?.id ? 'justify-end' : 'justify-start'"
            >
              <v-sheet
                class="pa-2 rounded-lg"
                :color="message.userId === currentUser?.id ? 'primary' : undefined"
                max-width="70%"
              >
                <div class="text-caption font-weight-bold">{{ message.username }}</div>
                <div>{{ message.text }}</div>
              </v-sheet>
            </div>
          </div>

          <div class="d-flex pa-2">
            <v-text-field
              v-model="draft"
              label="Message"
              density="compact"
              variant="outlined"
              hide-details
              @keyup.enter="send"
            />
            <v-btn class="ml-2" icon="fas fa-paper-plane" @click="send" />
          </div>
        </template>
        <div v-else class="d-flex align-center justify-center flex-grow-1 text-medium-emphasis">
          Select a conversation to start messaging.
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Real DM UI backed by server/utils/chat-store.ts — an in-memory store
// shared by every client hitting this Nitro process. It resets on server
// restart and isn't shared across multiple server instances in a scaled
// deployment (a real persistent backend, e.g. Directus collections, is
// what this should eventually move to), but two real users on the same
// server can genuinely exchange messages — the previous version of this
// page was unmodified SVAR demo boilerplate pointed at a placeholder
// domain and could never do that at all.
import { ref, onMounted, onUnmounted } from '#imports'

const currentUser = useCurrentUser()

const rooms = ref([])
const activeRoomId = ref(null)
const messages = ref([])
const draft = ref('')
const newConversationEmail = ref('')
const startingConversation = ref(false)
const startError = ref('')

let pollInterval = null

async function loadRooms() {
  const { data } = await $fetch('/api/social/chat/rooms')
  rooms.value = data
}

async function loadMessages() {
  if (!activeRoomId.value) return
  const { data } = await $fetch(`/api/social/chat/rooms/${activeRoomId.value}/messages`)
  messages.value = data
}

function openRoom(roomId) {
  activeRoomId.value = roomId
  loadMessages()
}

async function send() {
  const text = draft.value.trim()
  if (!text || !activeRoomId.value) return
  draft.value = ''
  await $fetch(`/api/social/chat/rooms/${activeRoomId.value}/messages`, {
    method: 'POST',
    body: { text },
  })
  await loadMessages()
}

async function startConversation() {
  const email = newConversationEmail.value.trim()
  if (!email) return
  startError.value = ''
  startingConversation.value = true
  try {
    const { id } = await $fetch('/api/social/chat/rooms', {
      method: 'POST',
      body: { targetEmail: email },
    })
    newConversationEmail.value = ''
    await loadRooms()
    openRoom(id)
  } catch (error) {
    startError.value = error?.data?.statusMessage || 'Could not start conversation.'
  } finally {
    startingConversation.value = false
  }
}

onMounted(() => {
  loadRooms()
  // Simple polling rather than a WebSocket/SSE channel — pragmatic given
  // the in-memory, single-process store above; swap for a push-based
  // subscription once this moves to a real backend.
  pollInterval = setInterval(() => {
    loadRooms()
    if (activeRoomId.value) loadMessages()
  }, 3000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
