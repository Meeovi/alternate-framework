<template>
  <v-container class="py-10">
    <v-row>
      <v-col>
        <v-card elevation="2" style="height: 100%;">
          <v-card-title>{{ short?.name }}</v-card-title>
          <v-card-subtitle>
            {{ short?.creator || 'Anonymous' }} • Views: {{ short?.views || 0 }}
          </v-card-subtitle>

          <v-card-text>
            <videoPlayer :player="playerData"
              style="width: 100%; min-height: 100%;" />

            <p v-if="short?.description" class="mt-4">{{ short.description }}</p>
          </v-card-text>

          <v-card-actions>
            <v-btn icon="fas fa-heart" variant="text" @click="toggleLike" :color="liked ? 'red' : 'grey'" />
            <span class="text-caption">{{ likesCount }}</span>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col>
        <v-card elevation="2" style="height: 100%;">
          <comments :commentId="short?.id" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  // Previously queried the `videos` collection (a separate, parallel
  // vibez implementation backed by MinIO — MINIO_ACCESS_KEY/SECRET_KEY/
  // BUCKET/REGION are all blank in .env, so that path can't work
  // regardless of code). shorts.vue's "View Vibe" link passes a real
  // shorts.id here, so this page needs to read the same `shorts`
  // collection shorts.vue itself uses, not `videos` — otherwise this
  // always rendered nothing (or, worse, an unrelated row if the id
  // spaces happened to overlap).
  import {
    useRoute
  } from 'vue-router'
  import comments from '../../../components/blocks/comments.vue'
  import videoPlayer from '#shared/app/components/blocks/videoPlayer.vue'
  import { getAssetURL } from '#shared/app/utils/get-asset-url'
  import {
    ref,
    computed,
    onMounted
  } from '#imports'

  const route = useRoute()
  const { $directus, $readItem } = useNuxtApp()

  const short = ref(null)
  const liked = ref(false)
  const likesCount = ref(0)

  const playerData = computed(() => ({
    sources: [{ src: getAssetURL(short.value?.video) }],
    poster: getAssetURL(short.value?.thumbnail),
  }))

  // [...id].vue is a catch-all route, so route.params.id is an array of
  // path segments rather than a plain string.
  const shortId = computed(() =>
    Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  )

  async function fetchShort() {
    short.value = await $directus.request($readItem('shorts', shortId.value, {
      fields: ['id', 'name', 'description', 'creator', 'video', 'thumbnail', 'views'],
    })).catch(() => null)
  }

  async function trackView() {
    await $fetch('/api/view-video', {
      method: 'POST',
      body: { videoId: shortId.value },
    }).catch(() => {})
  }

  async function fetchReaction() {
    if (!short.value?.id) return
    const reaction = await $fetch('/api/social/reactions', {
      params: { targetType: 'shorts', targetId: short.value.id },
    }).catch(() => null)
    if (reaction) {
      liked.value = reaction.reacted
      likesCount.value = reaction.count
    }
  }

  async function toggleLike() {
    if (!short.value?.id) return
    const wasLiked = liked.value
    liked.value = !wasLiked
    likesCount.value += wasLiked ? -1 : 1
    try {
      await $fetch('/api/social/reactions', {
        method: 'POST',
        body: { targetType: 'shorts', targetId: short.value.id, emoji: '❤️' },
      })
    } catch (error) {
      liked.value = wasLiked
      likesCount.value += wasLiked ? 1 : -1
      console.error('Failed to toggle like:', error)
    }
  }

  onMounted(async () => {
    await fetchShort()
    await trackView()
    await fetchReaction()
  })
</script>
