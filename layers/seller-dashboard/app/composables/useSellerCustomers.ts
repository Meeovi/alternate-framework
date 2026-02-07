import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'

export default function useSellerCustomers() {
  const provider: any = getSellerProvider() || mockProvider

  async function listCustomersForSeller(sellerId: string, params?: Record<string, any>) {
    if (provider && typeof provider.listCustomersForSeller === 'function') return provider.listCustomersForSeller(sellerId, params)
    // Fallback to global list with filter
    const all = await provider.listCustomers(params)
    return (all || []).filter((c: any) => c.sellerId === sellerId)
  }

  async function createCustomerForSeller(sellerId: string, payload: any) {
    if (provider && typeof provider.createCustomerForSeller === 'function') return provider.createCustomerForSeller(sellerId, payload)
    // Store in mock provider under seller key
    const list = (mockProvider as any).customers.get(sellerId) || []
    const customer = { ...payload, id: String(Date.now()), sellerId }
    list.push(customer)
    ;(mockProvider as any).customers.set(sellerId, list)
    return customer
  }

  return { listCustomersForSeller, createCustomerForSeller }
}

export { useSellerCustomers }
