import { defineStore } from '#imports'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'commerce:compare-product-skus'

export const useCompareStore = defineStore('compare', () => {
  const productSkus = ref<string[]>([])
  const isLoading = ref(false)

  const getComparedProductSkus = computed(() => productSkus.value)
  const getIsLoading = computed(() => isLoading.value)

  const persist = () => {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productSkus.value))
  }

  const hydrate = () => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        productSkus.value = parsed.filter((sku): sku is string => typeof sku === 'string')
      }
    } catch {
      // ignore malformed persisted value
    }
  }

  const addComparedProductSku = (sku: string) => {
    if (!sku || productSkus.value.includes(sku)) return
    productSkus.value.push(sku)
    persist()
  }

  const removeComparedProductSku = (sku: string) => {
    productSkus.value = productSkus.value.filter((item) => item !== sku)
    persist()
  }

  const clearComparedProductSkus = () => {
    productSkus.value = []
    persist()
  }

  if (import.meta.client) {
    hydrate()
  }

  return {
    productSkus,
    isLoading,
    getComparedProductSkus,
    getIsLoading,
    addComparedProductSku,
    removeComparedProductSku,
    clearComparedProductSkus,
  }
})

export default useCompareStore
