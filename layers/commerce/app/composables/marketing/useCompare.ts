import { getCommerceClient } from '../../utils/client'

export function useCompare() {
	const client = getCommerceClient()

	async function addToCompare(productId: string) {
		if (client && typeof client.addToCompare === 'function') {
			return client.addToCompare(productId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function removeFromCompare(productId: string) {
		if (client && typeof client.removeFromCompare === 'function') {
			return client.removeFromCompare(productId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function getComparedProducts() {
		if (client && typeof client.getComparedProducts === 'function') {
			return client.getComparedProducts()
		}
		return []
	}

	return {
		addToCompare,
		removeFromCompare,
		getComparedProducts
	}
}

export default useCompare
