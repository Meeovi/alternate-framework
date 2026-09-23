<template>
  <div class="ad-container">
    <ins
      class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-3854548303717312"
      data-ad-slot="1973416747"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (error) {
    console.error('AdSense error:', error)
  }
})
</script>