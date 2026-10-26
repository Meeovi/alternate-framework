// Type-only stand-ins for Nuxt's #imports, so `tsc` can check the
// composables outside an app (see tsconfig.json paths).
import type { Ref } from 'vue'

export declare function useRuntimeConfig(): { public: Record<string, any> }
export declare function useRequestFetch(): typeof $fetch
export declare function useAsyncData<T>(key: string, handler: () => Promise<T>, options?: { default?: () => T }): {
  data: Ref<T | undefined>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
  error: Ref<unknown>
  refresh: () => Promise<void>
}
export declare function useRoute(): { fullPath: string }
export declare function useHead(input: unknown): void
