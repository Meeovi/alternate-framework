/**
 * useProducts Composable - Mesh Bridge
 *
 * Fetches products from the Magento adapter through the mesh.
 * Falls back to legacy provider if mesh is unavailable.
 */

import { toRefs } from '@vueuse/shared'
import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useState } from 'nuxt/app'
import { useHandleError } from './useHandleError'
import type { Maybe, SfProduct, SfDiscountablePrice, SfMoney, SfImage } from './models'

interface UseProductsState {
  data: Maybe<SfProduct[]>
  loading: boolean
}

interface ProductsApiResponse {
  items: Array<{
    id: string
    sku: string
    name: string
    typeId: string
    description?: string
    shortDescription?: string
    price: { value: number; currency: string }
    regularPrice: { value: number; currency: string }
    discount?: { percent_off: number }
    image?: { url: string; label: string }
    stockStatus: string
    reviewCount?: number
    ratingSummary?: number
  }>
  pageInfo: {
    page_size: number
    current_page: number
    total_pages: number
  }
  totalCount: number
}

export function useProductsMesh() {
  const state = useState<UseProductsState>('products-mesh', () => ({
    data: null,
    loading: false,
  }))

  const fetchProducts = async (pageSize = 20, currentPage = 1) => {
    state.value.loading = true
    try {
      // Call the server API route which has access to the mesh
      const response = await $fetch<ProductsApiResponse>('/api/commerce/products', {
        method: 'GET',
        query: {
          pageSize: String(pageSize),
          currentPage: String(currentPage),
        },
      })

      // Map API response to SfProduct
      const products = (response?.items || []).map((item): SfProduct => {
        // Create a slug from the product name or ID
        const slug = (item.name || item.id).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

        // Create money objects for the price
        const price: SfMoney = {
          currency: item.price?.currency || 'USD',
          amount: item.price?.value || 0,
          precisionAmount: String(item.price?.value || 0),
        }

        const regularPrice: SfMoney = {
          currency: item.regularPrice?.currency || 'USD',
          amount: item.regularPrice?.value || 0,
          precisionAmount: String(item.regularPrice?.value || 0),
        }

        // Determine if discounted
        const isDiscounted = Math.abs((price.amount || 0) - (regularPrice.amount || 0)) > 0.01

        const discountablePrice: SfDiscountablePrice = {
          isDiscounted,
          regularPrice,
          value: price,
        }

        // Create primary image and gallery
        const primaryImage: Maybe<SfImage> = item.image
          ? {
              url: item.image.url,
              alt: item.image.label || null,
            }
          : null

        return {
          id: item.id,
          sku: item.sku || null,
          name: item.name || null,
          slug,
          description: item.description || null,
          price: discountablePrice,
          primaryImage,
          gallery: primaryImage ? [primaryImage] : [],
          rating:
            item.ratingSummary && item.reviewCount
              ? {
                  average: item.ratingSummary,
                  count: item.reviewCount,
                }
              : null,
          variants: [],
          attributes: [],
          quantityLimit: null,
        }
      })

      state.value.data = products
      return computed(() => state.value.data) as unknown as Ref<Maybe<SfProduct[]>>
    } catch (error) {
      useHandleError(error)
      state.value.data = null
      throw error
    } finally {
      state.value.loading = false
    }
  }

  return {
    fetchProducts,
    ...toRefs(state.value),
  }
}

export default useProductsMesh
