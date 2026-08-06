<template>
    <ClientOnly>
        <ais-instant-search v-if="mounted" ref="instantSearchRef" :search-client="searchClient"
            :index-name="activeIndex" class="search-bar">
            <div class="search-bar__row">
                <ais-autocomplete class="search-bar__autocomplete">
                    <template #default="{ currentRefinement, refine, indices }">
                        <div class="search-bar__autocomplete-wrapper">
                            <ais-search-box ref="searchBoxRef" placeholder="Search items, categories, or brands..."
                                :current-refinement="currentRefinement"
                                @input="refine"
                                show-loading-indicator class-names="{
                    root: 'ais-SearchBox search-bar__search-box',
                    input: 'ais-SearchBox-input search-bar__search-input',
                    submit: 'ais-SearchBox-submit search-bar__search-submit',
                    reset: 'ais-SearchBox-reset search-bar__search-reset',
                    loadingIndicator: 'ais-SearchBox-loadingIndicator'
                  }" />

                            <ais-voice-search class="search-bar__voice-search" />
                        </div>
                    </template>
                </ais-autocomplete>

                <v-select v-if="indexes.length > 1" v-model="activeIndex" :items="indexes" density="comfortable"
                    variant="solo-inverted" hide-details class="search-bar__index"
                    @update:model-value="onIndexChange" />
            </div>

            <ais-stats class="search-bar__stats">
                <template #default="{ nbHits }">
                    <span v-if="nbHits > 0" class="search-bar__stats-text">
                        {{ nbHits }} results
                    </span>
                </template>
            </ais-stats>

            <ais-feeds class="search-bar__feeds" />
        </ais-instant-search>

        <template #fallback>
            <form class="search-bar" @submit.prevent="submitSearch">
                <div class="search-bar__row">
                    <v-col v-if="indexes.length > 1" cols="auto" class="search-bar__index-col">
                        <v-select v-model="activeIndex" :items="indexes" density="comfortable" variant="solo-inverted"
                            hide-details class="search-bar__index" :disabled="loading" />
                    </v-col>
                    <v-text-field v-model="query" type="search" placeholder="Search items, categories, or brands..."
                        variant="solo-inverted" append-inner-icon="fas fa-search" hide-details clearable
                        :disabled="loading" @click:append-inner="submitSearch" />
                </div>
            </form>
        </template>
    </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { useSearchClient } from '../composables/useSearchClient'

const route = useRoute()
const config = useRuntimeConfig()

const { searchClient } = useSearchClient()

const indexes = computed < string[] > (() => {
    const value = config.public.alternateSearchIndexes
    return Array.isArray(value) && value.length > 0 ? value : ['products']
})

const activeIndex = ref(
    typeof route.query.index === 'string' && indexes.value.includes(route.query.index) ?
    route.query.index :
    indexes.value[0] || 'products'
)

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const loading = ref(false)
const mounted = ref(false)
const searchBoxRef = ref(null)
const instantSearchRef = ref(null)

onMounted(() => {
    mounted.value = true

    nextTick(() => {
        const form = searchBoxRef.value?.$el?.querySelector('form') || searchBoxRef.value?.$el
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault()
                const input = form.querySelector('input')
                const searchQuery = input?.value?.trim() || query.value.trim()
                if (searchQuery) {
                    navigateTo({
                        path: '/results',
                        query: {
                            q: searchQuery,
                            index: activeIndex.value,
                            page: '1',
                        },
                    })
                }
            })
        }
    })
})

watch(
    () => route.query,
    (nextQuery) => {
        query.value = typeof nextQuery.q === 'string' ? nextQuery.q : ''
        if (typeof nextQuery.index === 'string' && indexes.value.includes(nextQuery.index)) {
            activeIndex.value = nextQuery.index
        }
    }, {
        deep: true
    }
)

function onIndexChange(value: string) {
    activeIndex.value = value
}

async function submitSearch() {
    const normalized = query.value.trim()
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
.search-bar__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 720px;
    margin: 0 auto;
}

.search-bar__autocomplete {
    flex: 1 1 auto;
}

.search-bar__autocomplete-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1 1 auto;
}

.search-bar__voice-search {
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

/* InstantSearch search-box overrides to blend with Vuetify */
.search-bar__search-box {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    border-radius: 4px;
    background: rgb(var(--v-theme-surface));
    min-height: 56px;
    padding: 0 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar__search-box:focus-within {
    border-color: rgb(var(--v-theme-primary)) !important;
    box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.search-bar__search-input {
    flex: 1;
    border: none !important;
    outline: none !important;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    font-size: 1rem;
    padding: 8px 0;
    min-width: 0;
}

.search-bar__search-input::placeholder {
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.search-bar__search-submit,
.search-bar__search-reset {
    background: transparent;
    border: none;
    cursor: pointer;
    color: rgba(var(--v-theme-on-surface), 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    margin-left: 8px;
}

.search-bar__search-submit:hover,
.search-bar__search-reset:hover {
    color: rgb(var(--v-theme-primary));
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

.search-bar__feeds {
    max-width: 720px;
    margin: 0.5rem auto 0;
    padding: 0;
}

.search-bar :deep(.ais-SearchBox-loadingIndicator) {
    margin-left: 8px;
}

.search-bar :deep(.ais-SearchBox-loadingIndicator svg) {
    width: 16px;
    height: 16px;
}
</style>
