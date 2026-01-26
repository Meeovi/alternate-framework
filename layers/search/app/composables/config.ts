
export interface SearchConfig {
  searchProvider: string
  searchUrl?: string
  apiKey?: string
}

let config: SearchConfig = {
  searchProvider: 'searchkit',
  searchUrl: '',
  apiKey: ''
}

export function setSearchConfig(newConfig: Partial<SearchConfig>) {
  config = { ...config, ...newConfig }
}

export function getSearchConfig(): SearchConfig {
  return config
}
