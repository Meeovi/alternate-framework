export type CommerceErrorCode =
  | 'INVALID_QUERY'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_OFFLINE'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_AUTH'
  | 'UPSTREAM_ERROR'
  | 'NOT_CONFIGURED'
  | 'REJECTED'
  | 'NOT_SUPPORTED'

const STATUS: Record<CommerceErrorCode, number> = {
  INVALID_QUERY: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  // The backend refused a write (validation, nothing left to refund, …).
  REJECTED: 422,
  NOT_SUPPORTED: 501,
  UPSTREAM_AUTH: 502,
  UPSTREAM_ERROR: 502,
  UPSTREAM_OFFLINE: 503,
  UPSTREAM_UNAVAILABLE: 503,
  NOT_CONFIGURED: 503,
  UPSTREAM_TIMEOUT: 504,
}

/** Errors the commerce API answers with; `upstream` ones may be served stale from cache instead. */
export class CommerceError extends Error {
  readonly status: number
  constructor(readonly code: CommerceErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'CommerceError'
    this.status = STATUS[code]
  }

  /** The backend failed (not the request) — a cached copy is a reasonable answer. */
  get upstream(): boolean {
    return this.code.startsWith('UPSTREAM_')
  }
}

const NETWORK_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'ENETUNREACH', 'EPIPE', 'UND_ERR_SOCKET', 'UND_ERR_CONNECT_TIMEOUT'])

/** Maps a fetch() failure (timeout, DNS, refused connection, …) to a CommerceError. */
export function fromFetchError(error: unknown, backend: string): CommerceError {
  if (error instanceof CommerceError) return error
  const err = error as { name?: string, code?: string, cause?: { code?: string } }
  if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
    return new CommerceError('UPSTREAM_TIMEOUT', `${backend} did not respond in time`, { cause: error })
  }
  const code = err?.cause?.code ?? err?.code
  if (code && NETWORK_CODES.has(code)) {
    return new CommerceError('UPSTREAM_OFFLINE', `${backend} is unreachable (${code})`, { cause: error })
  }
  return new CommerceError('UPSTREAM_ERROR', `${backend} request failed`, { cause: error })
}
