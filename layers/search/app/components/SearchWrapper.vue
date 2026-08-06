<template>
  <!-- Skeleton renders on server + until hydration -->
  <SearchSkeleton v-if="showSkeleton" />

  <!-- Real search loads client-side -->
  <ClientOnly v-show="!showSkeleton">
    <Search />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Search from './search.vue'
import SearchSkeleton from './SearchSkeleton.vue'

const showSkeleton = ref(true)

// Hide skeleton once hydration complete
onMounted(() => {
  showSkeleton.value = false
})
</script>

<style scoped>
/* Ensure no layout shift between skeleton and real search */
</style>
