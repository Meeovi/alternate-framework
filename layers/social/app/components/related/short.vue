<template>
  <UCard class="mx-auto" max-width="400">
    <video loading="lazy" id="my-video" class="video-js" controls preload="auto"
      style="width: 100% !important; height: 50% !important;" loop>
      <source :src="getAssetUrl(short?.video)" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <UCard-subtitle class="pt-4">
      {{ short?.name }}
    </v-card-subtitle>

    <template #header>
      <div>Type: {{ short?.type }}</div>

      <div>{{ short?.description }}</div>
    </template>

    <template>
      <UButton color="orange" text="View" :href="`/social/vibe/${short?.id}`"></UButton>
    </template>
  </UCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import videojs from 'video.js'

import useAdapterRequest from '~/composables/useAdapterRequest'
const { getAssetUrl } = useAdapterRequest()
    
const model = ref(null)
const player = ref(null)

const props = defineProps({
  short: {
    type: Object,
    required: true,
  },
})
const { short } = props

onMounted(() => {
  player.value = videojs('my-video', {
    controls: true,
    autoplay: false,
    preload: 'auto',
    fluid: true
  })
})

// Clean up on component unmount
onUnmounted(() => {
  if (player.value) {
    player.value.dispose()
  }
})
</script>

<style scoped>
.video-js {
  width: 100%;
  height: 300px;
  position: relative;
  display: block;
}
</style>
