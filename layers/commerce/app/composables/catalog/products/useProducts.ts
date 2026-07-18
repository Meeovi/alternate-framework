import { ref, computed } from 'vue'
import { useState } from 'nuxt/app'
import { getCommerceClient } from '../../../utils/client'
import type {
  CommerceProductClient,
  Product,
  ProductSearchParams,
  Paginated,
} from '../../../types/products'

export function useProducts() {
  const client = getCommerceClient() as CommerceProductClient

  const state = useState<{
    data: Paginated<Product> | null
    loading: boolean
    error: string | null
  }>('commerce:products', () => ({
    data: null,
    loading: false,
    error: null,
  }))

  async function fetchProducts(params?: ProductSearchParams): Promise<Paginated<Product> | null> {
    state.value.loading = true
    state.value.error = null

    try {
      const response = await client.getProducts(params)
      state.value.data = response ?? null
      return state.value.data
    } catch (err) {
      state.value.error = (err as Error)?.message || 'Failed to fetch products'
      state.value.data = null
      return null
    } finally {
      state.value.loading = false
    }
  }

  async function fetchProductById(id: string) {
    state.value.loading = true
    try {
      return await client.getProductById(id)
    } finally {
      state.value.loading = false
    }
  }

  async function fetchProductBySku(sku: string) {
    state.value.loading = true
    try {
      return await client.getProductBySku(sku)
    } finally {
      state.value.loading = false
    }
  }

  async function fetchProductBySlug(slug: string) {
    state.value.loading = true
    try {
      return await client.getProductBySlug(slug)
    } finally {
      state.value.loading = false
    }
  }

  async function searchProducts(params?: ProductSearchParams) {
    return fetchProducts(params)
  }

  async function fetchProductsByIds(ids: string[]) {
    state.value.loading = true
    try {
      const found = await Promise.all(ids.map(id => client.getProductById(id)))
      const items = found.filter((p): p is Product => Boolean(p))

      state.value.data = {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
      }

      return items
    } finally {
      state.value.loading = false
    }
  }

  const products = computed<Product[]>(() => state.value.data?.items ?? [])
  const totalProducts = computed<number>(() => state.value.data?.total ?? 0)

  return {
    ...state.value,
    products,
    totalProducts,
    fetchProducts,
    fetchProductById,
    fetchProductBySku,
    fetchProductBySlug,
    searchProducts,
    fetchProductsByIds,
  }
}

export default useProducts
