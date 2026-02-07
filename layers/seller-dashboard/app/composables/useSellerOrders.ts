import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'

export default function useSellerOrders() {
  const provider: any = getSellerProvider() || mockProvider

  async function listOrdersForSeller(sellerId: string, params?: Record<string, any>) {
    if (provider && typeof provider.listOrdersForSeller === 'function') return provider.listOrdersForSeller(sellerId, params)
    const all = await provider.listOrders(params)
    return (all || []).filter((o: any) => o.sellerId === sellerId)
  }

  async function getOrderForSeller(orderId: string) {
    if (provider && typeof provider.getOrder === 'function') return provider.getOrder(orderId)
    return mockProvider.getOrder(orderId)
  }

  async function updateOrderForSeller(orderId: string, payload: any) {
    if (provider && typeof provider.updateOrderStatus === 'function') return provider.updateOrderStatus(orderId, payload.status)
    const order = await mockProvider.getOrder(orderId)
    if (!order) throw new Error('Order not found')
    Object.assign(order, payload)
    return order
  }

  return { listOrdersForSeller, getOrderForSeller, updateOrderForSeller }
}

export { useSellerOrders }
