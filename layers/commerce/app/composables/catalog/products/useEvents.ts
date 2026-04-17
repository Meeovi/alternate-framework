
import { getCommerceConfig } from '../../globals/config'
import { getEventProvider } from './registry'

export function useEvents() {
	const cfg = getCommerceConfig() as any
	const providerName = cfg.eventsProvider || cfg.productProvider

	let provider: any
	try {
		provider = getEventProvider(providerName)
	} catch (e) {
		provider = {
			getEvent: async () => null,
			listEvents: async () => []
		}
	}

	return {
		getEvent: provider.getEvent ?? (async (id: string) => null),
		listEvents: provider.listEvents ?? (async (params?: Record<string, any>) => [])
	}
}

export default useEvents

