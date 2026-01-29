// Example runtime registration for an adapter-magento style adapter.
// This file demonstrates how to register a Magento-backed provider at app startup.
import { registerSellerProviderRuntime } from '../app/composables/registry';
export function registerMagentoAdapter(factory, opts) {
    const adapter = factory(opts);
    registerSellerProviderRuntime('magento', adapter);
}
// Usage (Nuxt runtime):
// import { registerMagentoAdapter } from '~~/layers/seller-dashboard/runtime/register-magento'
// import { createMagentoSellerAdapter } from 'adapter-magento'
// registerMagentoAdapter(createMagentoSellerAdapter, { url: process.env.MAGENTO_URL })
