export const DEFAULT_UNSUPPORTED_GRAPHQL_PATTERNS: RegExp[] = [
  /Cannot query field/i,
  /Unknown argument/i,
  /PersistedQueryNotFound/i,
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

export function joinUrl(base: string, path: string): string {
  if (!base) {
    return path
  }

  if (!path) {
    return base
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${normalizedBase}${normalizedPath}`
}

function toErrorDetails(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  const maybe = payload as Record<string, unknown>
  return maybe.errors || maybe.error || maybe
}

export async function executeJsonRequest<T>(
  url: string,
  init: RequestInit,
  options: { timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = options.timeoutMs
    ? setTimeout(() => controller.abort(), options.timeoutMs)
    : undefined

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : undefined

    if (!response.ok) {
      throw new ApiTransportError(
        response.statusText || 'Request failed',
        response.status,
        toErrorDetails(data),
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiTransportError) {
      throw error
    }

    if (error instanceof Error) {
      throw new ApiTransportError(error.message, 500)
    }

    throw new ApiTransportError('Unexpected transport error', 500, error)
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

type GraphqlOptions = {
  graphqlEndpoint: string
  restEndpoint: string
  timeoutMs?: number
  headers?: () => Record<string, string>
  unsupportedGraphqlPatterns?: RegExp[]
}

function shouldFallback(error: unknown, patterns: RegExp[]): boolean {
  const message = error instanceof Error ? error.message : String(error || '')
  return patterns.some((pattern) => pattern.test(message))
}

export function createGraphqlRestTransport(options: GraphqlOptions) {
  const patterns = options.unsupportedGraphqlPatterns || DEFAULT_UNSUPPORTED_GRAPHQL_PATTERNS

  return {
    async graphql<T>(query: string, payload: { variables?: Record<string, unknown> } = {}) {
      const response = await executeJsonRequest<{ data?: T; errors?: Array<{ message?: string }> }>(
        options.graphqlEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(options.headers ? options.headers() : {}),
          },
          body: JSON.stringify({ query, variables: payload.variables || {} }),
        },
        { timeoutMs: options.timeoutMs },
      )

      if (Array.isArray(response?.errors) && response.errors.length > 0) {
        const message = response.errors[0]?.message || 'GraphQL request failed'
        throw new ApiTransportError(message, 502, response.errors)
      }

      return (response?.data || {}) as T
    },

    async rest<T>(path: string, request: { method?: string; body?: Record<string, unknown> } = {}) {
      const target = joinUrl(options.restEndpoint, path)
      return executeJsonRequest<T>(
        target,
        {
          method: request.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(options.headers ? options.headers() : {}),
          },
          body: request.body ? JSON.stringify(request.body) : undefined,
        },
        { timeoutMs: options.timeoutMs },
      )
    },

    async withGraphqlFallback<T>(graphqlExec: () => Promise<T>, restExec: () => Promise<T>) {
      try {
        return await graphqlExec()
      } catch (error) {
        if (shouldFallback(error, patterns)) {
          return restExec()
        }
        throw error
      }
    },
  }
}
