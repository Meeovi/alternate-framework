// Type-only stand-ins for Nuxt's #imports, so `tsc` can check the
// composables outside an app (see tsconfig.json paths).
import type { Ref } from 'vue'

export declare function useRuntimeConfig(): { public: Record<string, any> }
export declare function useFetch<T>(url: string, options?: Record<string, unknown>): {
  data: Ref<T | undefined>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
  error: Ref<unknown>
  refresh: () => Promise<void>
}
export declare function useRoute(): { fullPath: string }
export declare function useHead(input: unknown): void
export declare function definePageMeta(input: unknown): void
