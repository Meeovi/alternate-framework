// Example module showing module-based registration of the OpenSearch adapter
import { createOpenSearchAdapter } from '@mframework/adapter-opensearch'
import searchModule from '~~/layers/search/app/composables/module'

export const opensearchProviderModule = {
  id: 'search-provider-opensearch-example',
  adapters: {
    search: createOpenSearchAdapter({ id: 'opensearch', index: process.env.ALTERNATE_SEARCH_INDEX || 'products' })
  }
}

// Usage (in your app):
// const app = createM FrameworkApp({ config: { /* ... */ }, modules: [searchModule, opensearchProviderModule] })
// await app.start()
