import { defineStore } from 'pinia';
export const useSearchStore = defineStore('search', () => {
    const query = ref('');
    const results = ref([]);
    const loading = ref(false);
    const provider = ref('default');
    const filters = ref({});
    function setQuery(q) {
        query.value = q;
    }
    function setResults(res) {
        results.value = res;
    }
    function setLoading(val) {
        loading.value = val;
    }
    function setProvider(name) {
        provider.value = name;
    }
    function setFilters(f) {
        filters.value = f;
    }
    const hasResults = computed(() => results.value.length > 0);
    return { query, results, loading, provider, filters, setQuery, setResults, setLoading, setProvider, setFilters, hasResults };
});
