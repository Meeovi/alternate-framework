// src/index.ts
export * from './src/runtime/app'
export * from './src/runtime/context'
export * from './src/runtime/config'
// src/index.ts
export * from './src/runtime/app'
export * from './src/runtime/context'
export * from './src/runtime/config'
export * from './src/runtime/hooks'

export * from './src/plugins/defineModule'
export * from './src/plugins/defineAdapter'
export * from './src/plugins/registry'

export * from './src/adapters/common'
export * from './src/adapters/auth'
export * from './src/adapters/search'
export * from './src/adapters/catalog'
export * from './src/adapters/cart'
export * from './src/adapters/lists'

export * from './src/types/module'
export * from './src/types/app'
export * from './src/types/config'
export * from './src/types/events'

//// Types and Utilities ////

// Core
export * from './src/types/core/result'
export * from './src/types/core/utility'
export * from './src/types/core/pagination'
export * from './src/types/core/id'
export { Maybe } from './src/types/core/common'
export * from './src/types/core/error'

// Auth
export * from './src/types/auth/user'
export * from './src/types/auth/session'
export * from './src/types/auth/providers'
export * from './src/types/auth/inputs'
export type { AuthAdapter } from './src/types/auth/adapter'

// Commerce
export * from './src/types/commerce/product'
export * from './src/types/commerce/cart'
export * from './src/types/commerce/order'
export * from './src/types/commerce/adapter'
export * from './src/types/commerce/category'
// Legacy compat exports (for older @meeovi/types consumers)
// Export specific legacy names to avoid symbol collisions with other re-exports
export type { Product } from './src/types/compat/legacy'
export type { Session, User } from './src/types/compat/legacy'

// Search
export type { SearchQuery } from './src/types/search/query'
export type { SearchResult } from './src/types/search/result'
export * from './src/types/search/facet'
export * from './src/types/search/result'
export * from './src/types/search/opensearch'
export type { SearchAdapter } from './src/types/search/adapter'

// UI
export * from './src/types/ui/form'
export * from './src/types/ui/state'
export * from './src/types/ui/pagination'
export * from './src/types/ui/component'
export * from './src/types/ui/blocks'
export * from './src/types/ui/content'
export * from './src/types/ui/meta'
export * from './src/types/ui/system'
export * from './src/types/ui/help'
export * from './src/types/ui/os'
export * from './src/types/ui/schema'

// SDK
export * from './src/types/sdk/errors'
export * from './src/types/sdk/endpoint'
export * from './src/types/sdk/request'
export * from './src/types/sdk/response'
export * from './src/types/sdk/adapter'

// Normalizers
export * from './src/normalizers/factories'
export * from './src/normalizers/factories/apiClientFactory'
export * from './src/normalizers/utils/context'
export * from './src/normalizers/utils/factoryParams'
export * from './src/normalizers/utils/helpers'
export * from './src/normalizers/utils/i18n-redirects'
export * from './src/normalizers/utils/logger'
export * from './src/normalizers/utils/shared'
export * from './src/normalizers/utils/ssr'
export * from './src/normalizers/utils/wrap'