type QueryKey = string | number | boolean | null | undefined | Array<unknown>
type MaybeGetter<T> = T | (() => T)

function resolveValue<T>(input: MaybeGetter<T>): T {
  if (typeof input === 'function') {
    return (input as () => T)()
  }
  return input
}

function normalizeAsyncKey(key: QueryKey): string {
  if (typeof key === 'string') {
    return key
  }

  try {
    return JSON.stringify(key ?? '')
  } catch {
    return String(key ?? '')
  }
}

export function useMApiQuery<T = any>(
  key: MaybeGetter<QueryKey>,
  query: string,
  variables?: MaybeGetter<Record<string, any> | undefined>
) {
  const client = useMApiClient()
  const resolvedKey = computed(() => normalizeAsyncKey(resolveValue(key)))
  const resolvedVariables = computed(() => resolveValue(variables as MaybeGetter<Record<string, any> | undefined>))

  const { data, pending, error } = useAsyncData(
    () => `mapi:${resolvedKey.value}`,
    () => client.query<T>(query, resolvedVariables.value),
    {
      server: true,
      watch: [resolvedKey, resolvedVariables]
    }
  )

  return {
    data,
    loading: pending,
    error
  }
}
