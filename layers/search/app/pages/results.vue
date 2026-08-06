<!-- pages/results.vue -->
<template>
  <div>
    <v-sheet elevation="2">
      <v-toolbar class="results-header" color="blue" density="comfortable" flat>
        <v-toolbar-title class="amz-title">
          Results for "{{ searchQuery || 'all items' }}"
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-chip class="resultsTotalBadge" color="amber-lighten-5" label>
          <component
            v-for="widget in topWidgets"
            :key="widget.name || widget.component?.name"
            :is="resolveWidgetComponent(widget)"
            v-bind="widget.props"
          />
        </v-chip>
      </v-toolbar>

      <v-divider />
      <v-tabs v-model="tab" color="primary">
        <v-tab value="one">All</v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <ClientOnly>
        <ais-instant-search
          :key="instantSearchKey"
          :search-client="searchClient"
          :index-name="activeIndex"
        >
          <component
            v-for="widget in rootWidgets"
            :key="widget.name || widget.component?.name"
            :is="resolveWidgetComponent(widget)"
            v-bind="widget.props"
          />

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="one">
              <v-sheet class="pa-5" color="purple">
                <section class="results-page">
                  <v-card class="results-shell" elevation="0">
                    <v-row no-gutters>
                      <!-- Sidebar filters -->
                      <v-col cols="12" md="3" class="results-sidebar">
                        <div class="d-md-none pa-3">
                          <v-btn block color="primary" variant="outlined"
                            prepend-icon="fas fa-sliders-h" @click="mobileFiltersOpen = true">
                            Filters
                          </v-btn>
                        </div>

                        <div class="d-none d-md-block">
                          <SharedFilters />
                        </div>
                      </v-col>

                      <!-- Main results -->
                      <v-col cols="12" md="9" class="results-main pa-4 pa-md-6">
                        <div class="results-meta mb-4">
                          <div class="results-count">
                            <component
                              v-for="widget in metaWidgets"
                              :key="widget.name || widget.component?.name"
                              :is="resolveWidgetComponent(widget)"
                              v-bind="widget.props"
                            />
                          </div>
                        </div>

                        <!-- Error state -->
                        <component
                          v-for="widget in errorWidgets"
                          :key="widget.name || widget.component?.name"
                          :is="resolveWidgetComponent(widget)"
                          v-bind="widget.props"
                        />

                        <!-- Hits list -->
                        <ais-panel>
                          <template #header>Results</template>
                          <component
                            v-for="widget in hitsWidgets"
                            :key="widget.name || widget.component?.name"
                            :is="resolveWidgetComponent(widget)"
                            v-bind="widget.props"
                          />
                        </ais-panel>

                        <!-- Pagination -->
                        <ais-panel>
                          <template #header>Pagination</template>
                          <div class="d-flex justify-center mt-6">
                            <component
                              v-for="widget in paginationWidgets"
                              :key="widget.name || widget.component?.name"
                              :is="resolveWidgetComponent(widget)"
                              v-bind="widget.props"
                            />
                          </div>
                        </ais-panel>
                      </v-col>
                    </v-row>
                  </v-card>

                  <!-- Mobile filters drawer -->
                  <v-navigation-drawer
                    v-model="mobileFiltersOpen"
                    location="left"
                    temporary
                    width="320"
                    class="d-md-none"
                  >
                    <SharedFilters />
                  </v-navigation-drawer>
                </section>
              </v-sheet>
            </v-tabs-window-item>
          </v-tabs-window>
        </ais-instant-search>

        <!-- Server fallback / skeleton -->
        <template #fallback>
          <v-sheet class="pa-5" color="purple">
            <v-card class="results-shell" elevation="0">
              <v-row no-gutters>
                <v-col cols="12" md="3" class="results-sidebar">
                  <v-skeleton-loader type="list-item" />
                </v-col>
                <v-col cols="12" md="9" class="results-main pa-4 pa-md-6">
                  <v-skeleton-loader type="heading" class="mb-4" />
                  <v-skeleton-loader type="paragraph" class="mb-2" />
                  <v-skeleton-loader type="paragraph" class="mb-2" />
                  <v-skeleton-loader type="paragraph" />
                </v-col>
              </v-row>
            </v-card>
          </v-sheet>
        </template>
      </ClientOnly>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import { useSearchClient } from '../composables/useSearchClient'
import { useInstantSearchWidgets, resolveWidgetComponent, type InstantSearchWidgetConfig } from '../composables/useInstantSearchWidgets'
import SharedFilters from '../components/filters/filters.vue'
import ResultsStats from '../components/results/ResultsStats.vue'
import ResultsStateResults from '../components/results/ResultsStateResults.vue'
import ResultsHits from '../components/results/ResultsHits.vue'
import ResultsPagination from '../components/results/ResultsPagination.vue'

const route = useRoute()

const searchQuery = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')
const activeIndex = computed(() => {
  const requested = typeof route.query.index === 'string' ? route.query.index : ''
  const indexes = ['products']
  return requested || indexes[0]
})

// Force remount when query/index changes so instantsearch re-initializes cleanly
const instantSearchKey = computed(() => `search-${searchQuery.value || 'all'}-${activeIndex.value}`)

const { searchClient } = useSearchClient()
const { widgetRegistry } = useInstantSearchWidgets()

const tab = ref('one')
const mobileFiltersOpen = ref(false)

const emptyMessage = computed(() => {
  if (!searchQuery.value) {
    return 'Use the search box above to query the seeded in-memory records or your configured backend.'
  }
  return `No matches were found for "${searchQuery.value}".`
})

function totalLabel(nbHits: number) {
  if (!searchQuery.value) return 'Enter a query to search the demo dataset.'
  const pages = Math.max(1, Math.ceil(nbHits / 12))
  return `${nbHits} result${nbHits === 1 ? '' : 's'} across ${pages} page${pages === 1 ? '' : 's'}`
}

function firstValue(item: Record<string, any>, keys: string[]): unknown {
  for (const key of keys) {
    const value = item?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

function getTitle(item: Record<string, any>): string {
  return String(firstValue(item, ['title', 'name', 'label', 'product_name']) || 'Untitled')
}

function getDescription(item: Record<string, any>): string {
  const value = firstValue(item, ['description', 'body', 'summary', 'excerpt', 'content'])
  return value ? String(value) : 'No description available.'
}

function getPrice(item: Record<string, any>): number | null {
  const value = firstValue(item, ['price', 'amount', 'final_price'])
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getLink(item: Record<string, any>): string | null {
  const value = firstValue(item, ['url', 'slug'])
  if (!value) return null
  if (String(value).startsWith('http')) return String(value)
  return null
}

function formatPrice(value: number | null): string {
  if (value === null) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

const rootWidgets = computed<InstantSearchWidgetConfig[]>(() => {
  return [
    {
      name: 'configure',
      props: { query: searchQuery.value || '', 'hits-per-page': 12 },
      condition: () => true,
    },
  ]
})

const topWidgets = computed<InstantSearchWidgetConfig[]>(() => {
  return [
    {
      component: ResultsStats,
      props: {
        formatter: totalLabel,
      },
      condition: () => true,
    },
  ]
})

const metaWidgets = computed<InstantSearchWidgetConfig[]>(() => {
  return [
    {
      component: ResultsStats,
      props: {
        formatter: (nbHits: number) => `${nbHits} showing`,
      },
      condition: () => true,
    },
  ]
})

const errorWidgets = computed<InstantSearchWidgetConfig[]>(() => {
  return [
    {
      component: ResultsStateResults,
      props: {},
      condition: () => true,
    },
  ]
})

const hitsWidgets = computed<InstantSearchWidgetConfig[]>(() => {
  return [
    {
      component: ResultsHits,
      props: {
        emptyMessage: emptyMessage.value,
        activeIndex: activeIndex.value,
        getTitle,
        getDescription,
        getPrice,
        getLink,
        formatPrice,
      },
      condition: () => true,
    },
  ]
})

const paginationWidgets = computed<InstantSearchWidgetConfig[]>(() => {
  return [
    {
      component: ResultsPagination,
      props: {},
      condition: () => true,
    },
  ]
})

useHead({
  title: 'Search Results'
})
</script>

<style scoped>
.results-skeleton { padding: 1rem; }
</style>
