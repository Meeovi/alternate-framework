declare module '@mframework/sdk' {
  export type TransportAdapter = {
    request<T = any>(method: string, path: string, opts?: any): Promise<any>
  }
  export type AuthAdapter = any
  export type CommerceAdapter = any
  export type SearchAdapter = any
  export function setAuthAdapter(adapter: AuthAdapter): void
  export function setCommerceAdapter(adapter: CommerceAdapter): void
  export function setSearchAdapter(adapter: SearchAdapter): void
}

declare module '@mframework/core' {
  export type LoginInput = any
  export type RegisterInput = any
  export type Result<T = any> = any
  export type Session = any
  export type User = any
  export type TransportAdapter = import('@mframework/sdk').TransportAdapter
  export type RequestOptions = any
  export type APIResponse<T = any> = any
}

declare module '@mframework/api' {
  export const prisma: any
  export function useDB(_event?: any): Promise<any>
  export function isValidTable(name: string): boolean
}
