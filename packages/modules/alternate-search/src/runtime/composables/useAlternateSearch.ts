// modules/alternate-search/runtime/composables/useAlternateSearch.ts
import {
  useRoute,
  useRouter,
  useRuntimeConfig,
  useAsyncData
} from '#imports'

import {
  getPrice,
  getTitle,
  normalizeText,
  sortItems,
  matchesPriceBand,
  deriveOptionsFromItems,
  facetToOptions,
  priceBandsFor
} from '../utils'

export function useAlternateSearch() {
  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  const searchClientUrl = computed(() => {
    const url = config.public.alternateSearchClientUrl
    return typeof url === 'string' && url.trim() ? url : '/api/search'
  })

  const indexes = computed(() => {
    const value = config.public.alternateSearchIndexes
    return Array.isArray(value) && value.length > 0 ? value : ['products']
  })

  const searchQuery = computed(() =>
    typeof route.query.q === 'string' ? route.query.q.trim() : ''
  )

  const activeIndex = computed(() => {
    const requested = typeof route.query.index === 'string' ? route.query.index : ''
    return requested || indexes.value[0]
  })

  const page = computed(() => {
    const value = Number(route.query.page || 1)
    return Number.isFinite(value) && value > 0 ? value : 1
  })

  const requestedPageSize = 12
  const sortBy = ref(typeof route.query.sort === 'string' ? route.query.sort : 'relevance')

  const selectedCategories = ref(toArrayQuery(route.query.categories))
  const selectedBrands = ref(toArrayQuery(route.query.brands))
  const selectedPriceBand = ref(typeof route.query.price === 'string' ? route.query.price : '')

  const editableQuery = ref(searchQuery.value)
  const editableIndex = ref(activeIndex.value)

  const { data, pending, error } = useAsyncData(
    () => `search:${activeIndex.value}:${searchQuery.value}:${page.value}`,
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

      return await $fetch(`${searchClientUrl.value}/${activeIndex.value}`, {
        query: {
          q: searchQuery.value,
          page: page.value,
          pageSize: requestedPageSize
        }
      })
    },
    {
      watch: [searchQuery, activeIndex, page],
      default: () => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: requestedPageSize,
        facets: []
      })
    }
  )

  const items = computed(() => {
    const list = Array.isArray(data.value?.items) ? data.value.items : []
    return sortItems(list, sortBy.value)
  })

  const total = computed(() => Number(data.value?.total || 0))

  const effectivePageSize = computed(() => {
    const value = Number(data.value?.pageSize)
    return Number.isFinite(value) && value > 0 ? value : requestedPageSize
  })

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(total.value / effectivePageSize.value))
  )

  const categoryOptions = computed(() => {
    const fromFacet = facetToOptions(data.value?.facets, 'category')
    if (fromFacet.length) return fromFacet
    return deriveOptionsFromItems(items.value, 'category')
  })

  const brandOptions = computed(() => {
    const fromFacet = facetToOptions(data.value?.facets, 'brand')
    if (fromFacet.length) return fromFacet
    return deriveOptionsFromItems(items.value, 'brand')
  })

  const priceBands = computed(() => priceBandsFor(items.value))

  const visibleItems = computed(() => {
    return items.value.filter(item => {
      const category = normalizeText(item.category)
      const brand = normalizeText(item.brand)
      const price = getPrice(item)

      const categoryPass =
        !selectedCategories.value.length || selectedCategories.value.includes(category)

      const brandPass =
        !selectedBrands.value.length || selectedBrands.value.includes(brand)

      const pricePass = matchesPriceBand(price, selectedPriceBand.value)

      return categoryPass && brandPass && pricePass
    })
  })

  async function navigateWithState(targetPage: number) {
    const query: Record<string, any> = {
      ...(editableQuery.value.trim() ? { q: editableQuery.value.trim() } : {}),
      index: editableIndex.value,
      page: String(targetPage),
      ...(selectedCategories.value.length ? { categories: selectedCategories.value.join(',') } : {}),
      ...(selectedBrands.value.length ? { brands: selectedBrands.value.join(',') } : {}),
      ...(selectedPriceBand.value ? { price: selectedPriceBand.value } : {}),
      ...(sortBy.value !== 'relevance' ? { sort: sortBy.value } : {})
    }

    await router.push({ path: '/results', query })
  }

  return {
    // state
    searchQuery,
    activeIndex,
    page,
    sortBy,
    selectedCategories,
    selectedBrands,
    selectedPriceBand,
    editableQuery,
    editableIndex,

    // data
    data,
    items,
    visibleItems,
    total,
    pageCount,
    categoryOptions,
    brandOptions,
    priceBands,
    pending,
    error,

    // actions
    navigateWithState
  }
}

function toArrayQuery(value: unknown): string[] {
  if (typeof value !== 'string' || !value.trim()) return []
  return value.split(',').map(v => v.trim()).filter(Boolean)
}
