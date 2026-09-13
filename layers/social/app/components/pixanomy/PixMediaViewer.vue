<template>
  <v-dialog
    v-model="isOpen"
    max-width="960"
    scrollable
  >
    <v-card v-if="current">
      <v-toolbar density="comfortable" color="surface">
        <v-toolbar-title class="text-body-1">{{ title }}</v-toolbar-title>
        <template #append>
          <v-btn icon="fas fa-xmark" variant="text" @click="close" />
        </template>
      </v-toolbar>

      <v-card-text
        class="pix-viewer__stage"
        :class="{ 'pix-viewer__stage--flush': kind === '3d' && is3dViewable }"
      >
        <Pix3DViewer
          v-if="kind === '3d' && is3dViewable && src"
          :key="src"
          :url="src"
        />

        <video
          v-else-if="kind === 'video' && src"
          :src="src"
          controls
          playsinline
          class="pix-viewer__video"
        />

        <v-img
          v-else-if="kind === 'image' && src"
          :src="src"
          :alt="title"
          max-height="70vh"
          contain
        />

        <iframe
          v-else-if="kind === 'document' && src"
          :src="src"
          :title="title"
          class="pix-viewer__frame"
        />

        <div v-else class="pix-viewer__fallback text-medium-emphasis">
          <v-icon :icon="icon" size="56" class="mb-3" />
          <div class="text-body-2">
            {{ kind === '3d'
              ? 'This 3D format can only be previewed after download (glTF / glb render inline).'
              : 'No inline preview for this file type.' }}
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pix-viewer__actions">
        <LikeButton
          target-type="media"
          :target-id="current.id"
          :initial-count="current.likeCount || 0"
        />
        <span class="text-caption text-medium-emphasis ml-2">
          <v-icon icon="fas fa-eye" size="12" class="mr-1" />{{ current.views || 0 }}
        </span>
        <v-spacer />
        <v-btn
          v-if="src"
          :href="src"
          target="_blank"
          rel="noopener"
          variant="text"
          prepend-icon="fas fa-arrow-up-right-from-square"
        >
          Open original
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import { usePixanomyViewer } from '../../composables/pixanomy/usePixanomyViewer'

// The three.js runtime (~600kB) is only pulled in when someone actually
// opens a glTF/glb model, not for every Pixanomy visitor.
const Pix3DViewer = defineAsyncComponent(() => import('./Pix3DViewer.vue'))
import {
  PIXANOMY_CATEGORY_META,
  type PixanomyCategory,
} from '../../composables/pixanomy/usePixanomyContent'

const { current, isOpen, close } = usePixanomyViewer()

const meta = computed(() =>
  current.value?.category
    ? PIXANOMY_CATEGORY_META[current.value.category as PixanomyCategory]
    : null,
)

const title = computed(
  () =>
    (current.value?.title as string) ||
    current.value?.name ||
    current.value?.filename_download ||
    'Untitled',
)

const icon = computed(() => meta.value?.icon ?? 'fas fa-file')

const src = computed(() => {
  const item = (current.value ?? {}) as Record<string, unknown>
  return (
    getAssetURL(item.file) ||
    getAssetURL(item.video) ||
    getAssetURL(item.image) ||
    getAssetURL(item.thumbnail) ||
    getAssetURL(current.value?.id) ||
    null
  )
})

const mime = computed(() => String(current.value?.type ?? ''))

const kind = computed<'image' | 'video' | 'document' | '3d' | 'other'>(() => {
  const cat = current.value?.category
  if (mime.value.startsWith('video/') || cat === 'video') return 'video'
  if (mime.value.startsWith('image/') || cat === 'imaging' || cat === 'design' || cat === 'generative_ai') {
    return 'image'
  }
  if (cat === '3d' || mime.value.startsWith('model/')) return '3d'
  if (mime.value === 'application/pdf' || cat === 'document') return 'document'
  return 'other'
})

// Only glTF/glb render inline via three's GLTFLoader; obj/fbx/stl/usdz fall
// through to the download fallback.
const is3dViewable = computed(() => {
  const name = String(
    current.value?.filename_download || current.value?.name || src.value || '',
  ).toLowerCase()
  return /\.(gltf|glb)(\?|#|$)/.test(name) || mime.value === 'model/gltf-binary' || mime.value === 'model/gltf+json'
})
</script>

<style scoped>
.pix-viewer__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 12px;
}

/* The 3D canvas manages its own size/background — let it span the dialog. */
.pix-viewer__stage--flush {
  padding: 0;
  min-height: 0;
}

.pix-viewer__video {
  width: 100%;
  max-height: 70vh;
  background: #000;
}

.pix-viewer__frame {
  width: 100%;
  height: 70vh;
  border: 0;
}

.pix-viewer__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 16px;
}

.pix-viewer__actions {
  align-items: center;
}
</style>
