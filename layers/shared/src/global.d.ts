// Minimal global declarations to unblock type-checking in the monorepo build.
// These are temporary shims; replace with proper types or install @types packages.

declare module '#imports' {
  export type UseFetchOptions = any
  export function useNuxtApp(): any
  export function useAsyncData<T = any>(key: string, fn: () => Promise<T>): Promise<{ data: T }>
  export function useRuntimeConfig(): any
  export function isNuxtError(e: any): boolean
  export type NuxtError = any
}

declare module '#components' {
  const AdminTable: any
  export type AdminTable = any
  export default AdminTable
}

declare module 'vue' {
  export * from 'vue'
}

declare module '@vue/test-utils' {
  export function mount(...args: any[]): any
  export function shallowMount(...args: any[]): any
  export const config: any
  export default { mount }
}

declare module '@vue-storefront/unified-data-model' {
  export type SfProduct = any
  export type SfCart = any
  const whatever: any
  export default whatever
}

declare module '@nuxt/kit' { export const defineNuxtModule: any; export const addPlugin: any; export const createResolver: any }
declare module '#app' { export const defineNuxtPlugin: any; export const useRuntimeConfig: any }
declare module 'ofetch' { export const ofetch: any }
declare module 'vitest' { export const describe: any; export const it: any; export const expect: any }
declare module '@nuxt/test-utils/e2e' { export const setup: any; export const $fetch: any }
declare module '@vuelidate/validators' { const v: any; export = v }
declare module '@directus/types' { const t: any; export = t }
declare module '@nuxt/test-utils' { export const setup: any }
declare module '@nuxt/test-utils/*' { const whatever: any; export default whatever }

declare module 'zod' {
  export type ZodSchema = any
  export type ZodError = any
}

declare module '@vue/shared' { const s: any; export = s }

declare global {
  function defineNuxtConfig<T = any>(c: T): T
  function defineEventHandler<T = any>(h: (event: any) => T): T
  function defineI18nConfig<T = any>(c: T): T
  function defineI18nLocale<T = any>(c: T): T
  const useCookie: any
  const useRuntimeConfig: any
  const useStorage: any
  const formatFileSize: (n: number) => string
}

declare module 'micromark' {
  export function micromark(input: string): string
}

declare module 'micromark-extension-gfm' {
  export const gfm: any
  export const gfmHtml: any
}

declare module 'uuid' {
  export function v4(): string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.js'

declare const useTemplateRef: any
declare const usePreviewMode: any
declare const useMeilisearch: any
declare function readonly<T>(v: T): Readonly<T>

declare namespace NodeJS {
  interface ProcessEnv { [key: string]: string | undefined }
}

export {}
