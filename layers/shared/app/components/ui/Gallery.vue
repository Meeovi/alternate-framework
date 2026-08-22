<template>
  <div class="gallery">
    <v-sheet v-if="!items.length" class="gallery__empty d-flex align-center justify-center" color="surface-variant" rounded>
      <span class="text-medium-emphasis">{{ emptyText }}</span>
    </v-sheet>

    <template v-else>
      <v-carousel
        v-model="activeIndex"
        class="gallery__carousel"
        hide-delimiters
        :show-arrows="items.length > 1"
        height="100%"
      >
        <v-carousel-item v-for="item in items" :key="item.id">
          <v-img :src="item.src" :alt="item.alt" cover />
        </v-carousel-item>
      </v-carousel>

      <div v-if="items.length > 1" class="gallery__thumbs">
        <button
          v-for="(item, index) in items"
          :key="item.id"
          type="button"
          class="gallery__thumb"
          :class="{ 'gallery__thumb--active': index === activeIndex }"
          :aria-label="item.alt"
          @click="activeIndex = index"
        >
          <v-img :src="item.thumb" :alt="item.alt" cover />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface GalleryItem {
  id: string
  src: string
  thumb: string
  alt: string
}

withDefaults(defineProps<{
  items: GalleryItem[]
  emptyText?: string
}>(), {
  emptyText: 'No media available.',
})

const activeIndex = ref(0)
</script>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.gallery__empty {
  flex: 1;
  min-height: 240px;
}

.gallery__carousel {
  flex: 1;
  min-height: 0;
}

.gallery__thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.gallery__thumb {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: none;
}

.gallery__thumb--active {
  border-color: rgb(var(--v-theme-primary));
}
</style>
