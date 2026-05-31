declare module 'alternate-gateway' {
  export interface APIResponse<T = unknown> {
    status: number
    data: T
    error?: string
  }

  export interface RequestOptions {
    body?: unknown
    query?: Record<string, unknown>
    headers?: Record<string, string>
  }

  export interface TransportAdapter {
    request<T = unknown>(
      method: string,
      path: string | URL,
      options?: RequestOptions
    ): Promise<APIResponse<T>>
  }

  export type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: string }
}

declare module 'alternate-gateway/adapters' {
  import type { Result, TransportAdapter } from 'alternate-gateway'

  export interface AuthAdapter {
    login?: (input: any) => Promise<Result<any>>
    register?: (input: any) => Promise<Result<any>>
    logout?: () => Promise<Result<true>>
    getSession?: () => Promise<Result<any>>
    refresh?: () => Promise<Result<any>>
    getUser?: () => Promise<Result<any>>
  }

  export interface CommerceAdapter {
    getProduct?: (id: string) => Promise<Result<any>>
    listProducts?: () => Promise<Result<any[]>>
    getCart?: () => Promise<Result<any>>
    addToCart?: (item: any) => Promise<Result<any>>
    updateCartItem?: (id: string, quantity: number) => Promise<Result<any>>
    removeCartItem?: (id: string) => Promise<Result<any>>
    clearCart?: () => Promise<Result<any>>
  }

  export interface SearchAdapter {
    id?: string
    type?: string
    search?: <T = unknown>(query: any) => Promise<T>
    facets?: (query: any) => Promise<Result<any[]>>
  }

  export type { TransportAdapter }
}

declare module 'alternate-gateway/types' {
  export type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: string }

  export interface LoginInput {
    email?: string
    password?: string
    [key: string]: unknown
  }

  export interface RegisterInput {
    email?: string
    password?: string
    [key: string]: unknown
  }

  export interface Session {
    [key: string]: unknown
  }

  export interface User {
    [key: string]: unknown
  }

  export interface SearchQuery {
    [key: string]: unknown
  }

  export type SearchResult<T = unknown> = T

  export interface Facet {
    [key: string]: unknown
  }
}

declare module 'alternate-gateway/types/commerce/product' {
  export interface CommerceProduct {
    [key: string]: unknown
  }
}

declare module 'alternate-gateway/types/commerce/cart' {
  export interface CommerceCart {
    [key: string]: unknown
  }
}

declare module 'alternate-gateway/registry' {
  export function setAuthAdapter(adapter: unknown): void
  export function setCommerceAdapter(adapter: unknown): void
  export function setSearchAdapter(adapter: unknown): void
}
