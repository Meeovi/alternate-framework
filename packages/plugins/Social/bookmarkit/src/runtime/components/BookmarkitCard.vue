<script setup lang="ts">
import { computed } from 'vue'
import { bookmarkHost } from '../composables/useBookmarks'
import type { Bookmark } from '../types'

const props = defineProps<{
  bookmark: Bookmark
  /** Shown as a chip, e.g. when every folder is listed together. */
  folderName?: string
}>()
defineEmits<{ edit: [], delete: [] }>()

const host = computed(() => bookmarkHost(props.bookmark.url))
const initial = computed(() => (props.bookmark.title || host.value).charAt(0).toUpperCase())
// A steady colour per site, so the same site always looks the same.
const hue = computed(() => [...host.value].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) % 360, 7))
</script>

<template>
  <v-card class="bookmarkit-card" variant="outlined" height="100%">
    <v-card-item>
      <template #prepend>
        <v-avatar :style="{ backgroundColor: `hsl(${hue} 55% 45%)` }" class="text-white" size="40">
          {{ initial }}
        </v-avatar>
      </template>
      <v-card-title class="bookmarkit-card__title">
        <a :href="bookmark.url" target="_blank" rel="noopener noreferrer nofollow">{{ bookmark.title || host }}</a>
      </v-card-title>
      <v-card-subtitle>{{ host }}</v-card-subtitle>
    </v-card-item>

    <v-card-text v-if="bookmark.description" class="bookmarkit-card__description">
      {{ bookmark.description }}
    </v-card-text>

    <v-spacer />

    <v-card-actions>
      <v-chip v-if="folderName" size="small" prepend-icon="fas fa-folder" variant="tonal">{{ folderName }}</v-chip>
      <v-spacer />
      <v-btn icon="fas fa-arrow-up-right-from-square" size="small" variant="text" :href="bookmark.url"
        target="_blank" rel="noopener noreferrer nofollow" :aria-label="`Open ${bookmark.title || host}`" />
      <v-btn icon="fas fa-pen" size="small" variant="text" :aria-label="`Edit ${bookmark.title || host}`" @click="$emit('edit')" />
      <v-btn icon="fas fa-trash" size="small" variant="text" color="error" :aria-label="`Delete ${bookmark.title || host}`"
        @click="$emit('delete')" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.bookmarkit-card {
  display: flex;
  flex-direction: column;
}
.bookmarkit-card__title a {
  color: inherit;
  text-decoration: none;
}
.bookmarkit-card__title a:hover,
.bookmarkit-card__title a:focus-visible {
  text-decoration: underline;
}
.bookmarkit-card__title,
.bookmarkit-card__description {
  overflow-wrap: anywhere;
}
.bookmarkit-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
