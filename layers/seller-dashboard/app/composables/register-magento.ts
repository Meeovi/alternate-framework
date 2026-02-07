// Example runtime registration for an adapter-magento style adapter.
// This file demonstrates how to register a Magento-backed provider at app startup.
import { registerSellerProviderRuntime } from './registry'

// Example factory signature expected from an adapter package
type MagentoAdapterFactory = (opts: any) => any

export function registerMagentoAdapter(factory: MagentoAdapterFactory, opts: any) {
  const adapter = factory(opts)
  registerSellerProviderRuntime('magento', adapter)
}

// Usage (Nuxt runtime):
// import { registerMagentoAdapter } from '~~/layers/seller-dashboard/runtime/register-magento'
// import { createMagentoSellerAdapter } from 'adapter-magento'
// registerMagentoAdapter(createMagentoSellerAdapter, { url: process.env.MAGENTO_URL })
