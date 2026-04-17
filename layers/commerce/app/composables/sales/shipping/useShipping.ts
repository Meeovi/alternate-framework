import { getCommerceClient } from '../../../utils/client'
import { useShippingCalculations } from './calculations'
import { useTracking } from './tracking'
import { useBookingIntegrations } from './bookingIntegrations'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useShipping() {
	const client = clientOrNull()
	const calculations = useShippingCalculations()
	const tracking = useTracking()
	const booking = useBookingIntegrations()

	async function listShippingMethods(cartId?: string) {
		if (client && typeof client.listShippingMethods === 'function') return client.listShippingMethods({ cartId })
		if (client && typeof client.getShippingMethods === 'function') return client.getShippingMethods({ cartId })
		return []
	}

	async function selectShippingMethod(cartId: string, methodCode: string) {
		if (client && typeof client.selectShippingMethod === 'function') {
			return client.selectShippingMethod({ cartId, methodCode })
		}
		if (client && typeof client.setShippingMethod === 'function') {
			return client.setShippingMethod({ cartId, methodCode })
		}
		return { success: false, reason: 'selectShippingMethod not implemented by provider' }
	}

	return {
		listShippingMethods,
		selectShippingMethod,
		...calculations,
		...tracking,
		...booking,
	}
}

export default useShipping
