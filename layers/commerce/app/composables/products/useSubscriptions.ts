
import { getCommerceConfig } from '../config'
import { getSubscriptionProvider } from './registry'

export function useSubscriptions() {
	const cfg = getCommerceConfig() as any
	const providerName = cfg.subscriptionsProvider || cfg.productProvider

	let provider: any
	try {
		provider = getSubscriptionProvider(providerName)
	} catch (e) {
		provider = {
			getSubscription: async () => null,
			listSubscriptions: async () => [],
			subscribe: async () => ({ success: false })
		}
	}

	return {
		getSubscription: provider.getSubscription ?? (async (id: string) => null),
		listSubscriptions: provider.listSubscriptions ?? (async (params?: Record<string, any>) => []),
		subscribe: provider.subscribe ?? (async (payload: Record<string, any>) => ({ success: false }))
	}
}

export default useSubscriptions


