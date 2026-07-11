import type { APIResponse, Result, NormalizedEndpoint, NormalizedSource, NormalizedService } from '../types'

export const unwrapAPI = <T>(response: APIResponse<T>): Result<T> => {
  if (response.error) {
    return {
      ok: false,
      error: response.error
    }
  }
  return {
    ok: true,
    data: response.data as T
  }
}

export const normalizeEndpoints = (raw: any[], sourceName: string): NormalizedEndpoint[] => {
  return raw.map((item, index) => ({
    id: String(item.id ?? index),
    name: item.name ?? item.path ?? String(index),
    path: item.path ?? '/',
    method: item.method ?? 'GET',
    sourceName
  }))
}

export const normalizeSource = (raw: any): NormalizedSource => ({
  id: raw.id ?? raw.name ?? '',
  name: raw.name ?? raw.id ?? '',
  type: raw.type ?? 'unknown',
  endpoint: raw.endpoint ?? raw.url ?? ''
})

export const normalizeService = (raw: any): NormalizedService => ({
  id: raw.id ?? raw.name ?? '',
  name: raw.name ?? raw.id ?? '',
  endpoints: raw.endpoints ?? [],
  sources: Array.isArray(raw.sources) ? raw.sources.map(normalizeSource) : []
})
