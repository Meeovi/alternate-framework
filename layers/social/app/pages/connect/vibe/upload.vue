<template>
  <div class="upload-page">
    <h1 class="upload-page__title">Make a vibe 🎥</h1>
    <vibeEditor />
  </div>
</template>

<script setup>
import vibeEditor from '../../../components/features/vibeSections/editor/vibeEditor.vue'

// Record or choose a video, add filters, stickers and backgrounds, post it
// (components/features/vibeSections/editor/vibeEditor.vue). Signed-in only:
// the upload (/api/upload-video) is the member's.
definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.upload-page {
  max-width: 1200px;
  margin: auto;
  padding: 2rem 1rem;
}

.upload-page__title {
  margin-bottom: 1rem;
  font-size: 1.75rem;
}
</style>
