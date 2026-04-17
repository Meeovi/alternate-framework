import { getCommerceClient } from '../../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useBestSellingProducts() {
	const client = clientOrNull()

	async function getBestSellingProducts(opts: Record<string, unknown> = {}) {
		if (client && typeof client.getBestSellingProducts === 'function') return client.getBestSellingProducts(opts)
		if (client && typeof client.listProducts === 'function') {
			const products = await client.listProducts({ ...opts, sort: 'best_selling' })
			const list = Array.isArray(products) ? products : products?.items || []
			return Array.isArray(list)
				? [...list].sort((a: any, b: any) => Number(b?.sold || b?.salesCount || 0) - Number(a?.sold || a?.salesCount || 0))
				: []
		}
		return []
	}

	return {
		getBestSellingProducts,
	}
}

export default useBestSellingProducts
