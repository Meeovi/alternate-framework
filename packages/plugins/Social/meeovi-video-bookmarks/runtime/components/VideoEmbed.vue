<template>
  <!-- The platform's own player. Sandboxed: it can play and go fullscreen,
       but can't navigate Meeovi's page. -->
  <div class="video-embed" :class="{ 'video-embed--portrait': portrait }">
    <iframe :src="src" :title="title || 'Video'" loading="lazy" allowfullscreen
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
      referrerpolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ embedUrl: string, provider?: string, title?: string }>()
// TikTok's player is portrait.
const portrait = computed(() => props.provider === 'tiktok')
const src = computed(() => (/^https:\/\//.test(props.embedUrl) ? props.embedUrl : 'about:blank'))
</script>

<style scoped>
.video-embed {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-embed--portrait {
  aspect-ratio: 9 / 16;
  max-width: 360px;
  margin: 0 auto;
}

.video-embed iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
