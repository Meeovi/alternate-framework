<script setup lang="ts">
import { computed } from 'vue'
import { useRating } from '../composables/useRating'
import type { MeeoviRatingsPublicConfig } from '../types'

/**
 * 1–5 star rating for any item — replaces likes.
 *
 *   <MeeoviRating type="post" :id="post.id" />            (rate it)
 *   <MeeoviRating type="product" :id="p.id" readonly />   (show the average)
 *   <MeeoviRating type="post" :id="post.id" summary />     (cards: ★ 4.5 (12))
 *
 * Rate on the item's own page; cards and lists show the `summary`.
 * Signed-in visitors click a star to rate (click your current rating again
 * to remove it). Guests and an item's own creator see the average only.
 */
const props = withDefaults(defineProps<{
  type: string
  id: string | number | null | undefined
  readonly?: boolean
  /** Compact read-only "★ 4.5 (12)" for cards and lists. */
  summary?: boolean
  size?: 'x-small' | 'small' | 'default' | 'large'
  /** Show "4.6 (12)" next to the stars. */
  showCount?: boolean
}>(), { readonly: false, summary: false, size: 'small', showCount: true })

const { summary, signedIn, saving, rate, clear } = useRating(() => props.type, () => props.id)
const config = useRuntimeConfig().public.meeoviRatings as MeeoviRatingsPublicConfig | undefined

const average = computed(() => summary.value?.average ?? 0)
const count = computed(() => summary.value?.count ?? 0)
const mine = computed(() => summary.value?.mine ?? null)
const interactive = computed(() => !props.readonly && !props.summary && Boolean(summary.value?.canRate))

// Interactive: your rating (or empty). Otherwise: the average, in halves.
const value = computed(() => (interactive.value ? (mine.value ?? 0) : average.value))

const hint = computed(() => {
  if (props.readonly) return ''
  if (summary.value?.own) return "You can't rate your own content"
  if (!signedIn.value) return 'Sign in to rate'
  return mine.value ? `Your rating: ${mine.value} — click it again to remove` : 'Rate this'
})

const summaryTitle = computed(() => (count.value
  ? `Rated ${average.value.toFixed(1)} out of 5 by ${count.value.toLocaleString()} ${count.value === 1 ? 'person' : 'people'}`
  : 'No ratings yet'))

const label = computed(() => (count.value ? `${average.value.toFixed(1)} (${count.value.toLocaleString()})` : 'No ratings yet'))

async function onUpdate(v: number | string) {
  const n = Number(v)
  if (!interactive.value || saving.value) return
  if (!n || n === mine.value) await clear()
  else await rate(n)
}
</script>

<template>
  <span v-if="summary" class="meeovi-rating meeovi-rating--summary" :title="summaryTitle" :aria-label="summaryTitle">
    <v-icon icon="$ratingFull" :color="count ? 'amber' : 'grey'" :size="size" />
    <span>{{ count ? average.toFixed(1) : '–' }}</span>
    <span v-if="showCount && count" class="meeovi-rating__count">({{ count.toLocaleString() }})</span>
  </span>
  <span v-else class="meeovi-rating" :title="hint || undefined">
    <v-rating
      :model-value="value"
      :readonly="!interactive"
      :half-increments="!interactive"
      :clearable="interactive"
      :size="size"
      density="compact"
      color="grey-lighten-1"
      :active-color="interactive && mine ? 'primary' : 'amber'"
      :disabled="saving"
      :aria-label="hint || `Rated ${average} out of 5`"
      @update:model-value="onUpdate"
    />
    <span v-if="showCount" class="meeovi-rating__count">{{ label }}</span>
    <a v-if="!readonly && !signedIn && summary" :href="config?.loginPath || '/login'" class="meeovi-rating__signin">Sign in to rate</a>
  </span>
</template>

<style scoped>
.meeovi-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.meeovi-rating--summary {
  gap: 3px;
  flex-wrap: nowrap;
  font-size: 0.875rem;
  line-height: 1;
}

.meeovi-rating__count {
  font-size: 0.85em;
  opacity: 0.75;
}

.meeovi-rating__signin {
  font-size: 0.8em;
}
</style>
