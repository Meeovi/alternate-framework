/**
 * Lists Adapter Registration Plugin
 * 
 * Registers the lists/content backend adapter (Directus/WordPress/Custom) with the
 * mesh gateway at server startup. This is backend-agnostic - the actual backend
 * is determined by environment configuration.
 * 
 * The frontend never sees the backend URL - it only knows about the mesh gateway.
 */

import { registerAdapterEndpoint } from '@mframework/api-client/mesh'

export default defineNitroPlugin(() => {
  // Detect configured lists backend
  const graphqlEndpoint = process.env.LISTS_GRAPHQL_ENDPOINT

  if (!graphqlEndpoint) {
    console.warn('[lists-adapter] No GraphQL endpoint configured, adapter disabled')
    return
  }

  try {
    registerAdapterEndpoint(
      {
        name: 'lists',
        
        // Primary GraphQL endpoint
        endpoint: () => {
          const endpoint = process.env.LISTS_GRAPHQL_ENDPOINT
          if (!endpoint) {
            throw new Error('No lists GraphQL endpoint configured')
          }
          return endpoint
        },
        
        // REST endpoint for fallback (Directus)
        restEndpoint: process.env.DIRECTUS_URL || process.env.LISTS_API_URL,
        restPrefix: '/graphql', // Directus GraphQL is under /graphql
        
        // Forward authorization
        authorization: (context: any) => {
          // For Directus, use service token if available
          if (process.env.DIRECTUS_API_TOKEN) {
            return `Bearer ${process.env.DIRECTUS_API_TOKEN}`
          }
          // Otherwise forward client auth
          return context?.headers?.authorization
        },
        
        // GraphQL is primary
        graphqlFirst: true,
        
        // Enable if configured
        enabled: !!graphqlEndpoint
      },
      {
        name: 'lists',
        backendType: process.env.LISTS_BACKEND_TYPE || 'directus',
        version: process.env.LISTS_VERSION || '12.0.0',
        modules: ['content', 'files', 'collections', 'items'],
        supportsGraphQL: true,
        supportsREST: true
      }
    )

    console.info(
      `[lists-adapter] Registered: ${graphqlEndpoint}`,
      process.env.LISTS_BACKEND_TYPE ? `(${process.env.LISTS_BACKEND_TYPE})` : ''
    )
  } catch (error) {
    console.error('[lists-adapter] Failed to register:', error)
  }
})
