<template>
  <div class="pix-featured">
    <header class="pix-featured__head mb-3">
      <h2 class="text-h6 mb-0">Featured</h2>
      <p class="text-caption text-medium-emphasis mb-0">
        Your most popular content, ranked by likes and views.
      </p>
    </header>

    <PixMediaGrid
      :items="items"
      :pending="pending"
      :error="error"
      empty-title="Nothing featured yet"
      empty-text="Once your content picks up likes and views, the best of it shows up here."
      empty-icon="fas fa-star"
      :skeleton-count="8"
      @open="viewer.open($event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import PixMediaGrid from '../../pixanomy/PixMediaGrid.vue'
import { usePixanomyContent } from '../../../composables/pixanomy/usePixanomyContent'
import { usePixanomyViewer } from '../../../composables/pixanomy/usePixanomyViewer'

const { fetchFeatured } = usePixanomyContent()
const viewer = usePixanomyViewer()

const { data, pending, error } = useAsyncData('pixanomy:featured', () => fetchFeatured({ limit: 12 }))

const items = computed(() => data.value?.items ?? [])
</script>

<style scoped>
.pix-featured__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
