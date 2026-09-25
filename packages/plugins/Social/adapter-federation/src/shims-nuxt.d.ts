declare module '#app' {
  export type NuxtApp = any
  export function defineNuxtPlugin<T = any>(plugin: (nuxtApp: NuxtApp) => T): T
}

declare function useNuxtApp(): any
declare function useRuntimeConfig(): any

declare module 'ofetch' {
  export const ofetch: {
    create(opts?: any): any
  }
}
