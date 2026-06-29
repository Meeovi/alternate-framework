import { getCommerceClient } from '../../../../utils/client'
import type { SfProduct } from '~/composables/system/models'

export function useProduct() {
	const client = getCommerceClient()

	async function getProductById(id: string): Promise<SfProduct | null> {
		if (client && typeof client.getProductById === 'function') {
			return client.getProductById(id)
		}
		return null
	}

	async function getProductBySku(sku: string): Promise<SfProduct | null> {
		if (client && typeof client.getProductBySku === 'function') {
			return client.getProductBySku(sku)
		}
		return null
	}

	async function getProductBySlug(slug: string): Promise<SfProduct | null> {
		if (client && typeof client.getProductBySlug === 'function') {
			return client.getProductBySlug(slug)
		}
		return null
	}

	async function getProductByUrlKey(urlKey: string): Promise<SfProduct | null> {
		if (client && typeof client.getProductByUrlKey === 'function') {
			return client.getProductByUrlKey(urlKey)
		}
		return null
	}

	return {
		getProductById,
		getProductBySku,
		getProductBySlug,
		getProductByUrlKey,
	}
}

export default useProduct
export * from './useProductRecommended';
export * from './useProductAttribute';
