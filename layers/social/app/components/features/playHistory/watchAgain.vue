<template>
  <v-sheet v-if="videos.length" class="play-again" color="transparent">
    <v-toolbar :title="title" color="transparent" />
    <v-slide-group class="pa-4" show-arrows>
      <v-slide-group-item v-for="video in videos" :key="video.id">
        <v-card class="ma-4 play-again__card">
          <MeeoviPlayer :src="getAssetURL(video.video_url || video.video)"
            :poster="getImageURL(video.thumbnail_url || video.thumbnail)" :title="video.name" />
          <v-card-title class="text-subtitle-1">{{ video.name }}</v-card-title>
          <v-card-actions>
            <v-btn variant="text" :to="`/connect/vibe/${video.id}`" text="Open" />
            <v-spacer />
            <v-btn variant="text" icon="fas fa-xmark" size="small" :aria-label="`Remove ${video.name} from this row`"
              @click="history.remove(video.id)" />
          </v-card-actions>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>
</template>

<script setup>
// "Watch again": the vibes this account opened most recently (usePlayHistory),
// each playable in place. Renders nothing for guests or until something has been watched.
import { getAssetURL, getImageURL } from '#shared/app/utils/get-asset-url'
import { usePlayHistory } from '../../../composables/media/usePlayHistory'

const { title } = defineProps({
  title: { type: String, default: 'Watch again' },
})

const { $directus, $readItems } = useNuxtApp()
const history = await usePlayHistory('watch')

const { data } = await useAsyncData('watch-again', async () => {
  const ids = history.ids.value
  if (!ids.length) return []
  return await $directus.request($readItems('shorts', {
    filter: { id: { _in: ids } },
    fields: ['id', 'name', 'video', 'video_url', 'thumbnail', 'thumbnail_url'],
    limit: ids.length,
  })).catch(() => [])
}, { watch: [history.ids], default: () => [] })

// Most recently watched first; vibes deleted since are skipped.
const videos = computed(() => {
  const byId = new Map((data.value || []).map((video) => [String(video.id), video]))
  return history.ids.value.map((id) => byId.get(id)).filter(Boolean)
})
</script>

<style scoped>
.play-again__card {
  width: min(320px, 80vw);
}
</style>
