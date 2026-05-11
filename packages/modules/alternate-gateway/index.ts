export * from './src/adapters/'

export * from './src/core/load-base-app-env'

export * from './src/core/context'
export * from './src/server'

import { loadGraphQL } from './src/loader/loadGraphql'

loadGraphQL();

export * from './src/core/fetcher';
export * from './src/core/registry';

// GraphQL queries/mutations
export * from './src/domains/commerce/products'
// cart mutation not present in source — omitted for now

// Utils
//export * from './src/utils/errors'
export * from './src/core/database/organization'

export * from './src/adapters/common'
export * from './src/adapters/auth/auth'
export * from './src/adapters/search/search'
export * from './src/adapters/commerce/catalog'
export * from './src/adapters/commerce/cart'
export * from './src/adapters/lists/lists'

// Auth
export * from './src/domains/auth/auth/user'
export * from './src/domains/auth/auth/session'
export * from './src/domains/auth/auth/providers'
export type { AuthAdapter } from './src/domains/auth/adapter'

// Commerce
export * from './src/domains/commerce/product'
export * from './src/domains/commerce/cart'
export * from './src/domains/commerce/order'
export * from './src/domains/commerce/adapter'
export * from './src/domains/commerce/category'

// Search
export type { SearchQuery } from './src/domains/search/query'
export type { SearchResult } from './src/domains/search/result'
export * from './src/domains/search/facet'
export * from './src/domains/search/result'
export * from './src/domains/search/opensearch'
export type { SearchAdapter } from './src/domains/search/adapter'
export * from './src/domains/search/security'

// SDK
export * from './src/domains/shared/errors'
export * from './src/domains/shared/endpoint'
export * from './src/domains/shared/request'
export * from './src/domains/shared/response'

export * from './src/core/registry';