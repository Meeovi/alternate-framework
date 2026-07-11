import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

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
  const client = getCommerceClient() as CommerceClient

  async function addGiftMessage(orderId: string, message: string) {
    return client.addGiftMessage({ orderId, message })
  }

  async function getGiftMessages(orderId: string): Promise<GiftMessage[]> {
    return client.getGiftMessages({ orderId })
  }

  async function updateGiftMessage(id: string, message: string) {
    return client.updateGiftMessage({ id, message })
  }

  async function deleteGiftMessage(id: string) {
    return client.deleteGiftMessage(id)
  }

  return {
    addGiftMessage,
    getGiftMessages,
    updateGiftMessage,
    deleteGiftMessage,
  }
}

export default useGiftMessages
