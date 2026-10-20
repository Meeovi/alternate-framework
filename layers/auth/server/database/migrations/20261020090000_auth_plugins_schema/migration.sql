-- Auth plugins (layers/auth/server/utils/plugins): site-wide on/off state
-- and settings for every auth plugin package, and the key-value store that
-- sandboxed plugins keep their own data in. Its own `auth_plugins` schema,
-- used only by the app server (connects as `postgres`).
--
-- Rows are keyed by package name (e.g. '@mframework/auth-sso'), the same
-- id the integrations catalog uses. No row = the plugin's default: trusted
-- plugins on, sandboxed plugins off until an admin turns them on.
--
-- Not exposed: Directus only reads `public`, and the Supabase API roles
-- (anon, authenticated) get no privileges on this schema.
--
-- To revert: DROP SCHEMA auth_plugins CASCADE;
BEGIN;

CREATE SCHEMA IF NOT EXISTS auth_plugins;

CREATE TABLE auth_plugins.plugins (
  package     text PRIMARY KEY,
  enabled     boolean NOT NULL,
  settings    jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by  text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- A sandboxed plugin's own data. The host scopes every read and write to
-- the calling plugin's package; plugins never name another package.
CREATE TABLE auth_plugins.kv (
  package     text NOT NULL,
  key         text NOT NULL CHECK (length(key) BETWEEN 1 AND 200),
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (package, key)
);

-- No access for Supabase's API roles (or anyone but the owner).
REVOKE ALL ON SCHEMA auth_plugins FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA auth_plugins FROM PUBLIC;
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA auth_plugins FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA auth_plugins FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA auth_plugins REVOKE ALL ON TABLES FROM %I', r);
    END IF;
  END LOOP;
END $$;

COMMIT;
