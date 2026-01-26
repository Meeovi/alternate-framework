declare module '#imports' {
  export function useRuntimeConfig(): any;
  export function useState<T = any>(key: string, init?: T): any;
  export function useFetch(...args: any[]): any;
  export function defineNuxtPlugin(fn: any): any;
  export const navigateTo: any;
  export const useRouter: any;
  export const useNuxtApp: any;
  export const useRequestEvent: any;
  export const useCookie: any;
  export const useHeaders: any;
  export const useQuery: any;
}
