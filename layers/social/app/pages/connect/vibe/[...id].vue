<template>
  <v-container class="py-10">
    <v-row>
      <v-col>
        <v-card elevation="2" style="height: 100%;">
          <v-card-title>{{ video?.title }}</v-card-title>
          <v-card-subtitle>
            {{ video?.visibility }} • {{ formatDuration(video?.duration) }} • Views: {{ video?.view_count }}
          </v-card-subtitle>

          <v-card-text>
            <video controls :src="getVideoUrl(video)"
              style="width: 100%; min-height: 100%;" />

            <div class="mt-4">
              <v-chip v-for="tag in video?.tags" :key="tag.id" class="ma-1" size="small" color="primary"
                variant="outlined">
                {{ tag.name }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col>
        <v-card elevation="2" style="height: 100%;">
          <comments :commentId="video?.id" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import {
    useRoute
  } from 'vue-router'
  import reactions from '../../../components/blocks/reactions.vue'
  import comments from '../../../components/blocks/comments.vue'
  import {
    ref,
    onMounted,
    onUnmounted
  } from '#imports'

  const route = useRoute()
  const config = useRuntimeConfig()
  const { $sdk } = useNuxtApp()

  const runtimeUseAuth = globalThis.useAuth
  const auth = runtimeUseAuth ? runtimeUseAuth() : {
    user: useState('social:user', () => null)
  }
  const user = auth.user

  const video = ref(null)
  const replyingTo = ref(null)
  const liked = ref(false)
  const reactionCount = ref(0)

  const unwrapList = (value) => value?.data || value || []

  onMounted(async () => {
    await fetchVideo()
    await trackView()
    await fetchReactions()
  })

  async function fetchVideo() {
    const resp = await $sdk.content.readItems('videos', {
      filter: {
        id: {
          _eq: route.params.id
        }
      },
      limit: 1,
      fields: ['*', 'tags.id', 'tags.name']
    })
    video.value = unwrapList(resp)?.[0] || null
  }

  async function trackView() {
    await fetch('/api/view-video', {
      method: 'POST',
      body: JSON.stringify({
        videoId: route.params.id
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async function fetchReactions() {
    if (!user.value) {
      liked.value = false
    } else {
      const resp = await $sdk.content.readItems('reactions', {
        filter: {
          video_id: {
            _eq: route.params.id
          },
          user_id: {
            _eq: user.value.id
          }
        },
        limit: 1
      })
      liked.value = unwrapList(resp).length > 0
    }

    const all = await $sdk.content.readItems('reactions', {
      filter: {
        video_id: {
          _eq: route.params.id
        }
      }
    })
    reactionCount.value = unwrapList(all).length
  }

  async function toggleLike() {
    if (!user.value) return
    const existing = await $sdk.content.readItems('reactions', {
      filter: {
        video_id: {
          _eq: route.params.id
        },
        user_id: {
          _eq: user.value.id
        }
      },
      limit: 1
    })
    const existingId = unwrapList(existing)?.[0]?.id || null

    if (existingId) {
      await $sdk.content.deleteItem('reactions', existingId)
      liked.value = false
      reactionCount.value = Math.max(0, reactionCount.value - 1)
    } else {
      await $sdk.content.createItem('reactions', {
        video_id: route.params.id,
        user_id: user.value.id
      })
      liked.value = true
      reactionCount.value += 1
    }
  }

  async function react(emoji) {
    if (!user.value) return
    await $sdk.content.createItem('emoji_reactions', {
      target_type: 'video',
      target_id: route.params.id,
      user_id: user.value.id,
      emoji
    })
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