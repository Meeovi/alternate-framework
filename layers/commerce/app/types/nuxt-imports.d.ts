declare module '#imports' {
  import { Ref } from 'vue'
  export function useNuxtApp(): any
  export function useAsyncData<T = any>(key?: string | symbol, handler?: () => Promise<T> | T): { data: Ref<T | undefined> }
}
