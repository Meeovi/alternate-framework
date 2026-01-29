import { getSellerProvider } from './registry'
import { getCurrentSellerId } from './_auth'

export function useSellerProducts() {
  const provider = getSellerProvider()

  async function listProducts(params?: any) {
    const sellerId = getCurrentSellerId()
    return provider.listProducts?.(params, { sellerId }) ?? []
  }

  async function getProduct(id: string) {
    const sellerId = getCurrentSellerId()
    return provider.getProduct?.(id, { sellerId }) ?? null
  }

  async function createProduct(payload: any) {
    const sellerId = getCurrentSellerId()
    return provider.createProduct?.(payload, { sellerId })
  }

  async function updateProduct(id: string, payload: any) {
    const sellerId = getCurrentSellerId()
    return provider.updateProduct?.(id, payload, { sellerId })
  }

  async function deleteProduct(id: string) {
    const sellerId = getCurrentSellerId()
    return provider.deleteProduct?.(id, { sellerId })
  }

  return { listProducts, getProduct, createProduct, updateProduct, deleteProduct }
}
