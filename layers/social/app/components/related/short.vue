<template>
  <v-card class="mx-auto" max-width="400">
    <video loading="lazy" id="my-video" class="video-js" controls preload="auto"
      style="width: 100% !important; height: 50% !important;" loop>
      <source :src="$sdk.media?.getAssetUrl?.(short?.video)" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <template>
      {{ short?.name }}
    </template>

    <template>
      <div>Type: {{ short?.type }}</div>

      <div>{{ short?.description }}</div>
    </template>

    <template>
      <v-btn color="orange" text="View" :href="`/social/vibe/${short?.id}`"></v-btn>
    </template>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const { $sdk } = useNuxtApp()

const model = ref(null)
const player = ref(null)

const props = defineProps({
  short: {
    type: Object,
    required: true,
  },
})
const { short } = props

onMounted(async () => {
  try {
    const importFn = new Function('return import("video.js")')
    const mod = await importFn()
    const videojs = mod?.default || mod
    player.value = videojs('my-video', {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true
    })
  } catch (e) {
    console.warn('video.js not available or failed to load at runtime:', e)
  }
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