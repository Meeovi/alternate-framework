<template>
  <v-container class="py-10">
    <v-card elevation="2" class="pa-6">
      <v-card-title>{{ video?.title }}</v-card-title>
      <v-card-subtitle>
        {{ video?.visibility }} • {{ formatDuration(video?.duration) }} • 👁️ {{ video?.view_count }}
      </v-card-subtitle>

      <v-card-text>
        <video
          v-if="video?.status === 'ready'"
          controls
          :src="getVideoUrl(video)"
          style="width: 100%; max-height: 500px;"
        />

        <v-chip
          v-for="tag in video?.tags"
          :key="tag.id"
          class="ma-1"
          size="small"
          color="primary"
          variant="outlined"
        >
          {{ tag.name }}
        </v-chip>

        <v-btn
          icon
          @click="toggleLike"
          :color="liked ? 'red' : 'grey'"
          class="ml-2"
        >
          <v-icon>{{ liked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
        </v-btn>
        <span>{{ reactionCount }}</span>
      </v-card-text>

      <v-divider class="my-6" />
      <h2 class="text-h6 mb-4">💬 Comments</h2>

      <v-textarea
        v-model="newComment"
        label="Add a comment"
        auto-grow
        outlined
      />
      <v-btn color="primary" class="mt-2" @click="postComment">Post</v-btn>

      <v-list>
        <v-list-item v-for="comment in comments" :key="comment.id">
          <v-list-item-content>
            <v-list-item-title>{{ comment.content }}</v-list-item-title>
            <v-list-item-subtitle>{{ formatDate(comment.created_at) }}</v-list-item-subtitle>
            <v-btn size="small" @click="replyTo(comment)">Reply</v-btn>

            <v-list-item
              v-for="reply in comment.replies"
              :key="reply.id"
              class="ml-4"
            >
              <v-list-item-content>
                <v-list-item-title>{{ reply.content }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(reply.created_at) }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Floating Emoji Bar -->
    <v-bottom-navigation grow fixed app>
      <v-btn icon @click="react('🔥')"><span>🔥</span></v-btn>
      <v-btn icon @click="react('😂')"><span>😂</span></v-btn>
      <v-btn icon @click="react('❤️')"><span>❤️</span></v-btn>
      <v-btn icon @click="react('👏')"><span>👏</span></v-btn>
    </v-bottom-navigation>
  </v-container>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const route = useRoute()
const client = useDirectusClient()
const { user } = useDirectusAuth()

const video = ref(null)
const comments = ref([])
const newComment = ref('')
const replyingTo = ref(null)
const liked = ref(false)
const reactionCount = ref(0)

let pollId = null
onMounted(async () => {
  await fetchVideo()
  await trackView()
  await fetchReactions()
  await refreshComments()
  // Simple polling for new comments every 10s
  pollId = setInterval(refreshComments, 10000)
})
onUnmounted(() => {
  if (pollId) clearInterval(pollId)
})

async function fetchVideo() {
  const resp = await client.items('videos').readByQuery({
    filter: { id: { _eq: route.params.id } },
    limit: 1,
    fields: ['*', 'tags.id', 'tags.name']
  })
  video.value = resp?.data?.[0] || null
}

async function trackView() {
  await fetch('/api/view-video', {
    method: 'POST',
    body: JSON.stringify({ videoId: route.params.id }),
    headers: { 'Content-Type': 'application/json' }
  })
}

async function fetchReactions() {
  if (!user.value) {
    liked.value = false
  } else {
    const resp = await client.items('reactions').readByQuery({
      filter: { video_id: { _eq: route.params.id }, user_id: { _eq: user.value.id } },
      limit: 1
    })
    liked.value = (resp?.data && resp.data.length > 0) || false
  }

  const all = await client.items('reactions').readByQuery({ filter: { video_id: { _eq: route.params.id } } })
  reactionCount.value = all?.data?.length || 0
}

async function toggleLike() {
  if (!user.value) return
  const existing = await client.items('reactions').readByQuery({
    filter: { video_id: { _eq: route.params.id }, user_id: { _eq: user.value.id } },
    limit: 1
  })
  const existingId = existing?.data?.[0]?.id || null

  if (existingId) {
    await client.items('reactions').delete(existingId)
    liked.value = false
    reactionCount.value = Math.max(0, reactionCount.value - 1)
  } else {
    await client.items('reactions').create({ video_id: route.params.id, user_id: user.value.id })
    liked.value = true
    reactionCount.value += 1
  }
}

async function react(emoji) {
  if (!user.value) return
  await client.items('emoji_reactions').create({ target_type: 'video', target_id: route.params.id, user_id: user.value.id, emoji })
}

function replyTo(comment) {
  replyingTo.value = comment
  newComment.value = `@${comment.id} `
}

async function postComment() {
  if (!newComment.value || !user.value) return
  await client.items('comments').create({ video_id: route.params.id, parent_id: replyingTo.value?.id || null, user_id: user.value.id, content: newComment.value })
  newComment.value = ''
  replyingTo.value = null
  await refreshComments()
}

async function refreshComments() {
  const topResp = await client.items('comments').readByQuery({ filter: { video_id: { _eq: route.params.id }, parent_id: { _null: true } }, sort: ['-created_at'] })
  const topLevel = topResp?.data || []
  for (const comment of topLevel) {
    const repliesResp = await client.items('comments').readByQuery({ filter: { parent_id: { _eq: comment.id } }, sort: ['created_at'] })
    comment.replies = repliesResp?.data || []
  }
  comments.value = topLevel
}

// Real-time subscriptions removed; using simple polling via setInterval

function getVideoUrl(video) {
  return `https://${config.public.minioEndpoint}/vibez-transcoded/${video.minio_key}`
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(date) {
  return new Date(date).toLocaleString()
}
</script>