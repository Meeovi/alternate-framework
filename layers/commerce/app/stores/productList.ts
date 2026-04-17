import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Product as DomainProduct } from '../types/domain'
import { useProducts } from '../composables/catalog/products'

export const useProductListStore = defineStore('productList', () => {
  const items = ref<DomainProduct[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { getProducts } = useProducts()

  const fetch = async (options: any = {}) => {
    loading.value = true
    error.value = null
    try {
      items.value = await getProducts(options)
    } catch (err: any) {
      error.value = err?.message ?? String(err)
      console.error('Error fetching product list:', err)
    } finally {
      loading.value = false
    }
  }

  const count = computed(() => items.value.length)

  return {
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    count,
    fetch,
  }
})
