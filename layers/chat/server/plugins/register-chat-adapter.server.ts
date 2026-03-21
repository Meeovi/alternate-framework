/**
 * Chat Adapter Registration Plugin
 * 
 * Registers the chat backend adapter with the mesh gateway at server startup.
 * Supports various chat backends that expose GraphQL APIs.
 * 
 * The frontend never sees the backend URL - it only knows about the mesh gateway.
 */

import { registerAdapterEndpoint } from '@mframework/api-client/mesh'

export default defineNitroPlugin(() => {
  // Detect configured chat backend
  const graphqlEndpoint = process.env.CHAT_GRAPHQL_ENDPOINT

  if (!graphqlEndpoint) {
    console.warn('[chat-adapter] No GraphQL endpoint configured, adapter disabled')
    return
  }

  try {
    registerAdapterEndpoint(
      {
        name: 'chat',
        
        // Primary GraphQL endpoint
        endpoint: () => {
          const endpoint = process.env.CHAT_GRAPHQL_ENDPOINT
          if (!endpoint) {
            throw new Error('No chat GraphQL endpoint configured')
          }
          return endpoint
        },
        
        // REST endpoint for fallback
        restEndpoint: process.env.CHAT_REST_ENDPOINT,
        restPrefix: '/api/v1',
        
        // Forward authorization
        authorization: (context: any) => {
          if (process.env.CHAT_API_TOKEN) {
            return `Bearer ${process.env.CHAT_API_TOKEN}`
          }
          return context?.headers?.authorization
        },
        
        // GraphQL is primary
        graphqlFirst: true,
        
        // Enable if configured
        enabled: !!graphqlEndpoint
      },
      {
        name: 'chat',
        backendType: process.env.CHAT_BACKEND_TYPE || 'custom',
        version: process.env.CHAT_VERSION || '1.0.0',
        modules: ['messages', 'conversations', 'users', 'channels'],
        supportsGraphQL: true,
        supportsREST: process.env.CHAT_SUPPORT_REST !== 'false'
      }
    )

    console.info(
      `[chat-adapter] Registered: ${graphqlEndpoint}`,
      process.env.CHAT_BACKEND_TYPE ? `(${process.env.CHAT_BACKEND_TYPE})` : ''
    )
  } catch (error) {
    console.error('[chat-adapter] Failed to register:', error)
  }
})
