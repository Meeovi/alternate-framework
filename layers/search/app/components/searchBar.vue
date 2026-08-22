<template>
  <ClientOnly>
    <ais-instant-search class="searchForm" :key="activeIndex" :search-client="searchClient" :index-name="activeIndex">
      <ais-configure :hits-per-page.camel="6" />

      <ais-search-box v-slot="{ currentRefinement, refine }">
        <form class="searchField" @submit.prevent="navigateToResults(currentRefinement)">
          <v-select v-if="indexes.length > 1" :model-value="activeIndex" :items="indexes" density="comfortable"
            variant="solo-inverted" hide-details class="search-bar__index" @update:model-value="onIndexChange" />

          <div class="search-bar__input-wrap">
            <v-text-field :model-value="currentRefinement" type="search"
              placeholder="Search items, categories, or brands..." variant="solo-inverted" hide-details clearable
              :disabled="loading" class="search-bar__input"
              @update:model-value="(value: string) => refine(value ?? '')">
              <template #append-inner>
                <div class="search-bar__actions">
                  <ais-voice-search v-slot="{ isListening, toggleListening, isBrowserSupported }" search-as-you-speak>
                    <v-btn icon="fas fa-microphone" variant="text" size="small" :disabled="!isBrowserSupported"
                      :color="isListening ? 'primary' : undefined"
                      :title="isBrowserSupported ? 'Search by voice' : 'Voice search not supported on this browser'"
                      @click="toggleListening">
                    </v-btn>
                  </ais-voice-search>

                  <v-btn type="submit" color="primary" icon="fas fa-search" size="small" :loading="loading"
                    aria-label="Search">
                  </v-btn>
                </div>
              </template>
            </v-text-field>
          </div>
        </form>
      </ais-search-box>
    </ais-instant-search>

    <template #fallback>
      <form class="search-bar" @submit.prevent="navigateToResults(fallbackQuery)">
        <div class="search-bar__row">
          <v-select v-if="indexes.length > 1" v-model="activeIndex" :items="indexes" density="comfortable"
            variant="solo-inverted" hide-details class="search-bar__index" :disabled="loading" />

          <div class="search-bar__input-wrap">
            <v-text-field v-model="fallbackQuery" type="search" placeholder="Search items, categories, or brands..."
              variant="solo-inverted" hide-details clearable :disabled="loading" class="search-bar__input">
              <template #append-inner>
                <v-btn type="submit" color="primary" icon="fas fa-search" size="small" :loading="loading"
                  aria-label="Search">
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
