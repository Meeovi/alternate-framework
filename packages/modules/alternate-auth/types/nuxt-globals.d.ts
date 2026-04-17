declare const useRequestURL: () => { origin: string }
declare const useRequestHeaders: () => Record<string, string>
declare const useRuntimeConfig: () => any
declare const useState: <T = unknown>(key: string, init?: () => T) => { value: T }
declare const useCookie: <T = string | null>(name: string) => { value: T }
declare const useFetch: <T = unknown>(url: string, options?: Record<string, unknown>) => { data: { value: T | null }; error: { value: unknown } }
declare const navigateTo: (to: unknown) => Promise<unknown>
declare const $fetch: <T = unknown>(url: string, options?: Record<string, unknown>) => Promise<T>
declare const ref: <T = unknown>(value: T) => { value: T }
declare const computed: <T = unknown>(getter: () => T) => { value: T }
declare const watchEffect: (effect: () => void) => void
