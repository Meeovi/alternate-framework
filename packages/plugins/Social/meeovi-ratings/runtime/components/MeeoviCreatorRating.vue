<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CreatorRating, MeeoviRatingsPublicConfig } from '../types'

/**
 * A creator's trust score: the average of every rating on content they
 * created, overall and per kind (Vibes, Posts, Radio, …).
 *
 *   <MeeoviCreatorRating :user-id="profile.id" />
 */
const props = defineProps<{ userId: string | null | undefined }>()
const config = useRuntimeConfig().public.meeoviRatings as MeeoviRatingsPublicConfig | undefined
const score = ref<CreatorRating | null>(null)

watch(() => props.userId, async (id) => {
  score.value = null
  if (!id) return
  try {
    score.value = await $fetch<CreatorRating>(`${config?.apiBase || '/api/ratings'}/creator/${encodeURIComponent(id)}`)
  } catch { /* no score shown */ }
}, { immediate: true })

const ratings = computed(() => (score.value?.count === 1 ? '1 rating' : `${(score.value?.count ?? 0).toLocaleString()} ratings`))
</script>

<template>
  <div v-if="score" class="meeovi-creator-rating">
    <div class="d-flex align-center ga-2">
      <strong>Creator rating</strong>
      <template v-if="score.count">
        <v-rating :model-value="score.average" readonly half-increments size="small" density="compact" active-color="amber" color="grey-lighten-1" />
        <span>{{ score.average.toFixed(1) }} · {{ ratings }}</span>
      </template>
      <span v-else class="text-medium-emphasis">No ratings yet</span>
    </div>
    <div v-if="score.byType.length > 1" class="d-flex flex-wrap ga-2 mt-1">
      <v-chip v-for="t in score.byType" :key="t.type" size="small" variant="tonal" prepend-icon="fas fa-star">
        {{ t.label }} {{ t.average.toFixed(1) }}
      </v-chip>
    </div>
  </div>
</template>
