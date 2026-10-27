<template>
  <v-sheet v-if="stations.length" class="play-again" color="transparent">
    <v-toolbar :title="title" color="transparent" />
    <v-slide-group class="pa-4" show-arrows>
      <v-slide-group-item v-for="station in stations" :key="station.id">
        <v-card class="ma-4 play-again__card">
          <!-- Live stations stream; the others play their uploaded file. -->
          <MeeoviPlayer :src="getAssetURL(station.file)" :type="station.file?.type" :live="station.type === 'Live'"
            :poster="getImageURL(station.image)" :title="station.name" />
          <v-card-title class="text-subtitle-1">{{ station.name }}</v-card-title>
          <v-card-subtitle v-if="station.type">{{ station.type }}</v-card-subtitle>
          <v-card-actions>
            <v-btn variant="text" :to="`/connect/station/${station.slug || station.id}`" text="Open" />
            <v-spacer />
            <v-btn variant="text" icon="fas fa-xmark" size="small" :aria-label="`Remove ${station.name} from this row`"
              @click="history.remove(station.id)" />
          </v-card-actions>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>
</template>

<script setup>
// "Listen again": the radio stations this account opened most recently
// (usePlayHistory), each playable in place. Renders nothing for guests or
// until something has been listened to.
import { getAssetURL, getImageURL } from '#shared/app/utils/get-asset-url'
import { usePlayHistory } from '../../../composables/media/usePlayHistory'

const { title } = defineProps({
  title: { type: String, default: 'Listen again' },
})

const { $directus, $readItems } = useNuxtApp()
const history = await usePlayHistory('listen')

const { data } = await useAsyncData('listen-again', async () => {
  const ids = history.ids.value
  if (!ids.length) return []
  return await $directus.request($readItems('radios', {
    filter: { id: { _in: ids } },
    fields: ['id', 'name', 'slug', 'type', 'image', 'file.*'],
    limit: ids.length,
  })).catch(() => [])
}, { watch: [history.ids], default: () => [] })

// Most recently listened first; stations deleted since are skipped.
const stations = computed(() => {
  const byId = new Map((data.value || []).map((station) => [String(station.id), station]))
  return history.ids.value.map((id) => byId.get(id)).filter(Boolean)
})
</script>

<style scoped>
.play-again__card {
  width: min(320px, 80vw);
}
</style>
