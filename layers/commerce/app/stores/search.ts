import { defineStore } from '#imports'
import { computed, ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref<any[]>([])
  const loading = ref(false)
  const provider = ref<string>('default')
  const filters = ref<Record<string, any>>({})

  function setQuery(q: string) {
    query.value = q
  }

  function setResults(res: any[]) {
    results.value = res
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function setProvider(name: string) {
    provider.value = name
  }

  function setFilters(f: Record<string, any>) {
    filters.value = f
  }

  const hasResults = computed(() => results.value.length > 0)

  return { query, results, loading, provider, filters, setQuery, setResults, setLoading, setProvider, setFilters, hasResults }
})
