declare module 'nuxt/app' {
  export function useNuxtApp(): any
  export function useRuntimeConfig(): any
  export function useRoute(): any
  export function usePreviewMode(): any
  export function useState<T = any>(key: string, init?: T | (() => T)): any
  export function useAsyncData(...args: any[]): any
  export function onNuxtReady(cb: () => void): void
  export function onNuxtServerInit(cb: () => void): void
  export function onNuxtClientInit(cb: () => void): void
  export function onNuxtLoad(cb: () => void): void
  export function onNuxtMount(cb: () => void): void
  export const defineNuxtPlugin: any
  export const defineNuxtConfig: any
}

declare module '#imports' {
  export const isNuxtError: any
  export type NuxtError = any
}

declare module '#app' {
  export const useNuxtApp: any
}

declare const defineNuxtPlugin: any
declare const defineNuxtConfig: any
declare const defineI18nConfig: any
declare const defineI18nLocale: any
