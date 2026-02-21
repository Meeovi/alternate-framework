export function useAsyncIDBKeyval<T>(key: string, defaultValue: T, refObj?: { value: T }) {
  async function readIDB() {
    try {
      if (typeof indexedDB !== 'undefined') {
        // simple fallback: try localStorage as synchronous storage for build-time
        const raw = globalThis.localStorage?.getItem(key)
        return raw ? JSON.parse(raw) as T : defaultValue
      }
    }
    catch (e) {
      // ignore
    }
    return defaultValue
  }

  async function writeIDB(val: T) {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(val))
    }
    catch (e) {}
  }

  // If consumer provided a ref-like, keep it in sync (best-effort)
  if (refObj && typeof refObj.value !== 'undefined') {
    // no-op here; runtime will update ref directly
  }

  return { readIDB, writeIDB }
}

export default useAsyncIDBKeyval
