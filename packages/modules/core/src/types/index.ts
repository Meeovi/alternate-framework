// Core
export * from './core/result'
export * from './core/utility'
export * from './core/pagination'
export * from './core/id'
export { Maybe } from './core/common'
export * from './core/error'

// Auth
export * from './auth/user'
export * from './auth/session'
export * from './auth/providers'
export * from './auth/inputs'
export * from './auth/adapter'
// Compatibility alias: expose `Session` name expected by adapters
export { AuthSession as Session } from './auth/session'

// Commerce
export * from './commerce/product'
export * from './commerce/cart'
export * from './commerce/order'
export * from './commerce/adapter'

// Search
export * from './search/query'
export * from './search/result'
export * from './search/facet'
export * from './search/result'
export * from './search/opensearch'
export * from './search/adapter'

// UI
export * from './ui/form'
export * from './ui/state'
export * from './ui/pagination'
export * from './ui/component'
export type * from './ui/blocks';
export type * from './ui/content';
export type * from './ui/meta';
export type * from './ui/system';
export type * from './ui/help';
export type * from './ui/os';
export type * from './ui/schema';
export type * from './ui/api/global-search';

// SDK
export * from './sdk/errors'
export * from './sdk/endpoint'
export * from './sdk/request'
export * from './sdk/response'
export * from './sdk/adapter'