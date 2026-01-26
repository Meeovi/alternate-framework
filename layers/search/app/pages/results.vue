<template>
  <div class="resultsPage">
    <ais-instant-search :search-client="searchClient" :index-name="indexName">
      <header class="search-header">
        <ais-search-box />
        <ais-stats />
        <ais-sort-by :items="sortingOptions" />
      </header>

      <div class="search-body">
        <aside class="filters">
          <ais-refinement-list attribute="category" />
          <ais-refinement-list attribute="brand" />
          <ais-range-input attribute="price" />
          <ais-rating-menu attribute="rating_rounded" />
        </aside>

        <main class="results">
          <ais-hits>
            <template #item="{ item }">
              <article @click="openResult(item)" class="hit">
                <h3><ais-highlight attribute="title" :hit="item" /></h3>
                <p><ais-snippet attribute="plot" :hit="item" /></p>
              </article>
            </template>
          </ais-hits>

          <ais-pagination />
        </main>
      </div>
    </ais-instant-search>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuntimeConfig } from '#imports'
import Client from '@searchkit/instantsearch-client'
import { getSearchClient, getIndexName } from '../utils/search/client'

import 'instantsearch.css/themes/satellite-min.css'

// initialize search client using existing helper (falls back safely)
let searchClient
let indexName = 'default'
try {
  searchClient = getSearchClient()
  indexName = getIndexName()
} catch (e) {
  // fallback placeholder
  // eslint-disable-next-line no-console
  console.warn('Search client unavailable:', e.message || e)
  searchClient = { _client: 'searchkit-fallback' }
}

const router = useRouter()
const route = useRoute()

function openResult(item) {
  const id = item._id ?? item.id ?? ''
  const title = item.title ?? item.name ?? ''
  router.push({ path: route.path, query: { ...route.query, id, title } })
}

const sortingOptions = [
  { value: indexName, label: 'Featured' },
  { value: `${indexName}:price:asc`, label: 'Price: Low to High' },
  { value: `${indexName}:price:desc`, label: 'Price: High to Low' },
  { value: `${indexName}:rating:desc`, label: 'Rating: High to Low' }
]

definePageMeta({ layout: 'nolive' })
useHead({ title: 'Search Results' })
</script>

<style scoped>
.search-body {
  display: flex;
  gap: 1rem;
}
.filters { width: 260px }
.results { flex: 1 }
.hit { padding: 0.75rem; border-bottom: 1px solid #eee }
</style>