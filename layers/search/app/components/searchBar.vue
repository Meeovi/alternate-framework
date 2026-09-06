<template>
  <ClientOnly>
    <!-- ais-instant-search drops a `class` set directly on it (it isn't
         merged onto its rendered root), so the wrapper carries the class
         the styles below target. -->
    <div class="searchForm">
    <ais-instant-search :key="activeIndex" :search-client="searchClient" :index-name="activeIndex">
      <ais-configure :hits-per-page.camel="6" />

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
                  <ais-voice-search v-slot="{ isListening, toggleListening, isBrowserSupported }" search-as-you-speak>
                    <v-btn type="button" icon="fas fa-microphone" variant="text" size="small" :disabled="!isBrowserSupported"
                      :color="isListening ? 'primary' : undefined"
                      :title="isBrowserSupported ? 'Search by voice' : 'Voice search not supported on this browser'"
                      @click="toggleListening">
                    </v-btn>
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
  import {
    useSearchClient
  } from '../composables/useSearchClient'

  const route = useRoute()
  const config = useRuntimeConfig()
  defineProps ({
    placeholder: {
      type: String,
      required: true,
    }
  })

  const {
    searchClient
  } = useSearchClient()

  const indexes = computed < string[] > (() => {
    const value = (config.public).alternateSearchIndexes
    return Array.isArray(value) && value.length > 0 ? value : ['products']
  })

  const activeIndex = ref(
    typeof route.query.index === 'string' && indexes.value.includes(route.query.index) ?
    route.query.index :
    indexes.value[0] || 'products',
  )

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
    width: 100% !important;
    min-width: 0 !important;
  }

  .searchField,
  .search-bar__row {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    width: 100% !important;
    min-width: 0 !important;
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

  :deep(.ais-VoiceSearch),
  :deep(.ais-SearchBox) {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
  }
</style>
