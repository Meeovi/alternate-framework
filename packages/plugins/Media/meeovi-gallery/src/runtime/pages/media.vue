<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'

// Signed-in only (every /connect page is), and the gallery is personal.
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Your media' })
</script>

<template>
  <div class="meeovi-gallery-page">
    <h1 class="text-h5 mb-1">Your media</h1>
    <p class="text-medium-emphasis mb-4">
      Everything you've uploaded on Meeovi, stored on Pixanomy, sorted into folders by where you posted it and when.
    </p>
    <MeeoviGallery />
  </div>
</template>

<style scoped>
.meeovi-gallery-page {
  padding: 16px;
}
</style>
