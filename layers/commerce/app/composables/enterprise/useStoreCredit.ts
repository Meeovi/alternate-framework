import { getCommerceClient } from '../../utils/client'
import type { SfStoreCredit } from '~/composables/system/models'

export function useStoreCredit() {
	const client = getCommerceClient()

	async function getStoreCredit(customerId: string): Promise<SfStoreCredit | null> {
		if (client && typeof client.getStoreCredit === 'function') {
			return client.getStoreCredit(customerId) as Promise<SfStoreCredit>
		}
		return null
	}

	async function updateStoreCredit(customerId: string, amount: number) {
		if (client && typeof client.updateStoreCredit === 'function') {
			return client.updateStoreCredit(customerId, amount)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function applyStoreCreditToCart(cartId: string, amount: number) {
		if (client && typeof client.applyStoreCreditToCart === 'function') {
			return client.applyStoreCreditToCart(cartId, amount)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		getStoreCredit,
		updateStoreCredit,
		applyStoreCreditToCart,
	}
}

export default useStoreCredit
