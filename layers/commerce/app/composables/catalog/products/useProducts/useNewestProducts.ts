import { getCommerceClient } from '../../../../utils/client'
import type { SfProduct } from '~/composables/system/models'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useNewestProducts() {
	const client = clientOrNull()

	async function getNewestProducts(opts: Record<string, unknown> = {}): Promise<SfProduct[]> {
		if (client && typeof client.getNewestProducts === 'function') return client.getNewestProducts(opts)
		if (client && typeof client.listProducts === 'function') {
			const products = await client.listProducts({ ...opts, sort: 'newest' })
			const list = Array.isArray(products) ? products : products?.items || []
			return Array.isArray(list)
				? [...list].sort((a: any, b: any) => {
						const aDate = Date.parse(a?.createdAt || a?.date_created || 0)
						const bDate = Date.parse(b?.createdAt || b?.date_created || 0)
						return bDate - aDate
					})
				: []
		}
		return []
	}

	return {
		getNewestProducts,
	}
}

export default useNewestProducts
