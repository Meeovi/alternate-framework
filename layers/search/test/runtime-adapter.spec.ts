import { createAlternateApp } from '../../../packages/core/src/runtime/app'
import { defineAlternateAdapter } from '../../../packages/core/src/plugins/defineAdapter'
import { defineAlternateModule } from '../../../packages/core/src/plugins/defineModule'
import { AlternateContext } from '../../../packages/core/src/runtime/context'
import { ModuleRegistry } from '../../../packages/core/src/plugins/registry'
import { createEventBus } from '../../../packages/core/src/types/events'
import { SearchManager } from '../app/composables/core/SearchManager'
import type { SearchAdapter, SearchResult } from '../../../packages/core/src/adapters/search'

// Minimal mock search adapter shape matching core types
const mockSearchAdapter = defineAlternateAdapter<SearchAdapter<any>>({
  id: 'mock-search',
  type: 'search',
  async search(): Promise<SearchResult<any>> {
    return { items: [], total: 0, page: 1, pageSize: 10 }
  }
} as any)

// A tiny test runner substitute so this file can be executed with `ts-node` or similar.
async function run() {
  // Build an app with no modules initially
  const app = createAlternateApp({ config: { modules: [] } as any, modules: [] as any })

  // Create event bus and registry manually to inspect behavior
  const bus = createEventBus()
  const registry = new ModuleRegistry(bus)
  const ctx = new AlternateContext({} as any, registry)

  // Register the search module implementation directly (import existing module)
  const searchModule = require('../app/composables/module').default
  registry.registerModule(searchModule, ctx)

  // At this point no adapter is registered yet, so searchManager should be undefined
  if ((ctx as any).searchManager) {
    throw new Error('Expected searchManager to be undefined before adapter registration')
  }

  // Now register a module that provides the adapter
  const providerModule = defineAlternateModule({
    id: 'provider',
    adapters: {
      search: mockSearchAdapter
    },
    setup() {}
  })

  registry.registerModule(providerModule, ctx)

  // After registration, registry should have emitted adapter:registered and search module
  // should have created the SearchManager
  if (!(ctx as any).searchManager) {
    throw new Error('Expected searchManager to be initialized after adapter registration')
  }

  console.log('OK: searchManager initialized on adapter registration')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
