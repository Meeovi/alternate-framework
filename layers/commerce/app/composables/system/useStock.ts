import { getCommerceClient } from '../../utils/client'
import type { MeeoviStockItem } from './schema/stockItems'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useStock() {
	const client = clientOrNull()

	async function getStockByProductId(productId: string): Promise<MeeoviStockItem | null> {
		if (client && typeof client.getStockByProductId === 'function') return client.getStockByProductId(productId)
		if (client && typeof client.getStock === 'function') return client.getStock(productId)
		return null
	}

	async function updateStock(payload: Partial<MeeoviStockItem> & { productId: string }) {
		if (client && typeof client.updateStock === 'function') return client.updateStock(payload)
		return { success: false, reason: 'updateStock not implemented by provider' }
	}

	async function isInStock(productId: string) {
		const item = await getStockByProductId(productId)
		if (!item) return false
		if (typeof item.isInStock === 'boolean') return item.isInStock
		return Number(item.qty || 0) > 0
	}

	return {
		getStockByProductId,
		updateStock,
		isInStock,
	}
}

export default useStock
