<template>
  <div class="account-search-result">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({})
</script>

<style scoped>
.account-search-result { padding: 0.5rem; }
</style>
