import {
  defineAlternateModule,
  useAlternateEventBus,
  useAlternateContext,
  type AlternateContext
} from '@meeovi/core'

import { validateSearchConfig, type SearchModuleConfig } from './config/schema'
import type { SearchAdapter } from '@meeovi/core'
import { createOpenSearchAdapter } from './adapter/opensearch'
import { createMeilisearchAdapter } from './adapter/meilisearch'
import { SearchManager } from './core/SearchManager'
import type { MeeoviSearchItem } from './adapter/types'

declare module '@meeovi/core' {
  interface AlternateConfig {
    search?: SearchModuleConfig
  }

  interface AlternateContext {
    searchManager?: import('./core/SearchManager').SearchManager<MeeoviSearchItem>
  }
}

export default defineAlternateModule({
  id: 'search',
  adapters: {},

  async setup(ctx: AlternateContext) {
    const bus = useAlternateEventBus()
    const config = ctx.config.search

    if (!config) return

    validateSearchConfig(config)

    if (config.defaultProvider === 'opensearch') {
      const providerConfig = config.providers.opensearch as
        | Parameters<typeof createOpenSearchAdapter>[0]
        | undefined

      if (providerConfig) {
        this.adapters = {
          search: createOpenSearchAdapter(providerConfig)
        }
      }
    }

    if (config.defaultProvider === 'meilisearch') {
      const providerConfig = config.providers.meilisearch as
        | Parameters<typeof createMeilisearchAdapter>[0]
        | undefined

      if (providerConfig) {
        this.adapters = {
          search: createMeilisearchAdapter(providerConfig)
        }
      }
    }

    const adapter = ctx.getAdapter('search') as
      | SearchAdapter<MeeoviSearchItem>
      | undefined
    if (adapter) {
      ctx.searchManager = new SearchManager<MeeoviSearchItem>(adapter)
    }

    bus.on('app:ready', () => {
      console.info('[@meeovi/search] Search module initialized')
    })
  }
})