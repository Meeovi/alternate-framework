import { getCommerceClient } from '../../../../utils/client'

export function useProduct() {
	const client = getCommerceClient()

	async function getProductById(id: string) {
		if (client && typeof client.getProductById === 'function') {
			return client.getProductById(id)
		}
		return null
	}

	async function getProductBySlug(slug: string) {
		if (client && typeof client.getProductBySlug === 'function') {
			return client.getProductBySlug(slug)
		}
		return null
	}

	return {
		getProductById,
		getProductBySlug
	}
}

export default useProduct
