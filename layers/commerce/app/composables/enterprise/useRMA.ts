import { getCommerceClient } from '../../utils/client'

export function useRMA() {
	const client = getCommerceClient()

	async function createRMA(orderId: string, items: any[]) {
		if (client && typeof client.createRMA === 'function') {
			return client.createRMA(orderId, items)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return { createRMA }
}

export default useRMA
