<!-- pages/results.vue -->
<template>
  <div class="contentPage">
    <v-sheet elevation="2">
      <v-toolbar class="results-header" color="blue" density="comfortable" flat>
        <v-toolbar-title class="amz-title">
          Results for "{{ searchQuery || 'all items' }}"
        </v-toolbar-title>

        <v-spacer />
      </v-toolbar>

      <v-divider />

      <v-sheet class="pa-5" color="transparent">
        <ResultsComponent />
      </v-sheet>
    </v-sheet>
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
