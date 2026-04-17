import { getCommerceClient } from '../../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useTracking() {
	const client = clientOrNull()

	async function getTrackingInfo(trackingNumber: string, carrierCode?: string) {
		if (client && typeof client.getTrackingInfo === 'function') return client.getTrackingInfo({ trackingNumber, carrierCode })
		if (client && typeof client.trackShipment === 'function') return client.trackShipment({ trackingNumber, carrierCode })
		return null
	}

	async function listTrackingEvents(trackingNumber: string, carrierCode?: string) {
		const result = await getTrackingInfo(trackingNumber, carrierCode)
		if (Array.isArray(result?.events)) return result.events
		if (Array.isArray(result?.history)) return result.history
		return []
	}

	return {
		getTrackingInfo,
		listTrackingEvents,
		trackShipment: getTrackingInfo,
	}
}

export default useTracking
