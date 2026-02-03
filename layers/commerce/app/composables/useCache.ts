export function useCache() {
  const store = new Map<string, any>()

  function setCacheItem(key: string, value: any) {
    try {
      store.set(key, value)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (e) {
      // ignore storage failures
    }
  }

  function getCacheItem<T = any>(key: string): T | null {
    if (store.has(key)) return store.get(key)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          store.set(key, parsed)
          return parsed as T
        }
      }
    } catch {}
    return null
  }

  function removeCacheItem(key: string) {
    store.delete(key)
    try { if (typeof window !== 'undefined' && window.localStorage) localStorage.removeItem(key) } catch {}
  }

  return { setCacheItem, getCacheItem, removeCacheItem }
}

export default useCache
