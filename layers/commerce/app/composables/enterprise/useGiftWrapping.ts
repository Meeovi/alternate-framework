import { getCommerceClient } from '../../utils/client'

export function useGiftWrapping() {
	const client = getCommerceClient()

	async function listGiftWrappingOptions(params = {}) {
		if (client && typeof client.listGiftWrappingOptions === 'function') {
			return client.listGiftWrappingOptions(params)
		}
		return []
	}

	return { listGiftWrappingOptions }
}

export default useGiftWrapping
