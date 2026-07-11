// layers/commerce/app/composables/catalog/products/useProducts.ts
import { ref, computed, toRefs } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import { useState } from '#app'
import type {
  CommerceProductClient,
  Product,
  ProductSearchParams,
  Paginated,
} from '../../../types/products'

/**
 * Consolidated products composable.
 *
 * Replaces the spread-out `useProducts/` directory (useBestSellingProducts,
 * useNewestProducts, useProductRecommended, useProductAttribute, useProductVideos,
 * useProducts, featured-products, *.config). All product-listing logic now lives
 * here and is driven by the typed `CommerceProductClient` contract.
 */
export function useProducts() {
  const client = getCommerceClient() as CommerceProductClient

  const state = useState<{
    data: Paginated<Product> | null
    loading: boolean
    error: Error | null
  }>('commerce:products', () => ({ data: null, loading: false, error: null }))

  async function fetchProducts(params?: ProductSearchParams): Promise<Readonly<typeof state.value.data>> {
    state.value.loading = true
    state.value.error = null
    try {
      const response = await client.getProducts(params)
      state.value.data = response ?? null
    } catch (err) {
      state.value.error = err as Error
      state.value.data = null
    } finally {
      state.value.loading = false
    }
    return computed(() => state.value.data) as unknown as Readonly<typeof state.value.data>
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
      const found = await Promise.all(ids.map((id) => client.getProductById(id)))
      const items = found.filter((p): p is Product => Boolean(p))
      state.value.data = { items, total: items.length, page: 1, pageSize: items.length, totalPages: 1 }
      return items
    } finally {
      state.value.loading = false
    }
  }

  async function fetchRecommended(slug: string) {
    return fetchProducts({ sku: slug, sort: 'recommended' })
  }

  async function fetchBestSelling(params?: ProductSearchParams) {
    return fetchProducts({ ...params, sort: 'best_selling' })
  }

  async function fetchNewest(params?: ProductSearchParams) {
    return fetchProducts({ ...params, sort: 'newest' })
  }

  async function fetchRelated(id: string) {
    return fetchProducts({ filter: { relatedId: id } })
  }

  const products = computed<Product[]>(() => state.value.data?.items ?? [])
  const totalProducts = computed<number>(() => state.value.data?.total ?? 0)

  return {
    ...toRefs(state.value),
    products,
    totalProducts,
    fetchProducts,
    fetchProductById,
    fetchProductBySku,
    fetchProductBySlug,
    searchProducts,
    fetchProductsByIds,
    fetchRecommended,
    fetchBestSelling,
    fetchNewest,
    fetchRelated,
  }
}

export default useProducts
