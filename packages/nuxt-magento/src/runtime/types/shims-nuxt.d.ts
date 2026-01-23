declare module '#imports' {
  export function useRuntimeConfig(): any
  export function useNuxtApp(): any
}

declare module '#app' {
  export function defineNuxtPlugin(fn: any): any
  export function useNuxtApp(): any
}

declare module '#unhead/composables' {
  export const useHead: any
}

declare const $fetch: any
