import { getSellerProvider } from './registry'
import { getCurrentSellerId } from './_auth'

export function useSellerShipments() {
  const provider = getSellerProvider()

  async function listShipments(params?: any) {
    const sellerId = getCurrentSellerId()
    return provider.listShipments?.(params, { sellerId }) ?? []
  }

  async function updateShipment(id: string, payload: any) {
    const sellerId = getCurrentSellerId()
    return provider.updateShipment?.(id, payload, { sellerId })
  }

  return { listShipments, updateShipment }
}
