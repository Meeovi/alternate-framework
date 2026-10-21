/**
 * Production: no internals in 5xx responses.
 *
 * Many routes wrap an upstream failure as
 *   createError({ statusCode: e.statusCode || 500, statusMessage: e.message, data: e.details })
 * which hands the browser whatever PayPal / Shippo / Directus /
 * Postgres said — SQL, hostnames, config hints, ids. Rather than trusting
 * every route to get that right, server errors are rewritten here to a
 * generic message (the full error is logged server-side). 4xx messages are
 * left alone: routes write those for the user ("productName is required").
 *
 * Runs synchronously in Nitro's `error` hook, which h3 calls before the
 * error handler renders the response, so the response sees the rewrite.
 */
const GENERIC: Record<number, string> = {
  500: 'Something went wrong. Please try again.',
  502: 'A service we rely on failed. Please try again.',
  503: 'This is temporarily unavailable. Please try again shortly.',
  504: 'A service we rely on timed out. Please try again.',
}

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) return

  nitroApp.hooks.hook('error', (error, { event }) => {
    const err = error as Error & { statusCode?: number, statusMessage?: string, data?: unknown, unhandled?: boolean }
    const status = Number(err.statusCode) || 500
    if (status < 500) return

    // Keep the real reason in the server log (unhandled errors are already
    // logged by Nitro itself).
    if (!err.unhandled) {
      console.error(`[error] ${status} ${event?.method ?? ''} ${event?.path?.replace(/\?.*$/, '') ?? ''}: ${err.statusMessage || err.message}`)
    }

    const message = GENERIC[status] ?? GENERIC[500]!
    err.statusMessage = message
    err.message = message
    err.data = undefined
  })
})
