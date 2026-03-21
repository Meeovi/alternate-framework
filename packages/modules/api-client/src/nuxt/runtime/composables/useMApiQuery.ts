export function useMApiQuery<T = any>(
  key: string,
  query: string,
  variables?: Record<string, any>
) {
  const client = useMApiClient()

  const { data, pending, error } = useAsyncData(
    key,
    () => client.query<T>(query, variables),
    { server: true }
  )

  return {
    data,
    loading: pending,
    error
  }
}
