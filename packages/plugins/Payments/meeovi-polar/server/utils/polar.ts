import { Polar } from '@polar-sh/sdk'
import { createError, getRequestHeader, getRequestURL, isError } from 'h3'
import type { H3Event } from 'h3'

/**
 * Polar (polar.sh) for M Framework. Customers are matched to app users by
 * Polar's `externalId` (the app's user id), so nothing is stored here.
 */

export type PolarConfig = {
  accessToken: string
  server: 'sandbox' | 'production'
  webhookSecret: string
  successUrl: string
  returnUrl: string
  products: Record<string, string>
  sessionEndpoint: string
}

const clean = (value: unknown) => String(value ?? '').trim().replace(/^(['"])(.*)\1$/, '$2')

export function polarConfig(event?: H3Event): PolarConfig {
  const own = (useRuntimeConfig(event) as Record<string, any>).meeoviPolar ?? {}
  // NUXT_MEEOVI_POLAR_* (runtime config) first, then the names the app used
  // before this module, so existing env files keep working.
  const env = process.env
  return {
    accessToken: clean(own.accessToken || env.NUXT_POLAR_ACCESS_TOKEN),
    server: clean(own.server !== 'sandbox' ? own.server : env.NUXT_POLAR_SERVER || own.server) === 'production' ? 'production' : 'sandbox',
    webhookSecret: clean(own.webhookSecret || env.NUXT_POLAR_WEBHOOK_SECRET),
    successUrl: clean(own.successUrl && own.successUrl !== '/' ? own.successUrl : env.POLAR_SUCCESS_URL) || '/',
    returnUrl: clean(own.returnUrl) || '/',
    products: Object.fromEntries(Object.entries(own.products ?? {}).map(([slug, id]) => [slug, clean(id)]).filter(([, id]) => id)),
    sessionEndpoint: clean(own.sessionEndpoint) || '/api/auth/get-session',
  }
}

let client: { key: string, polar: Polar } | null = null

/** The Polar API client; 503 when no access token is configured. */
export function usePolar(event?: H3Event): Polar {
  const { accessToken, server } = polarConfig(event)
  if (!accessToken) throw createError({ statusCode: 503, statusMessage: 'Polar is not configured' })
  const key = `${server}:${accessToken}`
  if (client?.key !== key) client = { key, polar: new Polar({ accessToken, server }) }
  return client.polar
}

export type PolarUser = { id: string, email: string, name: string | null }

/** The signed-in user (better-auth session), or null. */
export async function polarUser(event: H3Event): Promise<PolarUser | null> {
  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return null
  try {
    const session = await $fetch<{ user?: { id?: string, email?: string, name?: string | null } } | null>(polarConfig(event).sessionEndpoint, { headers: { cookie } })
    const user = session?.user
    return user?.id && user.email ? { id: String(user.id), email: user.email, name: user.name ?? null } : null
  } catch {
    return null
  }
}

export async function requirePolarUser(event: H3Event): Promise<PolarUser> {
  const user = await polarUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in first' })
  return user
}

// Polar ids are UUIDs; slugs are what the app chose in `products`.
const PRODUCT_KEY = /^[\w-]{1,64}$/

/**
 * Product ids for `?products=` (comma-separated slugs or ids). With a
 * `products` map configured, only its products can be bought.
 */
export function resolveProducts(event: H3Event, value: unknown): string[] {
  const keys = String(value ?? '').split(',').map((key) => key.trim()).filter(Boolean)
  if (!keys.length || keys.length > 10 || !keys.every((key) => PRODUCT_KEY.test(key))) {
    throw createError({ statusCode: 400, statusMessage: 'Choose up to 10 products' })
  }
  const allowed = polarConfig(event).products
  if (!Object.keys(allowed).length) return keys
  const ids = new Set(Object.values(allowed))
  return keys.map((key) => {
    const id = allowed[key] ?? (ids.has(key) ? key : null)
    if (!id) throw createError({ statusCode: 404, statusMessage: `Unknown product: ${key}` })
    return id
  })
}

/**
 * An absolute URL on this site for a configured (possibly relative) one:
 * on the app's public site URL, else the request's origin (which behind a
 * proxy may be http unless it sends X-Forwarded-Proto).
 */
export function absoluteUrl(event: H3Event, url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  const site = clean((useRuntimeConfig(event) as Record<string, any>).public?.siteUrl).replace(/\/+$/, '')
  const origin = /^https?:\/\//i.test(site) ? site : getRequestURL(event).origin
  // Kept as is, so Polar's {CHECKOUT_ID} placeholder stays unencoded.
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

/** Polar API errors as an h3 error: their status, without Polar's details. */
export function polarError(error: unknown, action: string): never {
  // Ours (e.g. 503 not configured) pass through as they are.
  if (isError(error)) throw error
  const status = Number((error as { statusCode?: number })?.statusCode)
  console.error(`[polar] ${action} failed:`, (error as Error)?.message ?? error)
  if (status === 404) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (status === 422 || status === 400) throw createError({ statusCode: 400, statusMessage: `Polar refused the ${action}` })
  throw createError({ statusCode: 502, statusMessage: 'Polar is unavailable. Please try again.' })
}
