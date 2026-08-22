import { defineEventHandler, readBody, createError } from 'h3'
/**
 * POST /api/commerce/driver
 *
 * Proxies commerce-driver method calls to the server-side commerce adapter
 * (`nuxtApp.$sdk.commerce` or the static SDK from `alternate-core`).
 *
 * The frontend `getCommerceClient()` falls back to this endpoint when the
 * server-injected SDK is not available in the browser context (after
 * `initGateway()` is guarded to server-only execution).
 *
 * Request body:
 *   { method: string, args?: unknown[] }
 *
 * Response: whatever the commerce driver method returns.
 */

type AnyCommerceDriver = Record<string, (...args: any[]) => Promise<any>>

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { method, args = [] } = body as { method: string; args?: unknown[] }

  if (!method || typeof method !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'method (string) is required in the request body' })
  }

  // Access the server-side commerce driver. useNuxtApp isn't a real,
  // resolvable binding in a Nitro server route (no import wires it up, and
  // Nitro doesn't auto-import it here) — referencing it unguarded threw an
  // uncaught ReferenceError/module-resolution error on every request,
  // turning what should be a clean 503 "not configured" response into a
  // raw 500. Guard the whole lookup so any failure to resolve falls through
  // to the same "not configured" path the code already handles below.
  let client: AnyCommerceDriver | undefined
  try {
    const nuxtApp: any = typeof useNuxtApp === 'function' ? useNuxtApp() : undefined
    client = nuxtApp?.$sdk?.commerce
  } catch {
    // useNuxtApp not available in this server context
  }

  // Fallback to static SDK
  if (!client) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const staticSdk = require('alternate-core')
      client = staticSdk?.sdk?.commerce
    } catch {
      // alternate-core not available
    }
  }

  if (!client) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Commerce driver is not configured on the server',
    })
  }

  const fn = client[method as keyof AnyCommerceDriver]

  if (typeof fn !== 'function') {
    throw createError({
      statusCode: 404,
      statusMessage: `Commerce driver method "${method}" is not available`,
    })
  }

  try {
    return await fn.apply(client, args as any[])
  } catch (error: any) {
    throw createError({
      statusCode: error?.$statusCode || error?.statusCode || 502,
      statusMessage: error?.message || `Commerce driver method "${method}" failed`,
      data: error?.data || error?.details,
    })
  }
})
