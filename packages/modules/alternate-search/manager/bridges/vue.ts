import { computed, ref } from "vue";
import type { SearchManager } from "../core/SearchManager";

export function useVueSearch(manager?: SearchManager) {
  if (!manager) throw new Error("SearchManager instance is required for Vue bridge");

  const query = ref(manager.context.state.query);
  const page = ref(manager.context.state.page);
  const pageSize = ref(manager.context.state.pageSize);
  const results = ref<any[]>([]);
  const total = ref(0);
  const loading = ref(false);

  async function search() {
    loading.value = true;
    manager.context.setQuery(query.value);
    manager.context.setPage(page.value);
    manager.context.setPageSize(pageSize.value);

    const res = (await manager.search()) as any;
    results.value = res.items;
    total.value = res.total;
    loading.value = false;
  }

  return {
    query,
    page,
    pageSize,
    results: computed(() => results.value),
    total: computed(() => total.value),
    loading: computed(() => loading.value),
    search,
  };
}
