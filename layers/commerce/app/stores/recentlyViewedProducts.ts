import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import { getCommerceClient } from '../utils/client'
import type { Product } from '../types/commerce.type'

export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
  const ids = ref<string[]>([])
  const items = ref<Product[]>([])
  const isLoading = ref(false)

  const addViewed = (productId: string) => {
    if (!ids.value.includes(productId)) {
      ids.value.unshift(productId)
      if (ids.value.length > 20) ids.value.pop()
    }
  }

  const fetch = async () => {
    isLoading.value = true
    try {
      const client = getCommerceClient()
      if (client && typeof client.getProductById === 'function') {
        const loaded: Product[] = []
        for (const id of ids.value) {
          try {
            const p = await client.getProductById(id)
            if (p) loaded.push(p)
          } catch (e) {
            // ignore per-item errors
          }
        }
        items.value = loaded
      } else if (ids.value.length) {
        // Best-effort: try a bulk fetch if the client exposes it
        try {
          const clientAny: any = client
          if (clientAny && typeof clientAny.getProducts === 'function') {
            items.value = await clientAny.getProducts({ ids: ids.value })
          }
        } catch (e) {
          // ignore
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    ids: readonly(ids),
    items: readonly(items),
    isLoading: readonly(isLoading),
    addViewed,
    fetch,
  }
})
