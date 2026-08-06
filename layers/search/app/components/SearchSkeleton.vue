<template>
  <div class="search-entry-skeleton">
    <v-skeleton-loader
      class="search-skeleton-loader"
      type="text"
      :loading="true"
      height="40"
    />
  </div>
</template>

<script setup lang="ts">
// Pure skeleton - no logic
// CSS handles all spacing to match search.vue exactly
</script>

<style scoped>
.search-entry-skeleton {
  /* Match search-entry-form from search.vue */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 250px;
  max-width: 400px;
  width: 100%;
  height: 40px;
}

.search-skeleton-loader {
  flex: 1;
  min-height: 40px;
  height: 40px;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .search-entry-skeleton {
    min-width: 200px;
    max-width: 280px;
  }
}
</style>
