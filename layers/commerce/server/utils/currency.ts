/**
 * Server-side currency utilities.
 *
 * These helpers are intentionally kept server-side only so that server API
 * routes and Nitro plugins can share them without importing from the
 * `app/` (client) directory.
 */

/**
 * Converts a cents value to a dollar float with 2 decimal places.
 */
export function centsToDollars(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

/**
 * Converts a dollar float to cents (integer).
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}
