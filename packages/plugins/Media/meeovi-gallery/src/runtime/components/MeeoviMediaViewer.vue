<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import type { GalleryMediaKind } from '../types'

/**
 * Full-size view of one photo, video or audio file in a dialog. Videos and
 * audio play in <MeeoviPlayer> when that plugin is installed, otherwise in
 * the browser's own player.
 *
 *   <MeeoviMediaViewer v-model="open" :item="{ kind: 'image', url, name }" />
 */
export interface ViewerItem {
  kind: GalleryMediaKind
  url: string
  name?: string
  contentType?: string
  shareUrl?: string | null
}

const open = defineModel<boolean>({ default: false })
const props = defineProps<{ item: ViewerItem | null }>()

const player = resolveComponent('MeeoviPlayer')
const hasPlayer = typeof player !== 'string'
const playable = computed(() => props.item?.kind === 'video' || props.item?.kind === 'audio')
</script>

<template>
  <v-dialog v-model="open" max-width="1100" :scrim="true">
    <v-card v-if="item" class="meeovi-media-viewer">
      <v-card-title class="d-flex align-center ga-2">
        <span class="text-truncate">{{ item.name }}</span>
        <v-spacer />
        <v-btn
          v-if="item.url"
          :href="item.url"
          icon="fas fa-download"
          variant="text"
          size="small"
          :aria-label="`Download ${item.name || 'file'}`"
        />
        <v-btn icon="fas fa-xmark" variant="text" size="small" aria-label="Close" @click="open = false" />
      </v-card-title>

      <div class="meeovi-media-viewer__body">
        <img v-if="item.kind === 'image'" :src="item.url" :alt="item.name || ''">
        <template v-else-if="playable">
          <component
            :is="player"
            v-if="hasPlayer"
            class="meeovi-media-viewer__player"
            :src="item.url"
            :type="item.contentType"
            :kind="item.kind"
            :title="item.name"
          />
          <video v-else-if="item.kind === 'video'" :src="item.url" controls playsinline />
          <audio v-else :src="item.url" controls />
        </template>
        <p v-else class="pa-6">
          This file can't be previewed here.
          <a :href="item.shareUrl || item.url" target="_blank" rel="noopener">Open it on Pixanomy</a>.
        </p>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.meeovi-media-viewer__body {
  display: flex;
  justify-content: center;
  padding: 0 16px 16px;
}

.meeovi-media-viewer__body img,
.meeovi-media-viewer__body video {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
}

.meeovi-media-viewer__body audio,
.meeovi-media-viewer__player {
  width: 100%;
}
</style>
