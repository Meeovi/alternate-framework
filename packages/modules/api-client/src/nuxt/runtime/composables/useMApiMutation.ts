export function useMApiMutation<T = any>(query: string) {
  const client = useMApiClient()
  const loading = ref(false)
  const error = ref<any>(null)

  const execute = async (variables?: Record<string, any>): Promise<T | null> => {
    loading.value = true
    error.value = null
    try {
      return await client.mutate<T>(query, variables)
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    execute,
    loading,
    error
  }
}
