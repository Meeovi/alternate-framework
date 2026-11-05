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
          :future="instantSearchFuture"
          :on-state-change="onStateChange"
        >
          <!-- No visible box here (the header has one), but InstantSearch
               only applies initialUiState's query when a search-box widget
               is mounted to own it; without this every search went out
               with an empty query. -->
          <ais-search-box>
            <template #default><span hidden /></template>
          </ais-search-box>

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

          <ais-current-refinements v-slot="{ items, refine }" :excluded-attributes="EXCLUDED_ATTRIBUTES">
            <div v-if="items.length" class="results-toolbar__refinements">
              <template v-for="entry in items" :key="entry.attribute">
                <v-chip
                  v-for="chip in chipsFor(entry)"
                  :key="chip.key"
                  closable
                  size="small"
                  class="mr-1 mb-1"
                  @click:close="chip.refinements.forEach((refinement) => refine(refinement))"
                >
                  {{ chip.label }}
                </v-chip>
              </template>
              <ais-clear-refinements v-slot="{ refine: clearAll, canRefine }" :excluded-attributes="EXCLUDED_ATTRIBUTES">
                <v-btn v-if="canRefine" size="small" variant="text" @click="clearAll">Clear all</v-btn>
              </ais-clear-refinements>
            </div>
          </ais-current-refinements>

          <div class="results-layout">
            <!-- One copy of the filters at a time (sidebar, or the drawer
                 while it's open): a second, hidden copy of every filter
                 widget made each choice search twice. -->
            <aside v-if="mdAndUp" class="results-layout__filters">
              <component :is="resolvedFiltersComponent" :visible="true" />
            </aside>

            <v-navigation-drawer v-model="mobileFiltersOpen" location="left" temporary width="320" class="d-md-none">
              <component :is="resolvedFiltersComponent" v-if="!mdAndUp && mobileFiltersOpen" :visible="true" />
            </v-navigation-drawer>

            <main class="results-layout__main" :class="{ 'is-loading': isLoading }">
              <ais-state-results>
                <!-- AisStateResults renders a raw debug dump ("Use this
                     component to have a different layout..." + <pre>
                     results: [...keys] </pre>) into its DEFAULT slot when
                     that slot is left unfilled — providing only #error
                     doesn't count as filling it. That debug block has no
                     width constraint, so it was spilling off the page on
                     every normal (non-error) render.
                     A *literally empty* #default doesn't suppress it
                     either: Vue 3's renderSlot() treats a slot whose
                     render function returns zero real vnodes as "not
                     provided" and still falls through to the fallback
                     content (ensureValidVNode rejects comment-only /
                     empty results). It has to render one real, valid
                     element — hence the hidden <span> below. -->
                <template #default><span style="display:none"></span></template>
                <template #error>
                  <v-alert type="error" variant="tonal" class="mb-4">
                    <strong>Sorry, something went wrong with your search.</strong>
                    <div>Please try again later or adjust your search terms.</div>
                  </v-alert>
                </template>
              </ais-state-results>

              <!-- ais-hits/ais-infinite-hits don't forward a `class` passed
                   directly on them onto their rendered root (it's just
                   dropped, not merged with their own "ais-Hits"/
                   "ais-InfiniteHits" class) — the grid CSS below targeting
                   .results-grid never matched anything, so every result
                   list rendered as a plain block <ol>, one item per row,
                   full page height. Wrapping in a real element instead. -->
              <div class="results-hits">
                <ais-hits v-if="viewMode === 'paged'">
                  <template #item="{ item }">
                    <ResultCard :item="item" />
                  </template>
                </ais-hits>

                <ais-infinite-hits v-else>
                  <template #item="{ item }">
                    <ResultCard :item="item" />
                  </template>
                  <template #loadMore="{ refineNext, isLastPage }">
                    <div v-if="!isLastPage" class="results-layout__load-more">
                      <v-btn variant="outlined" @click="refineNext">Show more results</v-btn>
                    </div>
                  </template>
                </ais-infinite-hits>
              </div>

              <ais-state-results v-slot="{ results }">
                <v-alert v-if="results && results.nbHits === 0" type="info" variant="tonal" class="mt-4">
                  <template v-if="hasFilters">
                    <strong>Nothing matches the filters you chose{{ searchQuery ? ` for "${searchQuery}"` : '' }}.</strong>
                    <div>Remove a filter above, or clear them all.</div>
                  </template>
                  <template v-else>
                    <strong>No results found{{ searchQuery ? ` for "${searchQuery}"` : '' }}.</strong>
                    <div>Try a different search term or check your spelling.</div>
                  </template>
                </v-alert>
                <!-- Same unfilled-slot fallback-dump issue as the other
                     ais-state-results above: whenever there ARE results (the
                     normal case) or results is still null during the
                     initial load, the v-if above produces zero real vnodes,
                     so this real-but-invisible element has to always be
                     there instead. -->
                <span v-else style="display:none"></span>
              </ais-state-results>

              <div v-if="viewMode === 'paged'" class="results-layout__pagination">
                <!-- Wrapped in a real element: with a single page the v-if
                     leaves the slot empty, and Vue then falls back to the
                     widget's own unstyled <ul> (same issue as the
                     ais-state-results slots above). -->
                <ais-pagination v-slot="{ currentRefinement, nbPages, refine }">
                  <div>
                    <v-pagination
                      v-if="nbPages > 1"
                      :model-value="currentRefinement + 1"
                      :length="nbPages"
                      :total-visible="7"
                      rounded="circle"
                      @update:model-value="refine($event - 1)"
                    />
                  </div>
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
import { useDisplay } from 'vuetify'
import { useSearchClient, buildSortIndexName, type SearchResponse } from '../../composables/useSearchClient'
import { apiFiltersFromQuery, uiStateFromQuery, queryFromUiState, sameQuery, type ResultsUiState } from '../../utils/resultsUrl'
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
  const value = (config.public as any).alternateSearchIndexes
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

const snapshotRequest = computed(() => apiFiltersFromQuery(route.query, activeIndex.value))
const snapshotPageSize = computed(() => snapshotRequest.value.pageSize || 24)

// The first view (server-rendered) for whatever the address asks for,
// filters included. Only the search and index refetch it: after that the
// live results below are on screen.
const { data: snapshot } = await useAsyncData(
  'results-snapshot',
  () => $fetch<SearchResponse>('/api/search', {
    method: 'POST',
    body: {
      q: searchQuery.value,
      page: routePage.value,
      pageSize: snapshotPageSize.value,
      ...(snapshotRequest.value.algoliaFilters ? { algoliaFilters: snapshotRequest.value.algoliaFilters } : {}),
      ...(snapshotRequest.value.sort ? { sort: snapshotRequest.value.sort } : {}),
    },
  }),
  { watch: [searchQuery, activeIndex] },
)

const snapshotItems = computed(() => Array.isArray(snapshot.value?.items) ? snapshot.value.items : [])
const snapshotTotal = computed(() => typeof snapshot.value?.total === 'number' ? snapshot.value.total : null)
const snapshotLoaded = computed(() => snapshot.value !== null && snapshot.value !== undefined)
const snapshotPageCount = computed(() => snapshotTotal.value ? Math.max(1, Math.ceil(snapshotTotal.value / snapshotPageSize.value)) : 1)

function buildPageLink(page: number) {
  return { path: route.path, query: { ...route.query, page: String(page) } }
}

const { searchClient, isLoading } = useSearchClient()

// Flips once — from false to true — the first time the live InstantSearch
// tree finishes its first client-side search, swapping away from the
// server-rendered snapshot. Starts false on both server and client so the
// initial render trees match (no hydration mismatch).
const hasLiveResults = ref(false)
watch(isLoading, (loading: boolean) => {
  if (!loading) hasLiveResults.value = true
})

// Constants, not inline literals: a widget rebuilds itself (and searches
// again) whenever a prop gets a new object, and this component re-renders
// on every search (isLoading) — an inline `[]` made that an endless loop of
// /api/search requests.
// The query isn't a filter to clear here; the header's search box owns it.
const EXCLUDED_ATTRIBUTES = ['query']
const FILTER_LABELS: Record<string, string> = {
  category: 'Category', brand: 'Brand', resultType: 'Type', price: 'Price', rating: 'Rating',
}

type Refinement = { attribute: string, label: string, value: unknown, operator?: string, type?: string }

// One chip per chosen value; a number range (price ≥ 25 and ≤ 50, or = 0)
// is one chip worded like the filter list ("Price: $25 to $50", "Free").
function chipsFor(entry: { attribute: string, label: string, refinements: Refinement[] }) {
  const name = FILTER_LABELS[entry.attribute] || entry.label
  const numeric = entry.refinements.filter((refinement) => refinement.type === 'numeric')
  const chips = entry.refinements
    .filter((refinement) => refinement.type !== 'numeric')
    .map((refinement) => ({ key: `${entry.attribute}-${refinement.label}`, label: `${name}: ${refinement.label}`, refinements: [refinement] }))
  if (numeric.length) {
    const value = (operator: string) => numeric.find((refinement) => refinement.operator === operator)?.value as number | undefined
    const money = (amount: number) => (entry.attribute === 'price' ? `$${amount}` : String(amount))
    const equal = value('=')
    const min = value('>=')
    const max = value('<=')
    const range = equal !== undefined
      ? (entry.attribute === 'price' && equal === 0 ? 'Free' : money(equal))
      : min !== undefined && max !== undefined
        ? `${money(min)} to ${money(max)}`
        : max !== undefined
          ? `Under ${money(max)}`
          : min !== undefined
            ? (entry.attribute === 'rating' ? `${min}★ & up` : `${money(min)} & above`)
            : numeric.map((refinement) => refinement.label).join(', ')
    chips.push({ key: `${entry.attribute}-range`, label: `${name}: ${range}`, refinements: numeric })
  }
  return chips
}

// Filters in the address = filters chosen (resultsUrl.ts keeps them there).
const hasFilters = computed(() => ['category', 'type', 'brand', 'price', 'rating'].some((param) => route.query[param] !== undefined))
const instantSearchFuture = { preserveSharedStateOnUnmount: true }

const mobileFiltersOpen = ref(false)
const { mdAndUp } = useDisplay()
const viewMode = ref<'paged' | 'infinite'>('paged')

// Remount InstantSearch whenever the query or the target index changes so
// its internal helper state starts clean (mirrors the pattern already used
// by pages/results.vue).
// `restored` is bumped when the address changes by itself (back/forward,
// a link): the tree remounts from the new address.
const restored = ref(0)
const instantSearchKey = computed(() => `results-${searchQuery.value || 'all'}-${activeIndex.value}-${restored.value}`)

// The page's state lives in the address — search, page, filters, sort and
// page size — so a results page can be shared, bookmarked, reloaded and
// gone back to, like any search results page.
const initialUiState = computed(() => ({
  [activeIndex.value]: uiStateFromQuery(route.query, activeIndex.value),
}))

let lastWrittenQuery: ReturnType<typeof queryFromUiState> | null = null
const router = useRouter()

function onStateChange({ uiState, setUiState }: { uiState: Record<string, ResultsUiState>, setUiState: (state: Record<string, ResultsUiState>) => void }) {
  const before = uiStateFromQuery(route.query, activeIndex.value)
  setUiState(uiState)
  const state = uiState[activeIndex.value] || {}
  // "Load more" grows the page as it goes: not an address of its own.
  const next = queryFromUiState(viewMode.value === 'paged' ? state : { ...state, page: undefined }, activeIndex.value)
  if (sameQuery(next, route.query)) return
  lastWrittenQuery = next
  router.push({ path: route.path, query: next })
  if (viewMode.value === 'paged' && (state.page || 1) !== (before.page || 1)) {
    document.querySelector('.results-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

watch(() => route.query, (query) => {
  if (lastWrittenQuery && sameQuery(lastWrittenQuery, query)) return
  lastWrittenQuery = null
  restored.value++
})

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

/* The snapshot's cells sit straight in .results-grid; the live widgets put
   their own list inside .results-hits, so that list is the grid. */
.results-grid,
.results-hits :deep(.ais-Hits-list),
.results-hits :deep(.ais-InfiniteHits-list) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
}

/* The app's styles.css makes .ais-Hits `position: absolute; width: 100%`,
   which pulled the grid out of this column and over the page. */
.results-hits :deep(.ais-Hits),
.results-hits :deep(.ais-InfiniteHits) {
  position: static;
  width: auto;
}

.results-hits :deep(.ais-Hits-item),
.results-hits :deep(.ais-InfiniteHits-item) {
  display: flex;
  min-width: 0;
}

.results-hits :deep(.ais-Hits-item > *),
.results-hits :deep(.ais-InfiniteHits-item > *),
.results-grid__cell > * {
  width: 100%;
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
