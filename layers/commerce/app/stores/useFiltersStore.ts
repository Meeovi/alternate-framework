import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('filters', () => {
  const search = ref('')
  const category = ref<string | null>(null)
  const sort = ref<'price-asc' | 'price-desc' | 'newest'>('newest')
  const priceRange = ref<[number, number] | null>(null)

  return { search, category, sort, priceRange }
})
