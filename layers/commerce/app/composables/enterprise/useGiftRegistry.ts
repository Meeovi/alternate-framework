import { getCommerceClient } from '../../utils/client'

export function useGiftRegistry() {
	const client = getCommerceClient()

	async function listGiftRegistries(params = {}) {
		if (client && typeof client.listGiftRegistries === 'function') {
			return client.listGiftRegistries(params)
		}
		return []
	}

	return { listGiftRegistries }
}

export default useGiftRegistry
