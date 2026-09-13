<template>
  <div class="pix-category-section">
    <header class="pix-category-section__head mb-3">
      <h2 class="text-h6 mb-0">
        <v-icon :icon="meta.icon" size="18" class="mr-2" />{{ meta.label }}
        <span v-if="total" class="text-body-2 text-medium-emphasis">({{ total }})</span>
      </h2>
      <p class="text-caption text-medium-emphasis mb-0">{{ meta.description }}</p>
    </header>

    <PixMediaGrid
      :items="items"
      :pending="pending"
      :loading-more="loadingMore"
      :error="error"
      :has-more="hasMore"
      :empty-title="`No ${meta.label.toLowerCase()} yet`"
      :empty-text="meta.description"
      :empty-icon="meta.icon"
      @open="viewer.open($event)"
      @load-more="loadMore()"
    />
  </div>
</template>

<script setup lang="ts">
import PixMediaGrid from './PixMediaGrid.vue'
import {
  usePixanomySection,
  type PixanomyCategory,
} from '../../composables/pixanomy/usePixanomyContent'
import { usePixanomyViewer } from '../../composables/pixanomy/usePixanomyViewer'

const props = defineProps<{
  category: PixanomyCategory
}>()

// One component file per category, so `category` is a fixed literal at
// each call site — read once.
const { items, total, pending, loadingMore, error, hasMore, loadMore, meta } =
  usePixanomySection(props.category)

const viewer = usePixanomyViewer()
</script>

<style scoped>
.pix-category-section__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
