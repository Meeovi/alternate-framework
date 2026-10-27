<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useGalleryMedia } from '../composables/useGalleryMedia'
import type { GalleryMediaType } from '../composables/useGalleryMedia'
import type { GalleryMediaItem, MeeoviGalleryPublicConfig } from '../types'
import MeeoviMediaViewer from './MeeoviMediaViewer.vue'
import type { ViewerItem } from './MeeoviMediaViewer.vue'

/**
 * A slider of the signed-in user's latest photos and videos, to drop into
 * any page. Click one to view it full size. Renders nothing for guests.
 *
 *   <MeeoviRelatedMedia />
 *   <MeeoviRelatedMedia title="Your videos" type="video" :limit="8" />
 *   <MeeoviRelatedMedia :show-empty="false" :link="false" />
 */
const props = withDefaults(defineProps<{
  title?: string
  /** media = photos and videos. */
  type?: GalleryMediaType
  limit?: number
  /** "See all" link to the gallery page; false hides it. */
  link?: boolean
  /** Show a short message when there's nothing yet (otherwise render nothing). */
  showEmpty?: boolean
}>(), {
  title: 'Your media',
  type: 'media',
  limit: 12,
  link: true,
  showEmpty: true,
})

const { page } = useRuntimeConfig().public.meeoviGallery as MeeoviGalleryPublicConfig
const { media, signedIn, status } = useGalleryMedia({ limit: () => props.limit, type: () => props.type })

const loaded = computed(() => status.value === 'success')
const visible = computed(() => signedIn.value && loaded.value && (media.value.length > 0 || props.showEmpty))

const viewer = ref(false)
const current = ref<ViewerItem | null>(null)
function view(item: GalleryMediaItem) {
  current.value = { kind: item.kind, url: item.url, name: item.name, contentType: item.contentType, shareUrl: item.shareUrl }
  viewer.value = true
}
</script>

<template>
  <section v-if="visible" class="meeovi-related-media">
    <div class="d-flex align-center mb-2">
      <h3 class="text-subtitle-1 font-weight-bold">{{ title }}</h3>
      <v-spacer />
      <v-btn v-if="link && page" :to="page" variant="text" size="small" append-icon="fas fa-arrow-right">
        See all
      </v-btn>
    </div>

    <v-slide-group v-if="media.length" show-arrows>
      <v-slide-group-item v-for="item in media" :key="item.id">
        <button
          type="button"
          class="meeovi-related-media__tile ma-1"
          :title="item.name"
          :aria-label="`View ${item.name}`"
          @click="view(item)"
        >
          <video v-if="item.kind === 'video'" :src="`${item.url}#t=0.1`" muted playsinline preload="metadata" />
          <img v-else-if="item.kind === 'image'" :src="item.url" :alt="item.name" loading="lazy">
          <v-icon v-else icon="fas fa-music" size="x-large" />
          <span v-if="item.kind === 'video'" class="meeovi-related-media__badge">
            <v-icon icon="fas fa-play" size="x-small" />
          </span>
        </button>
      </v-slide-group-item>
    </v-slide-group>

    <p v-else class="text-medium-emphasis">
      Nothing here yet. Photos and videos you upload anywhere on Meeovi appear here.
    </p>

    <MeeoviMediaViewer v-model="viewer" :item="current" />
  </section>
</template>

<style scoped>
.meeovi-related-media__tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  overflow: hidden;
  border: 0;
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.meeovi-related-media__tile img,
.meeovi-related-media__tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meeovi-related-media__tile:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.meeovi-related-media__badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
}

@media (max-width: 600px) {
  .meeovi-related-media__tile {
    width: 120px;
    height: 120px;
  }
}
</style>
