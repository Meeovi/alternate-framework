import type { TransportAdapter, RequestOptions, APIResponse } from '@meeovi/types'

export interface StarterTransportConfig {
  baseUrl: string
  apiKey?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const createStarterTransport = (config: StarterTransportConfig): TransportAdapter => {
  const fetchImpl = config.fetchImpl ?? (globalThis as any).fetch

  async function doFetchWithRetries<T>(url: string, init: RequestInit, retries: number, retryDelayMs: number, timeoutMs?: number): Promise<APIResponse<T>> {
    let attempt = 0
    while (true) {
      attempt++
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
      const signal = controller?.signal
      const timeout = timeoutMs ? setTimeout(() => controller?.abort(), timeoutMs) : undefined

      try {
        const res = await (fetchImpl as any)(url, { ...init, signal })
        const text = await res.text().catch(() => '')
        let data: any
        try { data = text ? JSON.parse(text) : null } catch (e) { data = text }

        if (!res.ok) {
          const error = data?.message || res.statusText || `HTTP ${res.status}`
          return { status: res.status, data: (null as any) as T, error }
        }

        return { status: res.status, data }
      } catch (err: any) {
        const isAbort = err && err.name === 'AbortError'
        const shouldRetry = attempt <= retries && (isAbort || err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND')
        if (!shouldRetry) {
          return { status: 500, data: (null as any) as T, error: err?.message || 'Transport error' }
        }
        await sleep(retryDelayMs)
      } finally {
        if (timeout) clearTimeout(timeout)
      }
    }
  }

  return {
    async request<T>(method: any, path: string | URL, options: RequestOptions = {}): Promise<APIResponse<T>> {
      try {
        const url = new URL(path.toString(), config.baseUrl)

        if (options.query) {
          Object.entries(options.query).forEach(([key, value]) => {
            url.searchParams.set(key, String(value))
          })
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          ...(options.headers || {})
        }

        const init: RequestInit = {
          method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        }

        const retries = typeof config.retries === 'number' ? config.retries : 1
        const retryDelayMs = typeof config.retryDelayMs === 'number' ? config.retryDelayMs : 250

        return await doFetchWithRetries<T>(url.toString(), init, retries, retryDelayMs, config.timeoutMs)
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