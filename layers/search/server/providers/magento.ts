// server/providers/magento.ts
//
// Federates Magento product search into the shared SearchProvider contract,
// following the same shape as mysql.ts/postgres.ts/opensearch.ts. All actual
// GraphQL query-building for Magento lives in adapter-magento's
// MagentoAdapter (content.search, backed by store.queryField's real
// `products(search: ...)` root field) — this file only calls into it and
// reshapes the result, it never talks to Magento's GraphQL endpoint
// directly. Every other part of layers/search (federate.ts, types.ts, the
// /api/search route) stays generic and has no Magento-specific code.
import { useRuntimeConfig } from '#imports'
import { MagentoAdapter } from 'adapter-magento'
import type { FacetBucket, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

type MagentoConfig = {
  enabled: boolean
  endpoint: string
  storeCode?: string
  token: string
}

function getConfig(): MagentoConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { magento: MagentoConfig }).magento
}

let _adapter: MagentoAdapter | null = null

function getAdapter(config: MagentoConfig): MagentoAdapter {
  if (_adapter) return _adapter
  // config.token (GQL_KEY) is intentionally NOT passed as customerToken —
  // confirmed live against a real Magento instance that it isn't a valid
  // customer JWT, and attaching it makes Magento reject every GraphQL
  // request on this client, search included.
  _adapter = new MagentoAdapter(config.endpoint, config.storeCode)
  return _adapter
}

export const magentoProvider: SearchProvider = {
  id: 'magento',

  isEnabled() {
    return Boolean(getConfig()?.enabled)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const magento = getAdapter(config)

    // content.search already builds the Magento GraphQL query (see
    // adapter-magento's src/index.ts) — reused as-is rather than
    // duplicating query-building logic here. `price` isn't a scalar on
    // ProductInterface (confirmed live) — only `price_range` exists.
    const rawItems = await magento.content.search(options.query, {
      pageSize: options.pageSize,
      fields: ['sku', 'name', { price_range: [{ minimum_price: [{ final_price: ['value'] }] }] }, { small_image: ['url'] }],
    })

    const items = (Array.isArray(rawItems) ? rawItems : []).map((item: any) => ({
      id: String(item.sku ?? item.id ?? ''),
      score: 1,
      source: {
        sku: item.sku,
        name: item.name,
        price: item.price_range?.minimum_price?.final_price?.value ?? null,
        image: item.small_image?.url ?? null,
      },
    }))

    return {
      provider: this.id,
      items,
      total: items.length,
      facets: {},
      tookMs: Date.now() - start,
    }
  },

  // Magento's layered-navigation aggregations need a differently-shaped
  // query; skipped for this pass — federate.ts already tolerates providers
  // that don't implement searchFacetValues.
}
