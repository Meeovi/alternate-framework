<template>
  <ClientOnly>
    <!-- ais-instant-search drops a `class` set directly on it (it isn't
         merged onto its rendered root), so the wrapper carries the class
         the styles below target. -->
    <div class="searchForm">
    <ais-instant-search :key="`${activeIndex}-${routeQuery}`" :search-client="searchClient" :index-name="activeIndex"
      :initial-ui-state="initialUiState">

      <ais-search-box v-slot="{ currentRefinement, refine }">
        <!-- Not relying on native form submission (@submit.prevent) to reach
             navigateToResults any more — kept only as a harmless fallback.
             Vuetify's VField swallows the click on any interactive element
             inside a v-text-field's append-inner slot (it calls
             preventDefault() on click/mousedown there to stop the field
             from losing focus when you click a non-focusable icon), which
             also cancels the type="submit" button's own default action
             before the browser ever submits the form. Confirmed live:
             button clicks and even a raw dispatchEvent('click') on the
             button came back with `defaultPrevented: true` and the form's
             own 'submit' listener never fired. Explicit @click/@keyup.enter
             handlers below bypass that entirely. -->
        <form class="searchField" @submit.prevent="navigateToResults(currentRefinement)">
          <v-select v-if="indexes.length > 1" :model-value="activeIndex" :items="indexes" density="comfortable"
            variant="solo-inverted" hide-details class="search-bar__index" @update:model-value="onIndexChange" />

          <div class="search-bar__input-wrap">
            <v-text-field :model-value="currentRefinement" type="search"
              :placeholder="placeholder" variant="solo-inverted" hide-details clearable
              :disabled="loading" class="search-bar__input"
              @update:model-value="(value: string) => refine(value ?? '')"
              @keyup.enter="navigateToResults(currentRefinement)">
              <template #append-inner>
                <div class="search-bar__actions">
                  <ais-voice-search v-slot="{ isListening, toggleListening, isBrowserSupported, voiceListeningState }"
                    search-as-you-speak>
                    <v-btn type="button" class="voiceBtn" :class="{ 'voiceBtn--listening': isListening }"
                      icon="fas fa-microphone" variant="text" size="small" :disabled="!isBrowserSupported"
                      :color="isListening ? 'error' : undefined"
                      :title="isBrowserSupported ? (isListening ? 'Stop listening' : 'Search by voice') : 'Voice search not supported on this browser'"
                      :aria-label="isListening ? 'Stop listening' : 'Search by voice'" :aria-pressed="isListening"
                      @click="toggleListening">
                    </v-btn>
                    <voiceSearchStatus :state="voiceListeningState" @heard="navigateToResults" />
                  </ais-voice-search>

                  <v-btn type="button" color="primary" icon="fas fa-search" size="small" :loading="loading"
                    aria-label="Search" @click="navigateToResults(currentRefinement)">
                  </v-btn>
                </div>
              </template>
            </v-text-field>
          </div>
        </form>
      </ais-search-box>
    </ais-instant-search>
    </div>

    <template #fallback>
      <form class="search-bar" @submit.prevent="navigateToResults(fallbackQuery)">
        <div class="search-bar__row">
          <v-select v-if="indexes.length > 1" v-model="activeIndex" :items="indexes" density="comfortable"
            variant="solo-inverted" hide-details class="search-bar__index" :disabled="loading" />

          <div class="search-bar__input-wrap">
            <v-text-field v-model="fallbackQuery" type="search" placeholder="Search items, categories, or brands..."
              variant="solo-inverted" hide-details clearable :disabled="loading" class="search-bar__input"
              @keyup.enter="navigateToResults(fallbackQuery)">
              <template #append-inner>
                <v-btn type="button" color="primary" icon="fas fa-search" size="small" :loading="loading"
                  aria-label="Search" @click="navigateToResults(fallbackQuery)">
                </v-btn>
              </template>
            </v-text-field>
          </div>
        </div>
      </form>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
  import {
    computed,
    ref,
    watch
  } from 'vue'
  import voiceSearchStatus from './voiceSearchStatus.vue'

  const route = useRoute()
  const config = useRuntimeConfig()
  defineProps ({
    placeholder: {
      type: String,
      required: true,
    }
  })

  // This box only owns the text and the microphone; results are the
  // results page's. It used to run a real search (6 hits nobody saw) on
  // every page load and keystroke, so InstantSearch gets an empty answer.
  const emptyResult = { hits: [], nbHits: 0, page: 0, nbPages: 0, hitsPerPage: 0, processingTimeMS: 0, query: '', params: '', exhaustiveNbHits: true }
  const searchClient = {
    search: (requests: unknown[]) => Promise.resolve({ results: requests.map(() => emptyResult) }),
    searchForFacetValues: (requests: unknown[]) => Promise.resolve(requests.map(() => ({ facetHits: [] }))),
  }

  // On the results page the box shows what was searched for.
  const routeQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

  const indexes = computed < string[] > (() => {
    const value = (config.public).alternateSearchIndexes
    return Array.isArray(value) && value.length > 0 ? value : ['products']
  })

  const activeIndex = ref(
    typeof route.query.index === 'string' && indexes.value.includes(route.query.index) ?
    route.query.index :
    indexes.value[0] || 'products',
  )

  // A computed, not an inline object: a new object each render would make
  // InstantSearch rebuild (see resultsComponent.vue).
  const initialUiState = computed(() => ({ [activeIndex.value]: { query: routeQuery.value } }))

  // Only used by the pre-hydration fallback form below — the live widget tree
  // reads/writes its query through ais-search-box's own state instead.
  const fallbackQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')

  const loading = ref(false)

  watch(
    () => route.query,
    (nextQuery: Record < string, unknown > ) => {
      fallbackQuery.value = typeof nextQuery.q === 'string' ? nextQuery.q : ''
      if (typeof nextQuery.index === 'string' && indexes.value.includes(nextQuery.index)) {
        activeIndex.value = nextQuery.index
      }
    }, {
      deep: true
    },
  )

  function onIndexChange(value: string) {
    activeIndex.value = value
  }

  async function navigateToResults(queryText: string) {
    const normalized = queryText.trim()
    loading.value = true
    try {
      await navigateTo({
        path: '/results',
        query: {
          ...(normalized ? {
            q: normalized
          } : {}),
          index: activeIndex.value,
          page: '1',
        },
      })
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  /* This component owns its layout rather than relying on each app's global
     search.css — several of those copies hardcode 650-955px fixed/min
     widths (some with !important) on the search field, which pushed the
     input and the nav logo/menu off-screen on anything narrower than a
     wide desktop. `!important` here is deliberate: it's the only way to
     beat the `!important` in those global copies until they're removed. */
  .searchForm,
  .search-bar {
    width: 70% !important;
    min-width: 0 !important;
  }

  /* Scoped styles don't reach the native <input> Vuetify renders, so the
     placeholder rule has to be wrapped in :deep(). Without it the
     placeholder kept its default (near-white) colour and was invisible
     against the unfocused solo-inverted (white) field. opacity:1 defeats
     the browser default that dims placeholder text. */
  .search-bar__input :deep(input::placeholder) {
    color: #6b7280 !important;
    opacity: 1 !important;
  }

  .searchField,
  .search-bar__row {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    width: 100% !important;
    margin: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .search-bar__input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0 !important;
  }

  .search-bar__input,
  :deep(.mainSearch) {
    flex: 1 1 auto;
    min-width: 0 !important;
    width: auto !important;
  }

  .search-bar__index {
    flex: 0 0 auto;
    width: 140px;
    max-width: 40%;
  }

  .search-bar__actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 0 0 auto;
  }

  .voiceBtn--listening {
    animation: voice-pulse 1.2s ease-in-out infinite;
  }

  @keyframes voice-pulse {
    50% { opacity: 0.45; }
  }

  @media (prefers-reduced-motion: reduce) {
    .voiceBtn--listening { animation: none; }
  }

  :deep(.ais-VoiceSearch),
  :deep(.ais-SearchBox) {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
  }
</style>
