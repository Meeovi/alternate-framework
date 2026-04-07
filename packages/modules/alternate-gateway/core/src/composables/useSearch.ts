import { shallowRef, Ref } from 'vue'

// Lightweight search client wrapper exported from core so layers can depend
// on a stable API surface. Provides a safe fallback when no app-level
// search client is present.
export function useSearch(): { client: Ref<any>; createQuery: (opts?: any) => any } {
  const maybe = (globalThis as any).useSearchClient || (globalThis as any).searchClient
  if (typeof maybe === 'function') {
    try {
      const s = maybe()
      return { client: s.client ?? s, createQuery: s.createQuery ?? ((o: any) => ({ ...o })) }
    } catch (e) {
      // fallthrough
    }
  }

  const client = shallowRef<any>(null)
  function createQuery(opts?: any) {
    return { query: opts || {} }
  }
  return { client, createQuery }
}

export default useSearch
