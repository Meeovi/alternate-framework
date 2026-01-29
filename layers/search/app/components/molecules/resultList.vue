<template>
  <div class="result-list">
    <div v-if="loading">Loading…</div>
    <div v-else>
      <div class="hits" v-if="hits.length">
        <div v-for="(hit, idx) in hits" :key="hit._meta || idx" class="hit-item">
          <slot name="item" :hit="hit">
            <h3>{{ hit.title || hit.name || hit.id }}</h3>
            <p v-if="hit.description">{{ hit.description }}</p>
          </slot>
        </div>
      </div>
      <div v-else class="no-results">No results</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ hits: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
</script>

<style scoped>
.hit-item { padding: 12px; border-bottom: 1px solid #eee; }
.no-results { color: #777; padding: 12px; }
</style>
