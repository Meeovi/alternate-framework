import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfPurchaseOrder } from '~/composables/system/models'

export function usePurchaseOrders() {
  const client = getCommerceClient() as CommerceClient

  async function listPurchaseOrders(companyId: string): Promise<SfPurchaseOrder[]> {
    return client.listPurchaseOrders({ companyId })
  }

  async function getPurchaseOrderById(id: string): Promise<SfPurchaseOrder | null> {
    return client.getPurchaseOrderById(id)
  }

  async function createPurchaseOrder(data: Partial<SfPurchaseOrder>) {
    return client.createPurchaseOrder(data)
  }

  async function updatePurchaseOrder(id: string, data: Partial<SfPurchaseOrder>) {
    return client.updatePurchaseOrder({ id, ...data })
  }

  async function deletePurchaseOrder(id: string) {
    return client.deletePurchaseOrder(id)
  }

  return {
    listPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  }
}

export default usePurchaseOrders
