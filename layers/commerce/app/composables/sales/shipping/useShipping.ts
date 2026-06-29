import { getCommerceClient } from '../../../utils/client'
import { useShippingCalculations } from './calculations'
import { useTracking } from './tracking'
import { useBookingIntegrations } from './bookingIntegrations'
import type { SfShippingMethod, SfShippingAddress, SfShippingRatesRequest } from '~/composables/system/models'

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

	async function listShippingMethods(payload?: Partial<SfShippingRatesRequest>) {
		if (client && typeof client.listShippingMethods === 'function') return client.listShippingMethods(payload)
		if (client && typeof client.estimateShippingMethods === 'function') return client.estimateShippingMethods(payload)
		return { methods: [] as SfShippingMethod[] }
	}

	async function selectShippingMethod(payload: {
		cartId?: string
		shippingMethodCode: string
		shippingCarrierCode: string
	}) {
		if (client && typeof client.selectShippingMethod === 'function') {
			return client.selectShippingMethod(payload)
		}
		if (client && typeof client.setShippingMethod === 'function') {
			return client.setShippingMethod(payload)
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
