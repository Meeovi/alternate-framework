declare function useNuxtApp(): any
declare function useState<T=any>(key: string): { value: T | undefined }
declare function defineNuxtRouteMiddleware(fn: (to: any, from: any) => any): any
declare function navigateTo(path: string): any
declare function useRouter(): any
declare function useRoute(): any

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
