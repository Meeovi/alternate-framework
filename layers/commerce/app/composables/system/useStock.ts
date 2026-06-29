import { getCommerceClient } from '../../utils/client'
import type { SfInventorySource, SfProductStockItem, SfReservation, SfStockItem } from '../models/shared'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useStock() {
	const client = clientOrNull()

	async function getStockByProductId(productId: string): Promise<SfStockItem | SfProductStockItem | null> {
		if (client && typeof client.getStockByProductId === 'function') return client.getStockByProductId(productId)
		if (client && typeof client.getStock === 'function') return client.getStock(productId)
		return null
	}

	async function updateStock(payload: Partial<SfStockItem | SfProductStockItem> & { productId: string }) {
		if (client && typeof client.updateStock === 'function') return client.updateStock(payload)
		return { success: false, reason: 'updateStock not implemented by provider' }
	}

	async function getInventorySources() {
		if (client && typeof client.listInventorySources === 'function') return client.listInventorySources()
		return []
	}

	async function getReservations(params: Record<string, any> = {}) {
		if (client && typeof client.listReservations === 'function') return client.listReservations(params)
		return []
	}

	async function createReservation(payload: Partial<SfReservation>) {
		if (client && typeof client.createReservation === 'function') return client.createReservation(payload)
		return null
	}

	async function isInStock(productId: string) {
		const item = await getStockByProductId(productId)
		if (!item) return false
		if (typeof item.isInStock === 'boolean') return item.isInStock
		return Number(item.qty || 0) > 0
	}

	async function getStockStatus(productId: string) {
		const item = await getStockByProductId(productId)
		if (!item) return 'out_of_stock'
		return item.isInStock ? 'in_stock' : 'out_of_stock'
	}

	return {
		getStockByProductId,
		updateStock,
		getInventorySources,
		getReservations,
		createReservation,
		isInStock,
		getStockStatus,
	}
}

export default useStock
