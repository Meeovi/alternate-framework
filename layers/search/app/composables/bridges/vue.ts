import { ref, computed } from 'vue'
import type { SearchManager } from '../core/SearchManager'

// Vue bridge: accept a SearchManager instance to stay adapter-agnostic.
export function useSearch(manager?: SearchManager) {
  if (!manager) throw new Error('SearchManager instance is required for Vue bridge')
  const mgr = manager as SearchManager

  const query = ref(mgr.context.state.query)
  const page = ref(mgr.context.state.page)
  const pageSize = ref(mgr.context.state.pageSize)

  const results = ref<any[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function run() {
    loading.value = true
    mgr.context.setQuery(query.value)
    mgr.context.setPage(page.value)
    mgr.context.setPageSize(pageSize.value)

    const res = await mgr.search()
    results.value = res.items
    total.value = res.total
    loading.value = false
  }

  return {
    query,
    page,
    pageSize,
    results: computed(() => results.value),
    total: computed(() => total.value),
    loading: computed(() => loading.value),
    search: run
  }
}