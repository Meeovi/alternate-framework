<template>
  <v-card class="mx-auto" max-width="400">
    <video loading="lazy" id="my-video" class="video-js" controls preload="auto"
      style="width: 100% !important; height: 50% !important;" loop>
      <source :src="getAssetURL(short?.video)" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    {{ short?.name }}

    <div>Type: {{ short?.type }}</div>

    <div>{{ short?.description }}</div>

    <v-btn color="orange" text="View" :href="`/social/vibe/${short?.id}`"></v-btn>
  </v-card>
</template>

<script setup>
import { getAssetURL } from '#shared/app/utils/get-asset-url'

// Real playback comes from the native <video controls> element above — no
// videojs setup needed. This previously dynamically imported the classic
// `video.js` package (not a dependency; the real installed player is
// @videojs/html v10, a completely different web-components API with no
// factory function to call this way), so it always failed and only ever
// fell back to the plain <video> tag anyway.
const { short } = defineProps({
  short: {
    type: Object,
    required: true,
  },
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