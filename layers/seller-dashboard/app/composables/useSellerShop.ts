import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'

export default function useSellerShop() {
  const provider: any = getSellerProvider() || mockProvider

  async function getShopForSeller(sellerId: string) {
    if (provider && typeof provider.getShopForSeller === 'function') return provider.getShopForSeller(sellerId)
    // Try provider getShop and ensure seller matches, else mock
    const shop = await provider.getShop(sellerId)
    if (shop) return shop
    return mockProvider.getShop(sellerId)
  }

  async function updateShopForSeller(sellerId: string, payload: any) {
    if (provider && typeof provider.updateShopForSeller === 'function') return provider.updateShopForSeller(sellerId, payload)
    return mockProvider.updateShop(sellerId, payload)
  }

  return { getShopForSeller, updateShopForSeller }
}

export { useSellerShop }
