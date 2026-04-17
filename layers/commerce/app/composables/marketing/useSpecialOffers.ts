import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useSpecialOffers() {
	const client = clientOrNull()

	async function listSpecialOffers(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listSpecialOffers === 'function') return client.listSpecialOffers(opts)
		if (client && typeof client.getPromotions === 'function') return client.getPromotions({ ...opts, type: 'special-offer' })
		return []
	}

	async function getSpecialOfferById(id: string) {
		if (client && typeof client.getSpecialOffer === 'function') return client.getSpecialOffer(id)
		const offers = await listSpecialOffers()
		return Array.isArray(offers) ? offers.find((offer: any) => offer?.id === id || offer?.code === id) || null : null
	}

	return {
		listSpecialOffers,
		getSpecialOfferById,
	}
}

export default useSpecialOffers
