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
            :media="resolveFile(item)"
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
import { ref } from '#imports'
import imageCard from './imageCard.vue'
import mediaCard from './mediaCard.vue'
import mediaPlayer from './mediaPlayer.vue'
import FullscreenMediaModal from './fullscreenMediaModal.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const activeItem = ref(null)

const resolveFile = (item) => item?.file || item
const mime = (item) => resolveFile(item)?.type || item?.type || ''

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