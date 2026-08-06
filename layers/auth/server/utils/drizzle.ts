import { drizzle } from 'drizzle-orm/postgres-js'

// Default db instance for the application (better-auth + all other queries).
// Only public schema tables are exposed: public.users, public.sessions, public.accounts.
export const db = drizzle(`${process.env.NUXT_DATABASE_URL}`)
