import { getCommerceClient } from '../../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useBookingIntegrations() {
	const client = clientOrNull()

	async function listShippingIntegrations(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listShippingIntegrations === 'function') return client.listShippingIntegrations(opts)
		if (client && typeof client.listCarriers === 'function') return client.listCarriers(opts)
		return []
	}

	async function bookShipment(payload: Record<string, unknown>) {
		if (client && typeof client.bookShipment === 'function') return client.bookShipment(payload)
		if (client && typeof client.createShipment === 'function') return client.createShipment(payload)
		return null
	}

	async function cancelBooking(bookingId: string) {
		if (client && typeof client.cancelShipmentBooking === 'function') return client.cancelShipmentBooking(bookingId)
		if (client && typeof client.cancelShipment === 'function') return client.cancelShipment(bookingId)
		return { success: false, reason: 'cancelShipment not implemented by provider' }
	}

	return {
		listShippingIntegrations,
		bookShipment,
		cancelBooking,
	}
}

export default useBookingIntegrations
