import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useDiscounts() {
	const client = clientOrNull()

	async function listDiscounts(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listDiscounts === 'function') return client.listDiscounts(opts)
		if (client && typeof client.getPromotions === 'function') return client.getPromotions(opts)
		return []
	}

	async function getDiscountForCart(cartId: string) {
		if (client && typeof client.getDiscountForCart === 'function') return client.getDiscountForCart(cartId)
		if (client && typeof client.calculateDiscounts === 'function') return client.calculateDiscounts({ cartId })
		return []
	}

	return {
		listDiscounts,
		getDiscountForCart,
	}
}

export default useDiscounts
