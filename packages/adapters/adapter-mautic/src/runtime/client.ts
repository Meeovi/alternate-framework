import type { ModuleOptions } from '../module'

export interface MauticRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null
}

export interface MauticQueryValue {
  [key: string]: string | number | boolean | null | undefined
}

export interface MauticResource<TEntity = unknown, TCreateBody extends MauticRequestOptions['body'] = Record<string, unknown>, TUpdateBody extends MauticRequestOptions['body'] = TCreateBody> {
  list<TResponse = TEntity[]>(query?: MauticQueryValue, options?: Omit<MauticRequestOptions, 'body'>): Promise<TResponse>
  get<TResponse = TEntity>(id: string | number, options?: Omit<MauticRequestOptions, 'body'>): Promise<TResponse>
  create<TResponse = TEntity>(body: TCreateBody, options?: Omit<MauticRequestOptions, 'body'>): Promise<TResponse>
  update<TResponse = TEntity>(id: string | number, body: TUpdateBody, options?: Omit<MauticRequestOptions, 'body'>): Promise<TResponse>
  delete<TResponse = void>(id: string | number, options?: Omit<MauticRequestOptions, 'body'>): Promise<TResponse>
}

export interface MauticClient {
  apiBaseUrl: string
  apiPath: string
  request<T = unknown>(path: string, options?: MauticRequestOptions): Promise<T>
  get<T = unknown>(path: string, options?: Omit<MauticRequestOptions, 'body'>): Promise<T>
  post<T = unknown>(path: string, body?: MauticRequestOptions['body'], options?: Omit<MauticRequestOptions, 'body'>): Promise<T>
  put<T = unknown>(path: string, body?: MauticRequestOptions['body'], options?: Omit<MauticRequestOptions, 'body'>): Promise<T>
  patch<T = unknown>(path: string, body?: MauticRequestOptions['body'], options?: Omit<MauticRequestOptions, 'body'>): Promise<T>
  delete<T = unknown>(path: string, options?: Omit<MauticRequestOptions, 'body'>): Promise<T>
  resource<TEntity = unknown, TCreateBody extends MauticRequestOptions['body'] = Record<string, unknown>, TUpdateBody extends MauticRequestOptions['body'] = TCreateBody>(path: string): MauticResource<TEntity, TCreateBody, TUpdateBody>
  contacts: MauticResource
  forms: MauticResource
  segments: MauticResource
  pages: MauticResource
}

function normalizePath(path: string) {
  const trimmed = path.trim()

  if (!trimmed) {
    return ''
  }

  return `/${trimmed.replace(/^\/+/, '').replace(/\/+$/, '')}`
}

function mergeHeaders(...headersList: Array<HeadersInit | undefined>) {
  const headers = new Headers()

  for (const headerSet of headersList) {
    if (!headerSet) continue

    new Headers(headerSet).forEach((value, key) => {
      headers.set(key, value)
    })
  }

  return headers
}

function buildQuery(query?: MauticQueryValue) {
  if (!query) {
    return ''
  }

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue

    params.set(key, String(value))
  }

  const search = params.toString()
  return search ? `?${search}` : ''
}

function createResource<TEntity = unknown, TCreateBody extends MauticRequestOptions['body'] = Record<string, unknown>, TUpdateBody extends MauticRequestOptions['body'] = TCreateBody>(request: MauticClient['request'], collectionPath: string): MauticResource<TEntity, TCreateBody, TUpdateBody> {
  const basePath = normalizePath(collectionPath)

  return {
    list: (query, options) => request(`${basePath}${buildQuery(query)}`, { ...options, method: 'GET' }),
    get: (id, options) => request(`${basePath}/${id}`, { ...options, method: 'GET' }),
    create: (body, options) => request(basePath, { ...options, method: 'POST', body }),
    update: (id, body, options) => request(`${basePath}/${id}`, { ...options, method: 'PATCH', body }),
    delete: (id, options) => request(`${basePath}/${id}`, { ...options, method: 'DELETE' }),
  }
}

function isBodyInit(body: MauticRequestOptions['body']): body is BodyInit {
  return typeof body !== 'object' || body === null || body instanceof Blob || body instanceof FormData || body instanceof URLSearchParams || body instanceof ArrayBuffer || ArrayBuffer.isView(body)
}

export function createMauticClient(options: ModuleOptions = {}): MauticClient {
  const apiBaseUrl = (options.apiBaseUrl || '').replace(/\/+$/, '')
  const apiPath = normalizePath(options.apiPath || '/api')

  const request = async <T = unknown>(path: string, requestOptions: MauticRequestOptions = {}) => {
    if (!apiBaseUrl) {
      throw new Error('adapter-mautic requires `apiBaseUrl` to be configured')
    }

    const url = new URL(`${apiPath}${normalizePath(path)}`, `${apiBaseUrl}/`)
    const headers = mergeHeaders(
      requestOptions.headers,
      requestOptions.body && !isBodyInit(requestOptions.body) ? { 'content-type': 'application/json' } : undefined,
    )

    const response = await fetch(url, {
      ...requestOptions,
      headers,
      body: requestOptions.body && !isBodyInit(requestOptions.body) ? JSON.stringify(requestOptions.body) : requestOptions.body ?? undefined,
    })

    if (!response.ok) {
      throw new Error(`Mautic request failed with ${response.status} ${response.statusText}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      return await response.json() as T
    }

    return await response.text() as T
  }

  return {
    apiBaseUrl,
    apiPath,
    request,
    get: (path, requestOptions) => request(path, { ...requestOptions, method: 'GET' }),
    post: (path, body, requestOptions) => request(path, { ...requestOptions, method: 'POST', body }),
    put: (path, body, requestOptions) => request(path, { ...requestOptions, method: 'PUT', body }),
    patch: (path, body, requestOptions) => request(path, { ...requestOptions, method: 'PATCH', body }),
    delete: (path, requestOptions) => request(path, { ...requestOptions, method: 'DELETE' }),
    resource: path => createResource(request, path),
    contacts: createResource(request, '/contacts'),
    forms: createResource(request, '/forms'),
    segments: createResource(request, '/segments'),
    pages: createResource(request, '/pages'),
  }
}