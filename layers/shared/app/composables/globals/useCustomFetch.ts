import type { UseFetchOptions } from '#imports'

export function useCustomFetch<T>(
  url: string | Request | Ref<string | Request> | (() => string | Request),
  options: UseFetchOptions<T> = {}
) {
  return {
    ...useFetch(url, {
      ...options,
      $fetch: useNuxtApp().$customFetch
    })
  }
}
