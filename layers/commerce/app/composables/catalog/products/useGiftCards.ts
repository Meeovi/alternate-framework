
import { getCommerceConfig } from '../../globals/config'
import { getGiftCardProvider } from './registry'

export function useGiftCards() {
	const cfg = getCommerceConfig() as any
	const providerName = cfg.giftCardsProvider || cfg.productProvider

	let provider: any
	try {
		provider = getGiftCardProvider(providerName)
	} catch (e) {
		provider = {
			getGiftCard: async () => null,
			listGiftCards: async () => [],
			redeemGiftCard: async () => ({ success: false })
		}
	}

	return {
		getGiftCard: provider.getGiftCard ?? (async (id: string) => null),
		listGiftCards: provider.listGiftCards ?? (async (params?: Record<string, any>) => []),
		redeemGiftCard: provider.redeemGiftCard ?? (async (code: string) => ({ success: false }))
	}
}

export default useGiftCards


