<!-- pages/results.vue -->
<template>
  <div class="contentPage">
    <div class="results-page-shell">
      <v-toolbar class="results-heading" color="primary" density="comfortable" flat rounded="lg">
        <v-toolbar-title class="results-heading__title">
          Results for "{{ searchQuery || 'all items' }}"
        </v-toolbar-title>

        <v-spacer />
      </v-toolbar>

      <div class="pt-4">
        <ResultsComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ResultsComponent from '../components/results/resultsComponent.vue'

const route = useRoute()

const searchQuery = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')

useHead({
  title: 'Search Results',
})
</script>

<style scoped>
.results-page-shell {
  /* Keep the page chrome transparent so the app's own light/dark
     background shows through instead of a hard white slab. */
  background: transparent;
  padding: 16px;
}

.results-heading__title {
  font-weight: 700;
  letter-spacing: 0.1px;
}

/* Older global search.css hard-codes white/gradient backgrounds on class
   names this results view reuses (.results-page, .results-toolbar). Force
   them transparent so the toggleable theme background wins in both modes. */
.results-page-shell :deep(.results-page),
.results-page-shell :deep(.results-toolbar),
.results-page-shell :deep(.results-grid-wrap),
.results-page-shell :deep(.results-layout__main),
.results-page-shell :deep(.results-layout__filters) {
  background: transparent !important;
  min-width: 0 !important;
}

.results-page-shell :deep(.results-page) {
  min-height: 0 !important;
}

.results-page-shell :deep(.results-toolbar) {
  border: none !important;
  padding: 0 !important;
}
</style>
