<template>
  <div v-if="others.length" class="recent-searches">
    <span class="recent-searches__label text-medium-emphasis">Recent searches</span>
    <v-chip v-for="q in others" :key="q" size="small" variant="tonal" class="ma-1" :to="{ path: '/results', query: { q } }"
      closable :close-label="`Remove ${q} from recent searches`" @click:close.prevent="forget(q)">
      <v-icon start icon="fas fa-clock-rotate-left" size="x-small" />{{ q }}
    </v-chip>
    <v-btn variant="text" size="small" @click="forget()">Clear</v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

/**
 * The signed-in member's recent searches on the results page. Stored per
 * account by layers/social (/api/social/search-history); for guests, or in
 * an app without that layer, the request fails or comes back empty and the
 * row stays hidden.
 */
const props = defineProps<{ query: string }>()

const ENDPOINT = '/api/social/search-history'
const queries = ref<string[]>([])

// The current search is the page heading already; show the others.
const others = computed(() => queries.value.filter((q) => q.toLowerCase() !== props.query.toLowerCase()))

async function load() {
  const res = await $fetch<{ queries: string[] }>(ENDPOINT).catch(() => null)
  queries.value = res?.queries ?? []
}

async function remember(q: string) {
  if (!q) return
  // Guests get a 401 here; nothing to remember for them.
  await $fetch(ENDPOINT, { method: 'POST', body: { q } }).catch(() => {})
}

async function forget(q?: string) {
  queries.value = q ? queries.value.filter((other) => other !== q) : []
  await $fetch(ENDPOINT, { method: 'DELETE', query: q ? { q } : {} }).catch(() => {})
}

// Client-only: history is per account and never part of the SSR page.
onMounted(async () => {
  await remember(props.query)
  await load()
})
watch(() => props.query, async (q, previous) => {
  if (q === previous) return
  await remember(q)
  await load()
})
</script>

<style scoped>
.recent-searches {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 8px 0 0;
}

.recent-searches__label {
  font-size: 0.85rem;
  margin-right: 6px;
}
</style>
