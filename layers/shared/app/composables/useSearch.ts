// src/composables/useSearch.ts
import { ref } from 'vue'
import { useAdapter } from '../lib/sdk'

export function useSearch() {
  const adapter = useAdapter()
  const results = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function search(term: string) {
    loading.value = true
    error.value = null
    try {
      results.value = await adapter.search.query(term)
    } catch (e: any) {
      error.value = e?.message || 'Search failed'
      results.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    results,
    loading,
    error,
    search
  }
}