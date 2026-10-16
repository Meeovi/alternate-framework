import { drizzle } from 'drizzle-orm/postgres-js'

// Default db instance for the application (better-auth + all other queries).
// Only public schema tables are exposed: public.users, public.sessions, public.accounts.
//
// postgres-js defaults to `max: 10` connections and `idle_timeout: 0`
// (idle sockets are never closed). On a multi-instance / serverless deploy
// that lets idle connections pile up against Postgres's own
// `max_connections`. The pool is tuned via env here so it can be sized to
// the target platform (lower `max` behind PgBouncer / on serverless,
// higher on a single long-lived node server) without a code change; the
// fallbacks are safe for a small always-on server.
const poolMax = Number(process.env.NUXT_DATABASE_POOL_MAX) || 10
const idleTimeout = Number(process.env.NUXT_DATABASE_POOL_IDLE_TIMEOUT) || 20
const connectTimeout = Number(process.env.NUXT_DATABASE_CONNECT_TIMEOUT) || 15

// Encrypt the connection to any non-local database. postgres-js connects in
// plaintext unless told otherwise, and the production database (Supabase)
// accepts that — so every query, password hash and session token crossed
// the internet unencrypted. An explicit `sslmode` in the URL, or
// NUXT_DATABASE_SSL=disable for a local/dev server without TLS, still wins.
// ('require' encrypts without verifying the certificate; set
// sslmode=verify-full in the URL with the provider's CA to also verify it.)
const databaseUrl = process.env.NUXT_DATABASE_URL ?? ''
const isLocalDb = /@(localhost|127\.0\.0\.1|\[?::1\]?)(:|\/|$)/.test(databaseUrl)
const ssl = /[?&]sslmode=/.test(databaseUrl) || process.env.NUXT_DATABASE_SSL === 'disable' || isLocalDb
  ? undefined
  : 'require' as const

export const db = drizzle({
  connection: {
    url: databaseUrl,
    max: poolMax,
    idle_timeout: idleTimeout,
    connect_timeout: connectTimeout,
    ...(ssl ? { ssl } : {}),
  },
})
