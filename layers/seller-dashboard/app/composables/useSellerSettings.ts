import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'

export default function useSellerSettings() {
  const provider: any = getSellerProvider() || mockProvider

  async function getSettingsForSeller(sellerId: string) {
    if (provider && typeof provider.getVendorSettings === 'function') return provider.getVendorSettings(sellerId)
    return mockProvider.getVendorSettings(sellerId)
  }

  async function updateSettingsForSeller(sellerId: string, payload: any) {
    if (provider && typeof provider.updateVendorSettings === 'function') return provider.updateVendorSettings(sellerId, payload)
    return mockProvider.updateVendorSettings(sellerId, payload)
  }

  return { getSettingsForSeller, updateSettingsForSeller }
}

export { useSellerSettings }
