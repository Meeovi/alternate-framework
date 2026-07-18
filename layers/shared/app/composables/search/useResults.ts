// composables/useResults.ts
export type SearchResponse = {
  items?: Array<Record<string, any>>
  total?: number
  page?: number
  pageSize?: number
  facets?: any
}

export function useResults() {
  const route = useRoute()
  const config = useRuntimeConfig()

  // 1. Core State & Computed Endpoints
  const searchClientUrl = computed(() => {
    const url = config.public.alternateSearchClientUrl
    return typeof url === 'string' && url.trim() ? url : '/api/search'
  })

  const indexes = computed(() => {
    const value = config.public.alternateSearchIndexes
    return Array.isArray(value) && value.length > 0 ? value : ['products']
  })

  const searchQuery = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')
  const activeIndex = computed(() => {
    const requested = typeof route.query.index === 'string' ? route.query.index : ''
    return requested || indexes.value[0] || 'products'
  })
  
  const page = computed(() => {
    const value = Number(route.query.page || 1)
    return Number.isFinite(value) && value > 0 ? value : 1
  })

  const requestedPageSize = 12
  const sortBy = ref(typeof route.query.sort === 'string' ? route.query.sort : 'relevance')
  const selectedCategories = ref<string[]>(toArrayQuery(route.query.categories))
  const selectedBrands = ref<string[]>(toArrayQuery(route.query.brands))
  const selectedPriceBand = ref<string>(typeof route.query.price === 'string' ? route.query.price : '')
  const mobileFiltersOpen = ref(false)
  const tab = ref('one')

  const editableQuery = ref(searchQuery.value)
  const editableIndex = ref(activeIndex.value)

  // 2. State Sync Syncing Watches
  watch([searchQuery, activeIndex], ([nextQuery, nextIndex]) => {
    editableQuery.value = nextQuery
    editableIndex.value = nextIndex
  })

  watch(
    () => route.query,
    (query) => {
      selectedCategories.value = toArrayQuery(query.categories)
      selectedBrands.value = toArrayQuery(query.brands)
      selectedPriceBand.value = typeof query.price === 'string' ? query.price : ''
      sortBy.value = typeof query.sort === 'string' ? query.sort : 'relevance'
    },
  )

  // 3. Main Data Fetching 
  // Pointing seamlessly to the dynamic /api/search routes utilizing our new helper utilities
  const { data, pending, error } = useAsyncData<SearchResponse>(
    `search:${activeIndex.value}:${searchQuery.value}:${page.value}`,
    async () => {
      if (!searchQuery.value) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: requestedPageSize,
          facets: []
        }
      }

      // OpenSearch-backed search endpoint accepts POST with JSON body
      return await $fetch<SearchResponse>(searchClientUrl.value, {
        method: 'POST',
        body: {
          q: searchQuery.value,
          page: page.value,
          pageSize: requestedPageSize,
        },
      })
    }, {
      watch: [searchQuery, activeIndex, page],
      default: () => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: requestedPageSize,
        facets: []
      }),
    }
  )

  // 4. Transformative Computed Collections
  const items = computed(() => {
    const list = Array.isArray(data.value?.items) ? data.value.items : []
    return sortItems(list, sortBy.value)
  })

  const total = computed(() => Number(data.value?.total || 0))
  
  const effectivePageSize = computed(() => {
    const value = Number(data.value?.pageSize)
    return Number.isFinite(value) && value > 0 ? value : requestedPageSize
  })

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / effectivePageSize.value)))
  const facets = computed(() => data.value?.facets)

  const categoryOptions = computed(() => {
    const fromFacet = facetToOptions(facets.value, 'category')
    if (fromFacet.length) return fromFacet
    return deriveOptionsFromItems(items.value, 'category')
  })

  const brandOptions = computed(() => {
    const fromFacet = facetToOptions(facets.value, 'brand')
    if (fromFacet.length) return fromFacet
    return deriveOptionsFromItems(items.value, 'brand')
  })

  const priceBands = computed(() => {
    const bands = [
      { id: '0-25', min: 0, max: 25, label: 'Under $25' },
      { id: '25-50', min: 25, max: 50, label: '$25 to $50' },
      { id: '50-100', min: 50, max: 100, label: '$50 to $100' },
      { id: '100+', min: 100, max: Number.POSITIVE_INFINITY, label: '$100 & above' },
    ]

    return bands
      .map((band) => ({
        ...band,
        count: items.value.filter((item) => {
          const price = getPrice(item)
          if (price === null) return false
          if (band.max === Number.POSITIVE_INFINITY) return price >= band.min
          return price >= band.min && price < band.max
        }).length,
      }))
      .filter((band) => band.count > 0)
  })

  const visibleItems = computed(() => {
    return items.value.filter((item) => {
      const category = normalizeText(item.category)
      const brand = normalizeText(item.brand)
      const price = getPrice(item)

      const categoryPass = !selectedCategories.value.length || selectedCategories.value.includes(category)
      const brandPass = !selectedBrands.value.length || selectedBrands.value.includes(brand)
      const pricePass = matchesPriceBand(price, selectedPriceBand.value)

      return categoryPass && brandPass && pricePass
    })
  })

  const totalLabel = computed(() => {
    if (!searchQuery.value) return 'Enter a query to search the demo dataset.'
    return `${total.value} result${total.value === 1 ? '' : 's'} across ${pageCount.value} page${pageCount.value === 1 ? '' : 's'}`
  })

  const emptyMessage = computed(() => {
    if (!searchQuery.value) {
      return 'Use the search box above to query the seeded in-memory records or your configured backend.'
    }
    if (selectedCategories.value.length || selectedBrands.value.length || selectedPriceBand.value) {
      return 'No matches for the active filter combination. Try clearing one or more filters.'
    }
    return `No matches were found for "${searchQuery.value}".`
  })

  // 5. Navigation Operations
  async function changePage(nextPage: number) {
    await navigateWithState(nextPage)
  }

  async function applyFilters() {
    await navigateWithState(1)
  }

  async function clearAllFilters() {
    selectedCategories.value = []
    selectedBrands.value = []
    selectedPriceBand.value = ''
    sortBy.value = 'relevance'
    await navigateWithState(1)
  }

  async function navigateWithState(targetPage: number) {
    const query = {
      ...(editableQuery.value.trim() ? { q: editableQuery.value.trim() } : {}),
      index: editableIndex.value,
      page: String(targetPage),
      ...(selectedCategories.value.length ? { categories: selectedCategories.value.join(',') } : {}),
      ...(selectedBrands.value.length ? { brands: selectedBrands.value.join(',') } : {}),
      ...(selectedPriceBand.value ? { price: selectedPriceBand.value } : {}),
      ...(sortBy.value !== 'relevance' ? { sort: sortBy.value } : {}),
    }

    await navigateTo({ path: '/results', query })
  }

  // 6. Utility Extractors & Parsing Parsers
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

  function normalizeText(value: unknown): string {
    return String(value || '').trim()
  }

  function toArrayQuery(value: unknown): string[] {
    if (typeof value !== 'string' || !value.trim()) return []
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }

  function sortItems(source: Array<Record<string, any>>, sort: string): Array<Record<string, any>> {
    const itemsCopy = [...source]
    if (sort === 'price-asc') {
      return itemsCopy.sort((a, b) => (getPrice(a) ?? Number.POSITIVE_INFINITY) - (getPrice(b) ?? Number.POSITIVE_INFINITY))
    }
    if (sort === 'price-desc') {
      return itemsCopy.sort((a, b) => (getPrice(b) ?? 0) - (getPrice(a) ?? 0))
    }
    if (sort === 'title-asc') {
      return itemsCopy.sort((a, b) => getTitle(a).localeCompare(getTitle(b)))
    }
    return itemsCopy
  }

  function matchesPriceBand(price: number | null, band: string): boolean {
    if (!price || !band) return true
    if (price === null) return false
    if (band === '0-25') return price < 25
    if (band === '25-50') return price >= 25 && price < 50
    if (band === '50-100') return price >= 50 && price < 100
    if (band === '100+') return price >= 100
    return true
  }

  function deriveOptionsFromItems(itemsList: Array<Record<string, any>>, field: string) {
    const counts = new Map<string, number>()
    for (const item of itemsList) {
      const key = normalizeText(item[field])
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  }

  function facetToOptions(rawFacets: any, field: string): Array<{ value: string; count: number }> {
    if (!rawFacets) return []
    const objectFacet = rawFacets?.[field]
    if (objectFacet && typeof objectFacet === 'object' && !Array.isArray(objectFacet)) {
      return Object.entries(objectFacet)
        .map(([value, count]) => ({ value, count: Number(count || 0) }))
        .filter((entry) => entry.value && entry.count > 0)
        .sort((a, b) => b.count - a.count)
    }
    const arrayFacet = Array.isArray(rawFacets) ? rawFacets.find((entry) => entry?.field === field) : null
    const buckets = arrayFacet?.buckets
    if (Array.isArray(buckets)) {
      return buckets
        .map((entry) => ({ value: normalizeText(entry?.value), count: Number(entry?.count || 0) }))
        .filter((entry) => entry.value && entry.count > 0)
        .sort((a, b) => b.count - a.count)
    }
    return []
  }

  return {
    searchQuery,
    activeIndex,
    page,
    sortBy,
    selectedCategories,
    selectedBrands,
    selectedPriceBand,
    mobileFiltersOpen,
    tab,
    pending,
    error,
    visibleItems,
    pageCount,
    categoryOptions,
    brandOptions,
    priceBands,
    totalLabel,
    emptyMessage,
    changePage,
    applyFilters,
    clearAllFilters,
    getTitle,
    getDescription,
    getPrice,
    getLink,
    formatPrice
  }
}