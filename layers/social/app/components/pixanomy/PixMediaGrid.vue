<template>
  <div class="pix-media-grid">
    <!-- First load -->
    <v-row v-if="pending && !items.length" dense>
      <v-col
        v-for="n in skeletonCount"
        :key="`sk-${n}`"
        cols="6"
        sm="4"
        md="3"
      >
        <v-skeleton-loader type="image, list-item-two-line" />
      </v-col>
    </v-row>

    <!-- Error -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="my-2"
    >
      {{ errorText }}
    </v-alert>

    <!-- Empty -->
    <div v-else-if="!items.length" class="pix-media-grid__empty text-medium-emphasis">
      <v-icon :icon="emptyIcon" size="40" class="mb-2" />
      <div class="text-subtitle-2">{{ emptyTitle }}</div>
      <div v-if="emptyText" class="text-caption">{{ emptyText }}</div>
    </div>

    <!-- Grid -->
    <template v-else>
      <v-row dense>
        <v-col
          v-for="item in items"
          :key="String(item.id)"
          cols="6"
          sm="4"
          md="3"
        >
          <PixMediaCard :item="item" @open="$emit('open', $event)" />
        </v-col>
      </v-row>

      <div v-if="hasMore" class="text-center mt-4">
        <v-btn
          variant="tonal"
          :loading="loadingMore"
          @click="$emit('load-more')"
        >
          Load more
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PixMediaCard from './PixMediaCard.vue'
import type { PixanomyMediaItem } from '../../composables/pixanomy/usePixanomyContent'

const props = withDefaults(
  defineProps<{
    items: PixanomyMediaItem[]
    pending?: boolean
    loadingMore?: boolean
    error?: unknown
    hasMore?: boolean
    emptyTitle?: string
    emptyText?: string
    emptyIcon?: string
    skeletonCount?: number
  }>(),
  {
    pending: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    emptyTitle: 'Nothing here yet',
    emptyText: '',
    emptyIcon: 'fas fa-folder-open',
    skeletonCount: 8,
  },
)

defineEmits<{
  open: [item: PixanomyMediaItem]
  'load-more': []
}>()

const errorText = computed(() => {
  const e = props.error as { message?: string } | string | null
  if (!e) return 'Something went wrong loading this content.'
  if (typeof e === 'string') return e
  return e.message || 'Something went wrong loading this content.'
})
</script>

<style scoped>
.pix-media-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 16px;
}
</style>
