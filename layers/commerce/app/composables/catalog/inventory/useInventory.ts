import { getCommerceClient } from '../../../utils/client'
import type { SfProductStockItem, SfInventorySource } from '~/composables/system/models'

export function useInventory() {
  const client = getCommerceClient()

  async function checkInventory(sku: string, qty: number): Promise<boolean> {
    try {
      if (client && typeof client.checkInventory === 'function') {
        return await client.checkInventory(sku, qty)
      }

      const item = await getStockByProductSku(sku)
      if (!item) return false
      const available = typeof item.qty === 'number' ? item.qty : 0
      return available >= qty
    } catch (e) {
      console.error('Inventory check failed', e)
      return false
    }
  }

  async function getStockByProductSku(sku: string): Promise<SfProductStockItem | null> {
    if (client && typeof client.getStockBySku === 'function') return client.getStockBySku(sku)
    if (client && typeof client.getStockByProductId === 'function') return client.getStockByProductId(sku)
    if (client && typeof client.getStock === 'function') return client.getStock(sku)
    return null
  }

  async function getStockByProductId(productId: string): Promise<SfProductStockItem | null> {
    if (client && typeof client.getStockByProductId === 'function') return client.getStockByProductId(productId)
    return null
  }

  async function getInventorySources() {
    if (client && typeof client.listInventorySources === 'function') return client.listInventorySources()
    return []
  }

  async function getSourceItems(sourceCode: string, skus: string[] = []) {
    if (client && typeof client.listInventorySourceItems === 'function') {
      return client.listInventorySourceItems({ sourceCode, skus })
    }
    return []
  }

  async function assignStockToSource(payload: {
    sourceCode: string
    sku: string
    qty: number
    status?: number
  }) {
    if (client && typeof client.assignStockToSource === 'function') {
      return client.assignStockToSource(payload)
    }
    return null
  }

  return {
    checkInventory,
    getStockByProductSku,
    getStockByProductId,
    getInventorySources,
    getSourceItems,
    assignStockToSource,
  }
}

export default useInventory
