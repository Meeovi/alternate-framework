import { getCommerceClient } from '../../utils/client'

type StatsEvent = {
	name: string
	payload?: Record<string, unknown>
	at: string
}

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useStastics() {
	const client = clientOrNull()
	const events: StatsEvent[] = []

	async function trackEvent(name: string, payload: Record<string, unknown> = {}) {
		const event: StatsEvent = {
			name,
			payload,
			at: new Date().toISOString(),
		}
		events.push(event)

		if (client && typeof client.trackEvent === 'function') {
			await client.trackEvent(event)
		}

		return event
	}

	function getEvents() {
		return [...events]
	}

	function clearEvents() {
		events.length = 0
	}

	return {
		trackEvent,
		getEvents,
		clearEvents,
	}
}

export const useStatistics = useStastics

export default useStastics
