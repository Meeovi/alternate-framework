import { getCommerceClient } from '../../utils/client'

export function useGiftMessages() {
	const client = getCommerceClient()

	async function addGiftMessage(orderId: string, message: string) {
		if (client && typeof client.addGiftMessage === 'function') {
			return client.addGiftMessage(orderId, message)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function getGiftMessages(orderId: string) {
		if (client && typeof client.getGiftMessages === 'function') {
			return client.getGiftMessages(orderId)
		}
		return []
	}

	return {
		addGiftMessage,
		getGiftMessages
	}
}

export default useGiftMessages
