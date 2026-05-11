import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue)

  if (import.meta.client) {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        data.value = JSON.parse(stored) as T
      } catch {
        data.value = defaultValue
      }
    }

    watch(data, (value) => {
      if (value === undefined || value === null)
        localStorage.removeItem(key)
      else
        localStorage.setItem(key, JSON.stringify(value))
    }, { deep: true })
  }

  return data
}

export interface RequestOptions {
  cacheKey?: string
  ttlMs?: number
  swr?: boolean
  retry?: boolean
}

export async function wrapSocialRequest<T>(
  _provider: string,
  fn: () => Promise<T>,
  _options: RequestOptions = {},
): Promise<T> {
  return await fn()
}
