import type { MApiClient, MApiClientOptions } from './types'

export function createMApiClient(options: MApiClientOptions): MApiClient {
  const doFetch = async <T>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> => {
    const res = await fetch(options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers?.() || {})
      },
      body: JSON.stringify({ query, variables })
    })

    const json = await res.json()
    if (json.errors) {
      const error = new Error('GraphQL Error')
      ;(error as any).details = json.errors
      throw error
    }
    return json.data
  }

  return {
    query: doFetch,
    mutate: doFetch
  }
}
