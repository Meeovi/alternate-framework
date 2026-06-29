import { getCommerceClient } from '../../utils/client'
import type { SfPurchaseOrder } from '~/composables/system/models'

export function usePurchaseOrders() {
	const client = getCommerceClient()

	async function listPurchaseOrders(companyId: string): Promise<SfPurchaseOrder[]> {
		if (client && typeof client.listPurchaseOrders === 'function') {
			return client.listPurchaseOrders(companyId) as Promise<SfPurchaseOrder[]>
		}
		return []
	}

	async function getPurchaseOrderById(id: string): Promise<SfPurchaseOrder | null> {
		if (client && typeof client.getPurchaseOrderById === 'function') {
			return client.getPurchaseOrderById(id) as Promise<SfPurchaseOrder>
		}
		const orders = await listPurchaseOrders('')
		return Array.isArray(orders) ? orders.find((order: any) => order?.id === id) || null : null
	}

	async function createPurchaseOrder(data: Partial<SfPurchaseOrder>) {
		if (client && typeof client.createPurchaseOrder === 'function') {
			return client.createPurchaseOrder(data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function updatePurchaseOrder(id: string, data: Partial<SfPurchaseOrder>) {
		if (client && typeof client.updatePurchaseOrder === 'function') {
			return client.updatePurchaseOrder(id, data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function deletePurchaseOrder(id: string) {
		if (client && typeof client.deletePurchaseOrder === 'function') {
			return client.deletePurchaseOrder(id)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		listPurchaseOrders,
		getPurchaseOrderById,
		createPurchaseOrder,
		updatePurchaseOrder,
		deletePurchaseOrder
	}
}

export default usePurchaseOrders
