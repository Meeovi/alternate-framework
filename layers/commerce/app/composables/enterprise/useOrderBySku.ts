import { getCommerceClient } from '../../utils/client'

export function useOrderBySku() {
	const client = getCommerceClient()

	async function orderBySku(sku: string, qty: number) {
		if (client && typeof client.orderBySku === 'function') {
			return client.orderBySku(sku, qty)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return { orderBySku }
}

export default useOrderBySku
