import { getSellerProvider } from './registry'
import { getCurrentSellerId } from './_auth'

export function useSellerOrders() {
  const provider = getSellerProvider()

  async function listOrders(params?: any) {
    const sellerId = getCurrentSellerId()
    return provider.listOrders?.(params, { sellerId }) ?? []
  }

  async function getOrder(id: string) {
    const sellerId = getCurrentSellerId()
    return provider.getOrder?.(id, { sellerId }) ?? null
  }

  async function updateOrderStatus(id: string, status: string) {
    const sellerId = getCurrentSellerId()
    return provider.updateOrderStatus?.(id, status, { sellerId })
  }

  return { listOrders, getOrder, updateOrderStatus }
}
