-- profiles rows belong to app users (better-auth "public"."users"), but the
-- primary key still referenced Supabase's "auth"."users" from before the
-- move to better-auth — so no real user could ever get a profile row.
-- NOT VALID keeps the handful of legacy Supabase-era rows (whose ids only
-- exist in auth.users) while every new or updated row is checked.
-- To revert: drop this constraint and re-add
--   FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
BEGIN;
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS "profiles_id_fkey";
ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE NOT VALID;
COMMIT;
