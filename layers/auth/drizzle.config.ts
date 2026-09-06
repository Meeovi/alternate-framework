import 'dotenv/config';
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/migrations/schema.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL!
  },
  // Kept narrow on purpose — this schema.ts also holds ~300 pre-existing
  // Directus-owned tables that drizzle-kit must never be allowed to diff
  // or suggest dropping. Only better-auth's own tables (core + plugin
  // tables added for the layers/auth plugin consolidation) are listed.
  //
  // These are minimatch glob patterns, not regex — "^name$" (the
  // pre-existing form of this filter, before this comment) never actually
  // matched anything, since minimatch treats ^/$/| as literal characters.
  // Plain names below match exactly, with no special glob characters.
  tablesFilter: [
    "users", "sessions", "accounts",
    "auth_organizations", "auth_organization_members", "invitation",
    "device_code", "two_factor", "sso_provider", "passkey", "apikey",
    "scim_provider", "jwks", "wallet_address",
    "oauth_application", "oauth_access_token", "oauth_consent",
    "auth_subscriptions", "auth_subscription_plans",
    "atproto_sessions",
  ],
  // Same glob-vs-regex issue as tablesFilter above — "^public$" never
  // matched, which let changes to the `auth` schema's own native
  // Supabase tables (e.g. auth.users) leak into the diff undetected.
  schemaFilters: ["public"]
})