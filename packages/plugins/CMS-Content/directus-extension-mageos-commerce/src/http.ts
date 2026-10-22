import type { Request, Response, Router } from 'express'
import type { ICommerceAdapter } from './adapters/base.adapter'
import type { CacheResult, SwrCache } from './cache/swr-cache'
import type { CommerceConfig } from './config'
import { CommerceError } from './errors'

export type Logger = { info: (...a: unknown[]) => void, warn: (...a: unknown[]) => void, error: (...a: unknown[]) => void }

/** Directus sets this on every request (null fields for anonymous callers). */
type Accountability = { user?: string | null, role?: string | null, roles?: string[], admin?: boolean }

/** What every route module gets. */
export interface RouteContext {
  router: Router
  config: CommerceConfig
  cache: SwrCache
  logger: Logger
  /** The adapter, or the reason it isn't configured. */
  backend(): ICommerceAdapter
}

export function sendError(res: Response, error: unknown, logger: Logger) {
  const known = error instanceof CommerceError
  if (!known) logger.error(error, '[mageos-commerce] unexpected error')
  else if (error.upstream || error.code === 'NOT_CONFIGURED') logger.warn(`[mageos-commerce] ${error.code}: ${error.message}`)
  res.set('Cache-Control', 'no-store')
  res.status(known ? error.status : 500).json({
    errors: [{
      message: known ? error.message : 'Internal error',
      extensions: { code: known ? error.code : 'INTERNAL' },
    }],
  })
}

export const route = (logger: Logger, handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response) => { handler(req, res).catch((error) => sendError(res, error, logger)) }

/** Public catalog answers: CDN-cacheable for the cache TTL. */
export function catalogHeaders(res: Response, config: CommerceConfig, result: CacheResult<unknown>) {
  res.set('X-Commerce-Cache', result.status)
  res.set('Age', String(Math.floor(result.age)))
  // A stale-if-error answer is cached briefly so the CDN retries Mage-OS soon.
  res.set('Cache-Control', result.status === 'STALE-IF-ERROR'
    ? 'public, s-maxage=30'
    : `public, s-maxage=${config.cache.ttl}, stale-while-revalidate=${config.cache.staleWhileRevalidate}`)
}

/** Per-customer / admin answers: never stored anywhere. */
export function privateHeaders(res: Response) {
  res.set('Cache-Control', 'private, no-store')
}

function accountability(req: Request): Accountability | null {
  return (req as Request & { accountability?: Accountability | null }).accountability ?? null
}

export const isSignedIn = (req: Request) => !!accountability(req)?.user

/**
 * Privileged routes: a Directus admin, or a user/role listed in
 * MAGEOS_TRUSTED_USERS / MAGEOS_TRUSTED_ROLES (the app server's token user).
 */
export function requireTrusted(req: Request, config: CommerceConfig) {
  const a = accountability(req)
  const roles = [...(a?.roles ?? []), ...(a?.role ? [a.role] : [])]
  const trusted = !!a && (a.admin === true
    || (!!a.user && config.trusted.users.includes(a.user))
    || roles.some((role) => config.trusted.roles.includes(role)))
  if (!trusted) {
    throw new CommerceError('FORBIDDEN', a?.user
      ? 'This Directus user may not use this route (add it to MAGEOS_TRUSTED_USERS)'
      : 'Authenticate with a trusted Directus token to use this route')
  }
}

/** A capability the backend may not have → 501. */
export function capability<T>(value: T | undefined, name: string): T {
  if (!value) throw new CommerceError('NOT_SUPPORTED', `This commerce backend doesn't support ${name}`)
  return value
}

// ---------------------------------------------------------------------------
// Request bodies / params
// ---------------------------------------------------------------------------

export type Body = Record<string, unknown>

export function body(req: Request): Body {
  const value = req.body
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CommerceError('INVALID_QUERY', 'Send a JSON object body')
  return value as Body
}

export function text(source: Body, key: string, options?: { max?: number, required?: true }): string
export function text(source: Body, key: string, options: { max?: number, required: false }): string | undefined
export function text(source: Body, key: string, { max = 255, required = true }: { max?: number, required?: boolean } = {}): string | undefined {
  const value = source[key]
  if (value === undefined || value === null || value === '') {
    if (required) throw new CommerceError('INVALID_QUERY', `${key} is required`)
    return undefined
  }
  if (typeof value !== 'string' || value.trim().length > max) throw new CommerceError('INVALID_QUERY', `${key} must be text of at most ${max} characters`)
  return value.trim()
}

export function number(source: Body, key: string, { min = 0, integer = false, required = true } = {}): number | undefined {
  const value = source[key]
  if (value === undefined || value === null || value === '') {
    if (required) throw new CommerceError('INVALID_QUERY', `${key} is required`)
    return undefined
  }
  const n = Number(value)
  if (!Number.isFinite(n) || n < min || (integer && !Number.isInteger(n))) {
    throw new CommerceError('INVALID_QUERY', `${key} must be ${integer ? 'a whole number' : 'a number'} ≥ ${min}`)
  }
  return n
}

export function list<T>(source: Body, key: string, max: number, item: (value: Body, index: number) => T, { required = true } = {}): T[] {
  const value = source[key]
  if (value === undefined || value === null) {
    if (required) throw new CommerceError('INVALID_QUERY', `${key} is required`)
    return []
  }
  if (!Array.isArray(value) || value.length > max) throw new CommerceError('INVALID_QUERY', `${key} must be a list of at most ${max}`)
  return value.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new CommerceError('INVALID_QUERY', `${key}[${index}] must be an object`)
    return item(entry as Body, index)
  })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function email(value: unknown, key = 'email'): string {
  if (typeof value !== 'string' || value.length > 254 || !EMAIL_RE.test(value.trim())) throw new CommerceError('INVALID_QUERY', `${key} must be an email address`)
  return value.trim().toLowerCase()
}

/** Numeric backend ids in URLs. */
export function idParam(value: string | undefined, name: string): string {
  if (!value || !/^\d{1,12}$/.test(value)) throw new CommerceError('INVALID_QUERY', `Invalid ${name}`)
  return value
}
