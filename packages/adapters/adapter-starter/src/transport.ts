import type { TransportAdapter, RequestOptions, APIResponse } from 'alternate-gateway'

const stringifyQueryValue = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export const createStarterTransport = (config: { baseUrl: string; apiKey?: string }): TransportAdapter => {
  return {
    async request<T>(method: any, path: string | URL, options: RequestOptions = {}): Promise<APIResponse<T>> {
      try {
        const url = new URL(path, config.baseUrl)

        if (options.query) {
          Object.entries(options.query).forEach(([key, value]) => {
            const serialized = stringifyQueryValue(value)
            if (serialized !== null) {
              url.searchParams.set(key, serialized)
            }
          })
        }

        const hasBody = options.body !== undefined && options.body !== null && method !== 'GET' && method !== 'HEAD'
        const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

        const res = await fetch(url.toString(), {
          method,
          headers: {
            ...(!isFormData && hasBody ? { 'Content-Type': 'application/json' } : {}),
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
            ...(options.headers || {})
          },
          body: hasBody
            ? (isFormData ? (options.body as BodyInit) : JSON.stringify(options.body))
            : undefined
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