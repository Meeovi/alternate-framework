export interface SearchModuleConfig {
  defaultProvider: 'opensearch' | 'meilisearch'
  providers: Record<string, unknown>
}

export function validateSearchConfig(config: SearchModuleConfig) {
  if (!config.defaultProvider) {
    throw new Error('[@mframework/layer-search] Missing defaultProvider')
  }

  if (!config.providers[config.defaultProvider]) {
    throw new Error(
      `[@mframework/layer-search] Provider "${config.defaultProvider}" not found in config.providers`
    )
  }
}