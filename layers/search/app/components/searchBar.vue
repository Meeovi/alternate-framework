<template>
  <ClientOnly>
    <ais-instant-search :key="activeIndex" :search-client="searchClient" :index-name="activeIndex" class="search-bar">
      <ais-configure :hits-per-page.camel="6" />

      <ais-search-box v-slot="{ currentRefinement, refine }">
        <ais-autocomplete v-slot="{ indices }">
          <form class="search-bar__row" @submit.prevent="navigateToResults(currentRefinement)">
            <v-select
              v-if="indexes.length > 1"
              :model-value="activeIndex"
              :items="indexes"
              density="comfortable"
              variant="solo-inverted"
              hide-details
              class="search-bar__index"
              @update:model-value="onIndexChange"
            />

            <div class="search-bar__input-wrap">
              <v-text-field
                :model-value="currentRefinement"
                type="search"
                placeholder="Search items, categories, or brands..."
                variant="solo-inverted"
                hide-details
                clearable
                :disabled="loading"
                class="search-bar__input"
                @update:model-value="(value: string) => onQueryInput(value, refine)"
                @focus="suggestionsOpen = true"
                @blur="closeSuggestionsSoon"
                @keydown.esc="suggestionsOpen = false"
              />

              <ais-voice-search
                v-slot="{ isListening, toggleListening, isBrowserSupported }"
                search-as-you-speak
                class="search-bar__voice-search"
              >
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :disabled="!isBrowserSupported"
                  :color="isListening ? 'primary' : undefined"
                  :title="isBrowserSupported ? 'Search by voice' : 'Voice search not supported on this browser'"
                  @click="toggleListening"
                >
                  <v-icon icon="fas fa-microphone" />
                </v-btn>
              </ais-voice-search>

              <v-btn
                type="submit"
                class="search-bar__submit"
                color="primary"
                icon
                :loading="loading"
                aria-label="Search"
              >
                <v-icon icon="fas fa-search" />
              </v-btn>

              <div
                v-if="suggestionsOpen && currentRefinement && indices?.[0]?.hits?.length"
                class="search-bar__suggestions"
              >
                <button
                  v-for="hit in indices[0].hits"
                  :key="String(hit.objectID)"
                  type="button"
                  class="search-bar__suggestion"
                  @mousedown.prevent="selectSuggestion(hit, refine)"
                >
                  <img
                    v-if="getItemImage(hit)"
                    :src="getItemImage(hit) as string"
                    alt=""
                    class="search-bar__suggestion-image"
                  >
                  <span class="search-bar__suggestion-title">{{ getItemTitle(hit) }}</span>
                  <span v-if="getItemPrice(hit) !== null" class="search-bar__suggestion-price">
                    {{ formatItemPrice(getItemPrice(hit)) }}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </ais-autocomplete>
      </ais-search-box>

      <ais-stats class="search-bar__stats">
        <template #default="{ nbHits }">
          <span v-if="nbHits > 0" class="search-bar__stats-text">{{ formatNumber(nbHits) }} results</span>
        </template>
      </ais-stats>
    </ais-instant-search>

    <template #fallback>
      <form class="search-bar" @submit.prevent="navigateToResults(fallbackQuery)">
        <div class="search-bar__row">
          <v-select
            v-if="indexes.length > 1"
            v-model="activeIndex"
            :items="indexes"
            density="comfortable"
            variant="solo-inverted"
            hide-details
            class="search-bar__index"
            :disabled="loading"
          />

          <div class="search-bar__input-wrap">
            <v-text-field
              v-model="fallbackQuery"
              type="search"
              placeholder="Search items, categories, or brands..."
              variant="solo-inverted"
              hide-details
              clearable
              :disabled="loading"
              class="search-bar__input"
            />
            <v-btn type="submit" class="search-bar__submit" color="primary" icon :loading="loading" aria-label="Search">
              <v-icon icon="fas fa-search" />
            </v-btn>
          </div>
        </div>
      </form>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import { useSearchClient } from '../composables/useSearchClient'
import { formatNumber } from '../utils/formatNumber'

const route = useRoute()
const config = useRuntimeConfig()

const { searchClient } = useSearchClient()

const indexes = computed<string[]>(() => {
  const value = config.public.alternateSearchIndexes
  return Array.isArray(value) && value.length > 0 ? value : ['products']
})

const activeIndex = ref(
  typeof route.query.index === 'string' && indexes.value.includes(route.query.index)
    ? route.query.index
    : indexes.value[0] || 'products',
)

// Only used by the pre-hydration fallback form below — the live widget tree
// reads/writes its query through ais-search-box's own state instead.
const fallbackQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')

const loading = ref(false)
const suggestionsOpen = ref(false)

watch(
  () => route.query,
  (nextQuery) => {
    fallbackQuery.value = typeof nextQuery.q === 'string' ? nextQuery.q : ''
    if (typeof nextQuery.index === 'string' && indexes.value.includes(nextQuery.index)) {
      activeIndex.value = nextQuery.index
    }
  },
  { deep: true },
)

function onIndexChange(value: string) {
  activeIndex.value = value
}

function onQueryInput(value: string, refine: (query: string) => void) {
  refine(value ?? '')
  suggestionsOpen.value = true
}

function closeSuggestionsSoon() {
  // Delayed so a suggestion's @mousedown (which fires before blur) still
  // has a chance to run before the dropdown disappears.
  window.setTimeout(() => {
    suggestionsOpen.value = false
  }, 150)
}

function selectSuggestion(hit: Record<string, unknown>, refine: (query: string) => void) {
  const title = getItemTitle(hit)
  refine(title)
  navigateToResults(title)
}

async function navigateToResults(queryText: string) {
  const normalized = queryText.trim()
  loading.value = true
  try {
    await navigateTo({
      path: '/results',
      query: {
        ...(normalized ? { q: normalized } : {}),
        index: activeIndex.value,
        page: '1',
      },
    })
  } finally {
    loading.value = false
    suggestionsOpen.value = false
  }
}

function firstValue(item: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = item?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

function getItemTitle(item: Record<string, unknown>): string {
  return String(firstValue(item, ['title', 'name', 'label', 'product_name']) || 'Untitled')
}

function getItemImage(item: Record<string, unknown>): string | null {
  const raw = firstValue(item, ['image', 'thumbnail', 'photo', 'picture', 'avatar'])
  if (!raw) return null
  if (typeof raw === 'string' && /^(https?:)?\/\//.test(raw)) return raw
  if (typeof raw === 'string' && raw.startsWith('/')) return raw
  return getAssetURL(raw)
}

function getItemPrice(item: Record<string, unknown>): number | null {
  const value = firstValue(item, ['price', 'amount', 'final_price'])
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatItemPrice(value: number | null): string {
  if (value === null) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<style scoped>
.search-bar__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 720px;
  margin: 0 auto;
  flex: 1;
}

.search-bar__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.search-bar__input {
  flex: 1;
  min-width: 0;
}

.search-bar__voice-search {
  flex: 0 0 auto;
}

.search-bar__submit {
  flex: 0 0 auto;
}

.search-bar__index-col {
  flex: 0 0 auto;
  padding: 0;
}

.search-bar__index {
  width: 140px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.search-bar__suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  background: rgb(var(--v-theme-surface));
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 360px;
  overflow-y: auto;
}

.search-bar__suggestion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));
}

.search-bar__suggestion:hover,
.search-bar__suggestion:focus-visible {
  background: rgba(var(--v-theme-on-surface), 0.06);
  outline: none;
}

.search-bar__suggestion-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
  flex: 0 0 auto;
}

.search-bar__suggestion-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.search-bar__suggestion-price {
  flex: 0 0 auto;
  font-size: 0.85rem;
  font-weight: 600;
}

.search-bar__stats {
  display: flex;
  justify-content: flex-end;
  max-width: 720px;
  margin: 0.25rem auto 0;
  padding: 0;
}

.search-bar__stats-text {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.search-bar :deep(.ais-SearchBox-loadingIndicator) {
  margin-left: 8px;
}

.search-bar :deep(.ais-SearchBox-loadingIndicator svg) {
  width: 16px;
  height: 16px;
}
</style>
