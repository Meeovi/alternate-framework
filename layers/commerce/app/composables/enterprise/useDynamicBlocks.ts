import { getCommerceClient } from '../../utils/client'

export function useDynamicBlocks() {
	const client = getCommerceClient()

	async function getDynamicBlockById(id: string) {
		if (client && typeof client.getDynamicBlockById === 'function') {
			return client.getDynamicBlockById(id)
		}
		return null
	}

	async function listDynamicBlocks(params = {}) {
		if (client && typeof client.listDynamicBlocks === 'function') {
			return client.listDynamicBlocks(params)
		}
		return []
	}

	return {
		getDynamicBlockById,
		listDynamicBlocks
	}
}

export default useDynamicBlocks
