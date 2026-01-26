<template>
  <div class="media-carousel">
    <v-slide-group show-arrows>
      <v-slide-group-item
        v-for="item in items"
        :key="item.id"
      >
        <div class="media-carousel-item" @click="open(item)">
          <component
            :is="thumbComponent(item)"
            :media="item.directus_files_id"
          />
        </div>
      </v-slide-group-item>
    </v-slide-group>

    <FullscreenMediaModal
      :model-value="!!activeItem"
      :item="activeItem"
      @update:model-value="val => !val && close()"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import imageCard from '#shared/app/components/media/imageCard.vue'
import mediaCard from '#shared/app/components/media/mediaCard.vue'
import mediaPlayer from '#shared/app/components/media/mediaPlayer.vue'
import FullscreenMediaModal from '#shared/app/components/media/FullscreenMediaModal.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const activeItem = ref(null)

const mime = (item) => item?.directus_files_id?.type || ''

// ⭐ THIS IS WHERE thumbComponent GOES
const thumbComponent = (item) => {
  const t = mime(item)
  if (t.startsWith('image')) return imageCard
  if (t.startsWith('audio') || t.startsWith('video')) return mediaPlayer
  return mediaCard
}

const open = (item) => {
  activeItem.value = item
}

const close = () => {
  activeItem.value = null
}
</script>

<style scoped>
.media-carousel {
  margin-top: 1rem;
}
.media-carousel-item {
  width: 220px;
  margin-right: 12px;
}
</style>