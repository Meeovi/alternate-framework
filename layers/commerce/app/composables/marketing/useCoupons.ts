import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useCoupons() {
	const client = clientOrNull()

	async function listCoupons(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listCoupons === 'function') return client.listCoupons(opts)
		return []
	}

	async function applyCoupon(code: string, cartId?: string) {
		if (client && typeof client.applyCoupon === 'function') return client.applyCoupon({ code, cartId })
		return { success: false, reason: 'applyCoupon not implemented by provider' }
	}

	async function removeCoupon(code: string, cartId?: string) {
		if (client && typeof client.removeCoupon === 'function') return client.removeCoupon({ code, cartId })
		return { success: false, reason: 'removeCoupon not implemented by provider' }
	}

	async function validateCoupon(code: string) {
		if (client && typeof client.validateCoupon === 'function') return client.validateCoupon(code)
		if (client && typeof client.getCoupon === 'function') return !!(await client.getCoupon(code))
		return false
	}

	return {
		listCoupons,
		applyCoupon,
		removeCoupon,
		validateCoupon,
	}
}

export default useCoupons
