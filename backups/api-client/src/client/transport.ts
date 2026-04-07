import type {
  GraphqlErrorLike,
  GraphqlRequestOptions,
  GraphqlRestTransport,
  GraphqlRestTransportOptions,
  RestRequestOptions,
} from './types'

const DEFAULT_TIMEOUT_MS = 10000

export const DEFAULT_UNSUPPORTED_GRAPHQL_PATTERNS = [
  /cannot query field/i,
  /unknown argument/i,
  /not support(?:ed)? graphql/i,
]

export class ApiTransportError extends Error {
  status?: number
  details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiTransportError'
    this.status = status
    this.details = details
  }
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function trimLeadingSlash(value: string): string {
  return value.replace(/^\/+/, '')
}

export function joinUrl(base: string, path: string): string {
  if (!base) {
    return path.startsWith('/') ? path : `/${path}`
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${trimTrailingSlash(base)}/${trimLeadingSlash(path)}`
}

export function buildUrl(path: string, query?: Record<string, any>, base = ''): string {
  const target = joinUrl(base, path)

  if (!query || !Object.keys(query).length) {
    return target
  }

  const [pathname, search = ''] = target.split('?')
  const searchParams = new URLSearchParams(search)

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

export function shouldIncludeCredentials(url: string): boolean {
  if (url.startsWith('/')) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  try {
    return new URL(url, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

export async function executeRequest(
  url: string,
  init: RequestInit,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS)
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined
  const fetchImpl = options.fetchImpl || globalThis.fetch.bind(globalThis)

  try {
    return await fetchImpl(url, {
      ...init,
      signal: controller?.signal,
      credentials: init.credentials || (shouldIncludeCredentials(url) ? 'include' : 'same-origin'),
    })
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

function resolveBody(body: RestRequestOptions['body']): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined
  }

  if (
    typeof body === 'string'
    || body instanceof FormData
    || body instanceof URLSearchParams
    || body instanceof Blob
    || body instanceof ArrayBuffer
  ) {
    return body as BodyInit
  }

  return JSON.stringify(body)
}

function resolveHeaders(
  baseHeaders: Record<string, string>,
  extraHeaders?: Record<string, string>,
  body?: RestRequestOptions['body'],
): Record<string, string> {
  const headers = {
    Accept: 'application/json',
    ...baseHeaders,
    ...extraHeaders,
  }

  if (!(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

export async function executeJsonRequest<T>(
  url: string,
  init: RequestInit,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<T> {
  const response = await executeRequest(url, init, options)

  const body = await parseJsonResponse<any>(response).catch(() => null)

  if (!response.ok) {
    throw new ApiTransportError(
      body?.message || response.statusText || `Request failed with status ${response.status}`,
      response.status,
      body,
    )
  }

  return body as T
}

export function shouldFallbackFromGraphqlError(
  error: unknown,
  patterns: RegExp[] = DEFAULT_UNSUPPORTED_GRAPHQL_PATTERNS,
): boolean {
  if (!(error instanceof ApiTransportError)) {
    return false
  }

  if ([404, 405, 406, 415, 500, 501, 502, 503].includes(error.status || 0)) {
    return true
  }

  const details = Array.isArray(error.details) ? error.details : []
  const messages = details
    .map((entry) => (entry as GraphqlErrorLike)?.message || '')
    .filter(Boolean)

  return messages.some((message) => patterns.some((pattern) => pattern.test(message)))
}

export function createGraphqlRestTransport(options: GraphqlRestTransportOptions): GraphqlRestTransport {
  const fetchImpl = options.fetchImpl || globalThis.fetch.bind(globalThis)

  const graphql = async <T = any>(query: string, requestOptions: GraphqlRequestOptions = {}): Promise<T> => {
    const response = await executeJsonRequest<{ data?: T; errors?: GraphqlErrorLike[] }>(
      options.graphqlEndpoint,
      {
        method: 'POST',
        headers: resolveHeaders(options.headers?.() || {}, requestOptions.headers, { query, variables: requestOptions.variables }),
        body: JSON.stringify({ query, variables: requestOptions.variables }),
        credentials: requestOptions.credentials,
      },
      {
        timeoutMs: options.timeoutMs,
        fetchImpl,
      },
    )

    if (response.errors?.length) {
      throw new ApiTransportError('GraphQL Error', 200, response.errors)
    }

    return response.data as T
  }

  const rest = async <T = any>(path: string, requestOptions: RestRequestOptions = {}): Promise<T> => {
    const body = resolveBody(requestOptions.body)
    return executeJsonRequest<T>(
      buildUrl(path, requestOptions.query, requestOptions.baseUrl ?? options.restEndpoint ?? ''),
      {
        method: requestOptions.method || 'GET',
        headers: resolveHeaders(options.headers?.() || {}, requestOptions.headers, requestOptions.body),
        body,
        credentials: requestOptions.credentials,
      },
      {
        timeoutMs: options.timeoutMs,
        fetchImpl,
      },
    )
  }

  const internal = async <T = any>(path: string, requestOptions: Omit<RestRequestOptions, 'baseUrl'> = {}): Promise<T> => {
    return rest<T>(path, {
      ...requestOptions,
      baseUrl: options.internalBase ?? '',
    })
  }

  const withGraphqlFallback = async <T>(graphqlExecutor: () => Promise<T>, restExecutor: () => Promise<T>): Promise<T> => {
    try {
      return await graphqlExecutor()
    } catch (error) {
      if (!shouldFallbackFromGraphqlError(error, options.unsupportedGraphqlPatterns)) {
        throw error
      }

      return await restExecutor()
    }
  }

  return {
    graphql,
    rest,
    internal,
    withGraphqlFallback,
  }
}