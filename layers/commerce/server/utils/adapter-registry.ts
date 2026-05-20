export interface AdapterEndpointConfig {
  name: string
  endpoint: string
  restEndpoint?: string
  restPrefix?: string
  authorization?: (context?: any) => string | undefined
  graphqlFirst?: boolean
  enabled?: boolean
}

export interface AdapterMetadata {
  name: string
  backendType: string
  version?: string
  modules?: string[]
  supportsGraphQL?: boolean
  supportsREST?: boolean
}

const endpointRegistry = new Map<string, AdapterEndpointConfig>()
const metadataRegistry = new Map<string, AdapterMetadata>()

export function registerAdapterEndpoint(config: AdapterEndpointConfig, metadata?: AdapterMetadata) {
  endpointRegistry.set(config.name, config)
  if (metadata) {
    metadataRegistry.set(config.name, metadata)
  }
}

export function getAdapterEndpoint(name: string): AdapterEndpointConfig | undefined {
  return endpointRegistry.get(name)
}

export function getAdapterMetadata(name: string): AdapterMetadata | undefined {
  return metadataRegistry.get(name)
}
