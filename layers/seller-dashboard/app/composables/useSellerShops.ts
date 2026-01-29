import { getSellerProvider } from './registry'
import { getCurrentSellerId } from './_auth'

export function useSellerShops() {
  const provider = getSellerProvider()

  async function listShops(params?: any) {
    const sellerId = getCurrentSellerId()
    return provider.listShops?.(params, { sellerId }) ?? []
  }

  async function getShop(id: string) {
    const sellerId = getCurrentSellerId()
    return provider.getShop?.(id, { sellerId }) ?? null
  }

  async function updateShop(id: string, payload: any) {
    const sellerId = getCurrentSellerId()
    return provider.updateShop?.(id, payload, { sellerId })
  }

  return { listShops, getShop, updateShop }
}
