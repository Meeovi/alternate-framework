import type { TransportAdapter, RequestOptions, APIResponse } from '@mframework/core'

export const createTransport = (config: { baseUrl: string; apiKey?: string }): TransportAdapter => {
  return {
    async request<T>(method: any, path: string | URL, options: RequestOptions = {}): Promise<APIResponse<T>> {
      try {
        const url = new URL(path, config.baseUrl)

        if (options.query) {
          Object.entries(options.query).forEach(([key, value]) => {
            url.searchParams.set(key, String(value))
          })
        }

        const res = await fetch(url.toString(), {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
            ...(options.headers || {})
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        })

        const data = await res.json().catch(() => null)

        if (!res.ok) {
          return {
            status: res.status,
            data: (null as any) as T,
            error: data?.message || 'Unknown error'
          }
        }

        return {
          status: res.status,
          data
        }
      } catch (err: any) {
        return {
          status: 500,
          data: (null as any) as T,
          error: err.message || 'Transport error'
        }
      }
    }
  }
}
