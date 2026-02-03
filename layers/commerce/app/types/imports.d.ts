declare module '#imports' {
  export function useRuntimeConfig(): any
  export function useNuxtApp(): any
  export function useAppConfig(): any
  export function useOrders(): any
  export function useReturns(): any
  export function useTransactions(): any
  export function useInvoices(): any
  export function useCreditMemos(): any
}

declare module 'nuxt/app' {
  export function useAppConfig(): any
  export function useAsyncData<T = any>(keyOrHandler: string | null | (() => Promise<T> | T), handler?: (...args: any[]) => Promise<T> | T): Promise<{ data: { value: T }, error: { value: any } }>
  export function useState<T = any>(key: string, init?: T | (() => T)): { value: T }
}

// Provide globals for files that call Nuxt auto-imports without module import
declare function useNuxtApp(): any
declare function useRuntimeConfig(): any
declare function useAppConfig(): any

// Order-related auto-imports used without explicit imports in stores
declare function useOrders(): any
declare function useReturns(): any
declare function useTransactions(): any
declare function useInvoices(): any
declare function useCreditMemos(): any
