// layers/commerce/app/composables/catalog/products/useProduct.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { CommerceProductClient, Product } from '../../../types/products'

/**
 * Single-product composable. Consolidates per-product fetching by id / sku /
 * slug and exposes a reactive `product` ref plus related-product helpers.
 */
export function useProduct() {
  const client = getCommerceClient() as CommerceProductClient
  const product = ref<Product | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchProductById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      product.value = await client.getProductById(id)
    } catch (err) {
      error.value = err as Error
      product.value = null
    } finally {
      isLoading.value = false
    }
    return product.value
  }

  async function fetchProductBySku(sku: string) {
    isLoading.value = true
    error.value = null
    try {
      product.value = await client.getProductBySku(sku)
    } catch (err) {
      error.value = err as Error
      product.value = null
    } finally {
      isLoading.value = false
    }
    return product.value
  }

  async function fetchProductBySlug(slug: string) {
    isLoading.value = true
    error.value = null
    try {
      product.value = await client.getProductBySlug(slug)
    } catch (err) {
      error.value = err as Error
      product.value = null
    } finally {
      isLoading.value = false
    }
    return product.value
  }

  return {
    product,
    isLoading,
    error,
    fetchProductById,
    fetchProductBySku,
    fetchProductBySlug,
  }
}

export default useProduct
