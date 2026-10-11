<template>
  <div class="ad-container">
    <div
      class="adsbygoogle"
      style="display:block"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const config = useRuntimeConfig()

const adClient = `${config.googleAdClientId}`
const adSlot = `${config.googleAdSlotId}`

onMounted(() => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (error) {
    console.error('AdSense error:', error)
  }
})
</script>

<style scoped>
.ad-container {
  margin: 20px 0;
  text-align: center;
  width: 100%;
  background-color: transparent;
}
</style>