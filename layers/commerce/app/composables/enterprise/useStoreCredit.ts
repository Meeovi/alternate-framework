import { getCommerceClient } from '../../utils/client'

export function useStoreCredit() {
	const client = getCommerceClient()

	async function getStoreCredit(userId: string) {
		if (client && typeof client.getStoreCredit === 'function') {
			return client.getStoreCredit(userId)
		}
		return null
	}

	return { getStoreCredit }
}

export default useStoreCredit
