import { shallowRef } from 'vue';
// Lightweight search client wrapper exported from core so layers can depend
// on a stable API surface. Provides a safe fallback when no app-level
// search client is present.
export function useSearch() {
    const maybe = globalThis.useSearchClient || globalThis.searchClient;
    if (typeof maybe === 'function') {
        try {
            const s = maybe();
            return { client: s.client ?? s, createQuery: s.createQuery ?? ((o) => ({ ...o })) };
        }
        catch (e) {
            // fallthrough
        }
    }
    const client = shallowRef(null);
    function createQuery(opts) {
        return { query: opts || {} };
    }
    return { client, createQuery };
}
export default useSearch;
