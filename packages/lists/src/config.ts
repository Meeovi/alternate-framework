export interface ListsConfig {
  provider: string
  baseUrl?: string
  apiKey?: string
}

let config: ListsConfig = {
  provider: 'memory'
}

export function setListsConfig(newConfig: Partial<ListsConfig>) {
  config = { ...config, ...newConfig }
}

export function getListsConfig(): ListsConfig {
  return config
}