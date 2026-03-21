import type { AdapterEndpointConfig, AdapterMetadata } from '@mframework/api-client/mesh'

export interface MagentoAdapterRegistration {
  endpoint: AdapterEndpointConfig
  metadata: AdapterMetadata
}

function resolveMagentoGraphqlEndpoint(): string {
  const endpoint = process.env.MAGENTO_GRAPHQL_ENDPOINT ||
    process.env.COMMERCE_GRAPHQL_ENDPOINT ||
    process.env.MAPI_ENDPOINT

  if (!endpoint) {
    throw new Error('No Magento GraphQL endpoint configured. Set MAGENTO_GRAPHQL_ENDPOINT, COMMERCE_GRAPHQL_ENDPOINT, or MAPI_ENDPOINT')
  }

  return endpoint
}

function resolveMagentoRestEndpoint(): string | undefined {
  return process.env.MAGENTO_REST_ENDPOINT ||
    process.env.COMMERCE_REST_ENDPOINT ||
    process.env.MAGENTO_API_URL
}

export function getMagentoAdapterRegistration(): MagentoAdapterRegistration {
  const graphqlEndpoint = resolveMagentoGraphqlEndpoint()
  const restEndpoint = resolveMagentoRestEndpoint()

  return {
    endpoint: {
      name: 'commerce',
      endpoint: resolveMagentoGraphqlEndpoint,
      restEndpoint,
      restPrefix: '/rest/V1',
      authorization: (context: any) => {
        if (process.env.COMMERCE_API_TOKEN) {
          return `Bearer ${process.env.COMMERCE_API_TOKEN}`
        }
        return context?.headers?.authorization
      },
      graphqlFirst: true,
      enabled: !!graphqlEndpoint
    },
    metadata: {
      name: 'commerce',
      backendType: 'magento',
      version: process.env.COMMERCE_VERSION || '2.4.6',
      modules: ['products', 'cart', 'orders', 'customers', 'categories'],
      supportsGraphQL: true,
      supportsREST: !!restEndpoint && process.env.COMMERCE_SUPPORT_REST !== 'false'
    }
  }
}
