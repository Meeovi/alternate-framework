-- EMERGENCY (2026-10-15): Supabase's REST API (PostgREST) runs queries as
-- the `anon` role for anyone holding the project's anon key (public by
-- design), and it serves the `public` schema when asked via the
-- `Accept-Profile: public` header. These tables had row-level security OFF
-- and full anon/authenticated grants, so better-auth's `sessions` (login
-- tokens for every account) was readable AND writable through that API —
-- read a token or insert one = sign in as anyone.
--
-- Nothing in the app uses the Supabase API: the app, Directus and scripts
-- connect as `postgres` (BYPASSRLS), so they are unaffected.
BEGIN;
REVOKE ALL ON TABLE public.sessions FROM anon, authenticated;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.directus_oauth_tokens, public.directus_oauth_codes,
  public.directus_oauth_clients, public.directus_oauth_consents FROM anon, authenticated;
ALTER TABLE public.directus_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directus_oauth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directus_oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directus_oauth_consents ENABLE ROW LEVEL SECURITY;
COMMIT;
