import { getCommerceClient } from '../../utils/client'
import type { SfOrder } from '~/composables/system/models'

export interface GiftMessage {
  id: string
  orderId: string
  message: string
  recipientName?: string
  senderName?: string
  createdAt: string
  updatedAt?: string
}

export function useGiftMessages() {
	const client = getCommerceClient()

	async function addGiftMessage(orderId: string, message: string) {
		if (client && typeof client.addGiftMessage === 'function') {
			return client.addGiftMessage(orderId, message)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function getGiftMessages(orderId: string): Promise<GiftMessage[]> {
		if (client && typeof client.getGiftMessages === 'function') {
			return client.getGiftMessages(orderId)
		}
		return []
	}

	async function updateGiftMessage(id: string, message: string) {
		if (client && typeof client.updateGiftMessage === 'function') {
			return client.updateGiftMessage(id, message)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function deleteGiftMessage(id: string) {
		if (client && typeof client.deleteGiftMessage === 'function') {
			return client.deleteGiftMessage(id)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		addGiftMessage,
		getGiftMessages,
		updateGiftMessage,
		deleteGiftMessage
	}
}

export default useGiftMessages
