// layers/commerce/app/composables/catalog/inventory/useStock.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type {
  StockProvider,
  StockItem,
  StockSource,
  StockMovement,
} from '../../../types/stock'

/**
 * Inventory / stock composable. Consolidates the old `useInventory.ts` and
 * `products/useStock/useStock.ts` behind the typed `StockProvider` contract.
 */
export function useStock() {
  const client = getCommerceClient() as unknown as StockProvider
  const items = ref<StockItem[]>([])
  const sources = ref<StockSource[]>([])
  const movements = ref<StockMovement[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchStockItems(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      items.value = (await client.getStockItems(params)).items
    } catch (err) {
      error.value = err as Error
      items.value = []
    } finally {
      isLoading.value = false
    }
    return items.value
  }

  async function fetchStockItemBySku(sku: string, sourceCode?: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.getStockItemBySku(sku, sourceCode)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSources() {
    isLoading.value = true
    error.value = null
    try {
      sources.value = await client.getSources()
    } catch (err) {
      error.value = err as Error
      sources.value = []
    } finally {
      isLoading.value = false
    }
    return sources.value
  }

  async function adjustStock(sku: string, qty: number, type: Parameters<StockProvider['adjustStock']>[2], note?: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.adjustStock(sku, qty, type, note)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function reserve(sku: string, qty: number, referenceId: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.reserve(sku, qty, referenceId)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function release(sku: string, qty: number, referenceId: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.release(sku, qty, referenceId)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    sources,
    movements,
    isLoading,
    error,
    fetchStockItems,
    fetchStockItemBySku,
    fetchSources,
    adjustStock,
    reserve,
    release,
  }
}

export default useStock
