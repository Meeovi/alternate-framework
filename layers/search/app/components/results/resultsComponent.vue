<template>
  <div class="results-page">
    <!-- Server-rendered snapshot: real, crawlable HTML for first paint and
         SEO (fetched via useAsyncData -> /api/search, Nuxt's normal SSR data
         flow). Shown until the live, fully interactive InstantSearch tree
         below has produced its first result set, then hidden — v-show, not
         v-if, so the swap doesn't unmount/remount anything or cause a
         layout jump. Both start hidden-vs-shown identically on the server
         and on the client's first render (hasLiveResults starts false in
         both places), so there's no hydration mismatch. -->
    <div v-show="!hasLiveResults" class="results-snapshot">
      <header class="results-toolbar">
        <span class="results-toolbar__stats">
          <template v-if="snapshotTotal !== null">
            <strong>{{ formatNumber(snapshotTotal) }}</strong> result{{ snapshotTotal === 1 ? '' : 's' }}
            <template v-if="searchQuery">for &ldquo;{{ searchQuery }}&rdquo;</template>
          </template>
        </span>
      </header>

      <div class="results-layout">
        <main class="results-layout__main">
          <div v-if="snapshotItems.length" class="results-grid">
            <div v-for="item in snapshotItems" :key="String(item.objectID)" class="results-grid__cell">
              <ResultCard :item="item" />
            </div>
          </div>

          <v-alert v-else-if="snapshotLoaded" type="info" variant="tonal" class="mt-4">
            <strong>No results found{{ searchQuery ? ` for "${searchQuery}"` : '' }}.</strong>
            <div>Try a different search term, check your spelling, or clear some filters.</div>
          </v-alert>

          <!-- Real <a> links so crawlers can reach deeper pages without
               running JS; the live widget tree's own pagination takes over
               once hydrated. -->
          <nav v-if="snapshotPageCount > 1" class="results-layout__pagination results-layout__pagination--snapshot" aria-label="Results pages">
            <NuxtLink v-if="routePage > 1" :to="buildPageLink(routePage - 1)" rel="prev">Previous</NuxtLink>
            <span>Page {{ routePage }} of {{ snapshotPageCount }}</span>
            <NuxtLink v-if="routePage < snapshotPageCount" :to="buildPageLink(routePage + 1)" rel="next">Next</NuxtLink>
          </nav>
        </main>
      </div>
    </div>

    <!-- Full InstantSearch widget library: kept client-only since several
         widgets (e.g. ais-voice-search) touch browser-only APIs and can't
         be safely verified to render during SSR here. It mounts
         immediately (no delay from the snapshot above) and starts fetching
         right away; once its first result set resolves, hasLiveResults
         flips and it replaces the snapshot 1:1. -->
    <ClientOnly>
      <div v-show="hasLiveResults">
        <ais-instant-search
          :key="instantSearchKey"
          :search-client="searchClient"
          :index-name="activeIndex"
          :initial-ui-state="initialUiState"
          :future="{ preserveSharedStateOnUnmount: true }"
        >
          <header class="results-toolbar">
            <v-btn
              class="results-toolbar__filters-btn d-md-none"
              variant="outlined"
              prepend-icon="fas fa-sliders-h"
              @click="mobileFiltersOpen = true"
            >
              Filters
            </v-btn>

            <ais-state-results v-slot="{ results }" class="results-toolbar__stats">
              <span v-if="isLoading">Searching…</span>
              <span v-else-if="results && results.nbHits !== undefined">
                <strong>{{ formatNumber(results.nbHits) }}</strong> result{{ results.nbHits === 1 ? '' : 's' }}
                <template v-if="searchQuery">for &ldquo;{{ searchQuery }}&rdquo;</template>
              </span>
            </ais-state-results>

            <div class="results-toolbar__controls">
              <ais-sort-by v-slot="{ items, refine, currentRefinement }" :items="sortItems">
                <v-select
                  :model-value="currentRefinement"
                  :items="items"
                  item-title="label"
                  item-value="value"
                  label="Sort by"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="results-toolbar__sort"
                  @update:model-value="refine"
                />
              </ais-sort-by>

              <ais-hits-per-page v-slot="{ items, refine }" :items="hitsPerPageItems">
                <v-select
                  :model-value="items.find((entry: { isRefined: boolean }) => entry.isRefined)?.value"
                  :items="items"
                  item-title="label"
                  item-value="value"
                  label="Show"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="results-toolbar__per-page"
                  @update:model-value="refine"
                />
              </ais-hits-per-page>

              <v-btn-toggle v-model="viewMode" density="compact" mandatory class="results-toolbar__view">
                <v-btn value="paged" prepend-icon="fas fa-table-cells">Pages</v-btn>
                <v-btn value="infinite" prepend-icon="fas fa-arrow-down-long">Load more</v-btn>
              </v-btn-toggle>
            </div>
          </header>

          <ais-current-refinements v-slot="{ items, refine }" :excluded-attributes="[]">
            <div v-if="items.length" class="results-toolbar__refinements">
              <template v-for="entry in items" :key="entry.attribute">
                <v-chip
                  v-for="refinement in entry.refinements"
                  :key="`${refinement.attribute}-${refinement.label}`"
                  closable
                  size="small"
                  class="mr-1 mb-1"
                  @click:close="refine(refinement)"
                >
                  {{ entry.label }}: {{ refinement.label }}
                </v-chip>
              </template>
              <ais-clear-refinements v-slot="{ refine: clearAll, canRefine }" :excluded-attributes="[]">
                <v-btn v-if="canRefine" size="small" variant="text" @click="clearAll">Clear all</v-btn>
              </ais-clear-refinements>
            </div>
          </ais-current-refinements>

          <div class="results-layout">
            <aside class="results-layout__filters d-none d-md-block">
              <component :is="resolvedFiltersComponent" :visible="true" />
            </aside>

            <v-navigation-drawer v-model="mobileFiltersOpen" location="left" temporary width="320" class="d-md-none">
              <component :is="resolvedFiltersComponent" :visible="true" />
            </v-navigation-drawer>

            <main class="results-layout__main" :class="{ 'is-loading': isLoading }">
              <ais-state-results>
                <template #error>
                  <v-alert type="error" variant="tonal" class="mb-4">
                    <strong>Sorry, something went wrong with your search.</strong>
                    <div>Please try again later or adjust your search terms.</div>
                  </v-alert>
                </template>
              </ais-state-results>

              <ais-hits v-if="viewMode === 'paged'" class="results-grid">
                <template #item="{ item }">
                  <ResultCard :item="item" />
                </template>
              </ais-hits>

              <ais-infinite-hits v-else class="results-grid">
                <template #item="{ item }">
                  <ResultCard :item="item" />
                </template>
                <template #loadMore="{ refineNext, isLastPage }">
                  <div v-if="!isLastPage" class="results-layout__load-more">
                    <v-btn variant="outlined" @click="refineNext">Show more results</v-btn>
                  </div>
                </template>
              </ais-infinite-hits>

              <ais-state-results v-slot="{ results }">
                <v-alert v-if="results && results.nbHits === 0" type="info" variant="tonal" class="mt-4">
                  <strong>No results found{{ searchQuery ? ` for "${searchQuery}"` : '' }}.</strong>
                  <div>Try a different search term, check your spelling, or clear some filters.</div>
                </v-alert>
              </ais-state-results>

              <div v-if="viewMode === 'paged'" class="results-layout__pagination">
                <ais-pagination v-slot="{ currentRefinement, nbPages, refine }">
                  <v-pagination
                    v-if="nbPages > 1"
                    :model-value="currentRefinement + 1"
                    :length="nbPages"
                    :total-visible="7"
                    rounded="circle"
                    @update:model-value="refine($event - 1)"
                  />
                </ais-pagination>
              </div>
            </main>
          </div>
        </ais-instant-search>
      </div>

      <template #fallback>
        <!-- Nothing here: the snapshot above already covers the pre-hydration state. -->
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSearchClient, buildSortIndexName, type SearchResponse } from '../../composables/useSearchClient'
import { formatNumber } from '../../utils/formatNumber'
import FiltersDefault from '../filters/filters.vue'
import ResultCard from './ResultCard.vue'

const props = withDefaults(defineProps<{
  filtersComponent?: object | null
}>(), {
  filtersComponent: null,
})

const route = useRoute()
const config = useRuntimeConfig()

const resolvedFiltersComponent = computed(() => props.filtersComponent || FiltersDefault)

const indexes = computed(() => {
  const value = config.public.alternateSearchIndexes
  return Array.isArray(value) && value.length > 0 ? value : ['products']
})

const searchQuery = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')
const activeIndex = computed(() => {
  const requested = typeof route.query.index === 'string' ? route.query.index : ''
  return requested || indexes.value[0] || 'products'
})
const routePage = computed(() => {
  const value = Number(route.query.page || 1)
  return Number.isFinite(value) && value > 0 ? value : 1
})

const SNAPSHOT_PAGE_SIZE = 24

const { data: snapshot } = await useAsyncData(
  'results-snapshot',
  () => $fetch<SearchResponse>('/api/search', {
    method: 'POST',
    body: { q: searchQuery.value, page: routePage.value, pageSize: SNAPSHOT_PAGE_SIZE },
  }),
  { watch: [searchQuery, activeIndex, routePage] },
)

const snapshotItems = computed(() => Array.isArray(snapshot.value?.items) ? snapshot.value.items : [])
const snapshotTotal = computed(() => typeof snapshot.value?.total === 'number' ? snapshot.value.total : null)
const snapshotLoaded = computed(() => snapshot.value !== null && snapshot.value !== undefined)
const snapshotPageCount = computed(() => snapshotTotal.value ? Math.max(1, Math.ceil(snapshotTotal.value / SNAPSHOT_PAGE_SIZE)) : 1)

function buildPageLink(page: number) {
  return { path: route.path, query: { ...route.query, page: String(page) } }
}

const { searchClient, isLoading } = useSearchClient()

// Flips once — from false to true — the first time the live InstantSearch
// tree finishes its first client-side search, swapping away from the
// server-rendered snapshot. Starts false on both server and client so the
// initial render trees match (no hydration mismatch).
const hasLiveResults = ref(false)
watch(isLoading, (loading) => {
  if (!loading) hasLiveResults.value = true
})

const mobileFiltersOpen = ref(false)
const viewMode = ref<'paged' | 'infinite'>('paged')

// Remount InstantSearch whenever the query or the target index changes so
// its internal helper state starts clean (mirrors the pattern already used
// by pages/results.vue).
const instantSearchKey = computed(() => `results-${searchQuery.value || 'all'}-${activeIndex.value}`)

const initialUiState = computed(() => ({
  [activeIndex.value]: {
    query: searchQuery.value,
    page: routePage.value,
  },
}))

// The federated backend has no Algolia-style replica indices to sort
// against, so sort options are encoded as synthetic "index names" that
// useSearchClient decodes back into a { field, direction } sort request.
const sortItems = computed(() => [
  { value: activeIndex.value, label: 'Relevance' },
  { value: buildSortIndexName(activeIndex.value, 'price', 'asc'), label: 'Price: Low to High' },
  { value: buildSortIndexName(activeIndex.value, 'price', 'desc'), label: 'Price: High to Low' },
  { value: buildSortIndexName(activeIndex.value, 'rating', 'desc'), label: 'Avg. Customer Review' },
])

const hitsPerPageItems = [
  { value: 12, label: '12 per page' },
  { value: 24, label: '24 per page', default: true },
  { value: 48, label: '48 per page' },
  { value: 96, label: '96 per page' },
]
</script>

<style scoped>
.results-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.results-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.results-toolbar__stats {
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.results-toolbar__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.results-toolbar__sort,
.results-toolbar__per-page {
  width: 190px;
}

.results-toolbar__refinements {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.results-layout {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.results-layout__filters {
  width: 260px;
  flex: 0 0 260px;
}

.results-layout__main {
  flex: 1;
  min-width: 0;
  transition: opacity 0.15s ease;
}

.results-layout__main.is-loading {
  opacity: 0.5;
  pointer-events: none;
}

.results-layout__pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.results-layout__pagination--snapshot {
  gap: 16px;
  align-items: center;
}

.results-layout__load-more {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  grid-column: 1 / -1;
}

.results-grid,
.results-grid :deep(.ais-Hits-list),
.results-grid :deep(.ais-InfiniteHits-list) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.results-grid :deep(.ais-Hits-item),
.results-grid :deep(.ais-InfiniteHits-item) {
  display: flex;
}

@media (max-width: 960px) {
  .results-layout {
    flex-direction: column;
  }

  .results-layout__filters {
    display: none;
  }
}
</style>
