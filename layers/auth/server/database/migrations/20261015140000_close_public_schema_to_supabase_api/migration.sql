-- Close the whole `public` schema to Supabase's client-facing roles.
--
-- Supabase's REST API (PostgREST) acts as `anon` for anyone holding the
-- project's anon key (public by design) — or as `authenticated` with a
-- Supabase-auth JWT — and serves `public` when asked via the
-- `Accept-Profile: public` header. Supabase's default privileges granted
-- both roles ALL on every table/sequence/function here, and 86 tables had
-- row-level security off, so they were readable and writable through that
-- API (see 20261015130000_lock_sessions_from_supabase_api for `sessions`).
--
-- None of the apps use the Supabase client: the app, Directus and scripts
-- connect as `postgres` (BYPASSRLS) and keep full access. `service_role`
-- (server-side key) is left as it was.
--
-- To revert: GRANT ALL ON ALL TABLES/SEQUENCES/FUNCTIONS IN SCHEMA public
-- TO anon, authenticated (+ the matching ALTER DEFAULT PRIVILEGES ... GRANT).
BEGIN;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
-- A few tables (websites, collections, products, meeovistores, translations,
-- categories) were also granted to PUBLIC (= every role), incl. TRUNCATE,
-- which row-level security does not cover.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, PUBLIC;
-- Functions get EXECUTE for PUBLIC by default; the app's own roles still
-- need it (postgres owns them; service_role is re-granted explicitly).
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Future objects created by postgres (owner of every table here) don't get
-- the grants either. (supabase_admin's defaults can only be changed by
-- supabase_admin itself — it doesn't create objects in this schema.)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- Second barrier: row-level security on every remaining table (no policies
-- = no rows for any role that doesn't bypass RLS).
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
  END LOOP;
END $$;

COMMIT;
