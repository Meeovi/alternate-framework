import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRegistryStore = defineStore('registry', () => {
  const activeAdapters = ref<{ [key: string]: string }>({})
  const providers = ref<string[]>([])

  function registerAdapter(type: string, name: string) {
    activeAdapters.value[type] = name
  }

  function setProviders(list: string[]) {
    providers.value = list
  }

  return { activeAdapters, providers, registerAdapter, setProviders }
})
