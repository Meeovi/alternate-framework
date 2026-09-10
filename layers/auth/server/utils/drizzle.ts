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

export const db = drizzle({
  connection: {
    url: process.env.NUXT_DATABASE_URL ?? '',
    max: poolMax,
    idle_timeout: idleTimeout,
    connect_timeout: connectTimeout,
  },
})
