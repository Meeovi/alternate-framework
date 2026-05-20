import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useRegistryStore = defineStore('registry', () => {
    const activeAdapters = ref({});
    const providers = ref([]);
    function registerAdapter(type, name) {
        activeAdapters.value[type] = name;
    }
    function setProviders(list) {
        providers.value = list;
    }
    return { activeAdapters, providers, registerAdapter, setProviders };
});
