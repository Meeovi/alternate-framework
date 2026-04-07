declare module '#imports' {
  export function defineNuxtPlugin<T = any>(plugin: (nuxtApp: T) => any): any
  export function useHead(input: any): void
}
