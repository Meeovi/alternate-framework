import { ref } from 'vue'

export function useLoading() {
  const active = ref<Record<string, boolean>>({})

  function startLoading(key = 'default') {
    active.value[key] = true
  }

  function stopLoading(key = 'default') {
    delete active.value[key]
  }

  function isLoading(key = 'default') {
    return Boolean(active.value[key])
  }

  return { startLoading, stopLoading, isLoading, active }
}

export default useLoading
