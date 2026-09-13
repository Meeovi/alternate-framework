<template>
  <v-card
    class="pix-media-card"
    :ripple="false"
    hover
    role="button"
    tabindex="0"
    :aria-label="`Open ${title}`"
    @click="$emit('open', item)"
    @keydown.enter.self="$emit('open', item)"
    @keydown.space.self.prevent="$emit('open', item)"
  >
    <div class="pix-media-card__thumb">
      <v-img
        v-if="poster"
        :src="poster"
        :alt="title"
        height="180"
        cover
      >
        <template #error>
          <div class="pix-media-card__fallback">
            <v-icon :icon="icon" size="40" />
          </div>
        </template>
        <template #placeholder>
          <div class="pix-media-card__fallback">
            <v-progress-circular indeterminate size="24" width="2" />
          </div>
        </template>
      </v-img>

      <div v-else class="pix-media-card__fallback" style="height: 180px">
        <v-icon :icon="icon" size="40" />
      </div>

      <!-- Non-image media (video / 3d / documents) get a type affordance
           over whatever poster we managed to resolve. -->
      <div v-if="overlayIcon" class="pix-media-card__overlay">
        <v-icon :icon="overlayIcon" size="32" color="white" />
      </div>

      <v-chip
        v-if="categoryLabel"
        class="pix-media-card__category"
        size="x-small"
        label
        color="surface"
      >
        {{ categoryLabel }}
      </v-chip>
    </div>

    <v-card-item class="pix-media-card__body">
      <v-card-title class="pix-media-card__title text-body-2">
        {{ title }}
      </v-card-title>
    </v-card-item>

    <v-card-actions class="pix-media-card__actions">
      <LikeButton
        target-type="media"
        :target-id="item.id"
        :initial-count="item.likeCount || 0"
        size="small"
        @click.stop
      />
      <span class="pix-media-card__views text-caption text-medium-emphasis">
        <v-icon icon="fas fa-eye" size="12" class="mr-1" />{{ item.views || 0 }}
      </span>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import {
  PIXANOMY_CATEGORY_META,
  type PixanomyCategory,
  type PixanomyMediaItem,
} from '../../composables/pixanomy/usePixanomyContent'

const props = defineProps<{
  item: PixanomyMediaItem
}>()

defineEmits<{
  open: [item: PixanomyMediaItem]
}>()

const meta = computed(() =>
  props.item.category ? PIXANOMY_CATEGORY_META[props.item.category as PixanomyCategory] : null,
)

const title = computed(
  () =>
    (props.item.title as string) ||
    props.item.name ||
    props.item.filename_download ||
    'Untitled',
)

const categoryLabel = computed(() => meta.value?.label ?? null)
const icon = computed(() => meta.value?.icon ?? 'fas fa-file')

const mime = computed(() => String(props.item.type ?? ''))
const isImageLike = computed(
  () => mime.value.startsWith('image/') || props.item.category === 'imaging' || props.item.category === 'design' || props.item.category === 'generative_ai',
)

// `media` scalar fields: a relation like `thumbnail` / `file` comes back as
// a bare id string with fields: ['*'], which getAssetURL turns into an
// /assets/<id> URL. Try the most specific first.
const poster = computed(() => {
  const item = props.item as Record<string, unknown>
  return (
    getAssetURL(item.thumbnail) ||
    getAssetURL(item.preview) ||
    getAssetURL(item.image) ||
    (isImageLike.value ? getAssetURL(item.file) || getAssetURL(props.item.id) : null) ||
    null
  )
})

const overlayIcon = computed(() => {
  if (mime.value.startsWith('video/') || props.item.category === 'video') return 'fas fa-circle-play'
  if (props.item.category === '3d') return 'fas fa-cube'
  return null
})
</script>

<style scoped>
.pix-media-card {
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.15s ease;
}

.pix-media-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.pix-media-card__thumb {
  position: relative;
}

.pix-media-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.pix-media-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.pix-media-card__category {
  position: absolute;
  top: 8px;
  left: 8px;
  opacity: 0.95;
}

.pix-media-card__title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0;
}

.pix-media-card__body {
  padding-bottom: 0;
}

.pix-media-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
}

.pix-media-card__views {
  display: inline-flex;
  align-items: center;
}
</style>
