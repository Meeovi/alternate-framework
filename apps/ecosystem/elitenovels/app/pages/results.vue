<template>
  <div class="resultsPage">
    <v-card elevation="0" style="min-height: 100% !important;">
      <v-toolbar color="transparent" flat>
        <v-toolbar-title style="text-align: center;">
          <template v-if="searchQuery">Search Results for "{{ searchQuery }}"</template>
          <template v-else>Search</template>
        </v-toolbar-title>
      </v-toolbar>

      <v-tabs class="searchSection" center-active v-model="tab" bg-color="transparent">
        <v-tab value="all">All Results</v-tab>
        <v-tab v-for="(menu, index) in searchbar?.menus" :key="index"><a :href="menu?.url">{{ menu?.name }}</a></v-tab>
      </v-tabs>

      <v-card-text>
        <v-text-field v-model="input" class="mb-4" clearable hide-details variant="outlined"
          placeholder="Search characters, abilities, places, stories…" prepend-inner-icon="fas fa-search"
          @keydown.enter="submit" />

        <div v-if="types.length > 1" class="mb-4">
          <v-chip-group v-model="typeFilter" selected-class="text-primary" mandatory>
            <v-chip value="all" filter>All ({{ results.length }})</v-chip>
            <v-chip v-for="t in types" :key="t.type" :value="t.type" filter class="text-capitalize">
              {{ t.label }} ({{ t.count }})
            </v-chip>
          </v-chip-group>
        </div>

        <div v-if="pending && !results.length" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate />
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal">Search is unavailable right now. Please try again.</v-alert>

        <template v-else-if="visible.length">
          <v-row>
            <v-col cols="12" sm="6" md="4" lg="3" v-for="hit in visible" :key="hit.objectID">
              <v-card :to="hit.path" height="100%" class="d-flex flex-column">
                <v-img v-if="imageSrc(hit)" :src="imageSrc(hit)" height="180" cover />
                <v-card-item>
                  <v-chip size="x-small" variant="tonal" class="text-capitalize mb-2">{{ typeLabel(hit.type) }}</v-chip>
                  <v-card-title class="text-wrap">{{ hit.title }}</v-card-title>
                </v-card-item>
                <v-card-text v-if="snippet(hit)">{{ snippet(hit) }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div v-if="hasMore" class="text-center mt-6">
            <v-btn variant="outlined" :loading="loadingMore" @click="loadMore">Load more</v-btn>
          </div>
        </template>

        <p v-else-if="searchQuery">No results found.</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'

  // Site search via layers/search's /api/search, which queries the novels
  // Directus live (characters, facets, stories, categories, pages — see
  // searchProviders.directus in nuxt.config.ts).
  const PAGE_SIZE = 24
  const TYPE_LABELS = { character: 'Characters', facet: 'Abilities, places & more', story: 'Stories', category: 'Categories', page: 'Pages' }

  const route = useRoute()
  const { $directus, $readItem } = useNuxtApp()

  const tab = ref('all')
  const searchQuery = computed(() => String(route.query.q ?? '').trim())
  const input = ref(searchQuery.value)
  const typeFilter = ref('all')

  async function fetchPage(q, page) {
    const res = await $fetch('/api/search', { query: { q, page, pageSize: PAGE_SIZE } })
    return res?.items ?? []
  }

  // First page: server-rendered and hydrated from the payload.
  const { data: firstPage, pending, error } = await useAsyncData(
    () => `search-results:${searchQuery.value}`,
    () => (searchQuery.value ? fetchPage(searchQuery.value, 1) : Promise.resolve([])),
    { watch: [searchQuery], default: () => [] }
  )

  // Further pages ("Load more"), client-side only.
  const morePages = ref([])
  const page = ref(1)
  const loadingMore = ref(false)
  const lastPageSize = ref(null)

  watch(searchQuery, (q) => {
    input.value = q
    typeFilter.value = 'all'
    morePages.value = []
    page.value = 1
    lastPageSize.value = null
  })

  const results = computed(() => [...(firstPage.value ?? []), ...morePages.value])
  const hasMore = computed(() => (lastPageSize.value ?? firstPage.value?.length ?? 0) === PAGE_SIZE)

  async function loadMore() {
    loadingMore.value = true
    try {
      const items = await fetchPage(searchQuery.value, page.value + 1)
      page.value += 1
      morePages.value = [...morePages.value, ...items]
      lastPageSize.value = items.length
    } finally {
      loadingMore.value = false
    }
  }

  const types = computed(() => {
    const counts = new Map()
    for (const hit of results.value) counts.set(hit.type, (counts.get(hit.type) ?? 0) + 1)
    return [...counts].map(([type, count]) => ({ type, count, label: TYPE_LABELS[type] ?? type }))
  })

  const visible = computed(() => typeFilter.value === 'all'
    ? results.value
    : results.value.filter((hit) => hit.type === typeFilter.value))

  function typeLabel(type) {
    return ({ character: 'Character', facet: 'Facet', story: 'Story', category: 'Category', page: 'Page' })[type] ?? type
  }

  function imageSrc(hit) {
    const image = hit.image
    const file = typeof image === 'string' ? image : image?.filename_disk || image?.id
    return file && $directus?.url ? `${$directus.url}assets/${file}` : null
  }

  function snippet(hit) {
    const text = String(hit.description ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return text.length > 160 ? `${text.slice(0, 157)}…` : text
  }

  function submit() {
    const q = input.value?.trim()
    if (q) navigateTo({ path: '/results', query: { q } })
  }

  const { data: searchbar } = useLazyAsyncData('searchbar', () => {
    return $directus.request($readItem('navigation', '27'))
  })

  useHead({
    title: () => searchQuery.value ? `Search: ${searchQuery.value}` : 'Search Results'
  })
</script>
