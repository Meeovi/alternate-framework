import { getCommerceClient } from '../../../utils/client'

export function useCategory() {
	const client = getCommerceClient()

	async function getCategoryById(id: string) {
		if (client && typeof client.getCategoryById === 'function') {
			return client.getCategoryById(id)
		}
		return null
	}

	async function listCategories(params = {}) {
		if (client && typeof client.listCategories === 'function') {
			return client.listCategories(params)
		}
		return []
	}

	return {
		getCategoryById,
		listCategories
	}
}

export default useCategory
