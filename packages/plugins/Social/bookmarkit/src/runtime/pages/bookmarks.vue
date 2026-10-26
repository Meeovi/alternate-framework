<script setup lang="ts">
import { useHead } from '#imports'

useHead({ title: 'Bookmarks' })
</script>

<template>
  <div class="bookmarkit-page">
    <h1 class="text-h5 mb-4">Bookmarks</h1>
    <Bookmarkit />
  </div>
</template>

<style scoped>
.bookmarkit-page {
  padding: 16px;
}
</style>
