import { getCommerceClient } from '../../utils/client'

export function usePurchaseOrders() {
	const client = getCommerceClient()

	async function listPurchaseOrders(companyId: string) {
		if (client && typeof client.listPurchaseOrders === 'function') {
			return client.listPurchaseOrders(companyId)
		}
		return []
	}

	return { listPurchaseOrders }
}

export default usePurchaseOrders
