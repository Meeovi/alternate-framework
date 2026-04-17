import { ref } from '#imports'

export function useCommerceQuery(document: unknown, variables?: Record<string, unknown>) {
  const data = ref<any>(null)
  const error = ref<any>(null)
  const loading = ref(false)

  const run = async (nextVariables?: Record<string, unknown>) => {
    loading.value = true
    error.value = null
    try {
      const nuxtApp = useNuxtApp() as any
      const client = nuxtApp?.$commerceClient
      if (client && typeof client.query === 'function') {
        const result = await client.query({ document, variables: nextVariables ?? variables ?? {} })
        data.value = result?.data ?? result ?? null
      } else {
        data.value = null
      }
      return data.value
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  void run()

  return {
    data,
    error,
    loading,
    refetch: run,
  }
}

export default useCommerceQuery
