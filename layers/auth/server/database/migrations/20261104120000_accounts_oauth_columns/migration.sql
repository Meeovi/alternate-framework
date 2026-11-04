-- GitHub/Google sign-in failed for everyone: better-auth's accountId (the
-- provider's id for the person, e.g. GitHub user 16978186) was mapped onto
-- accounts.id, a uuid, so the lookup threw "invalid input syntax for type
-- uuid" and the callback redirected home without a session (4 Nov 2026).
--
-- accountId now has its own column, plus the other columns better-auth
-- writes for OAuth accounts. Additive only: builds from before this change
-- never read these columns, so run this BEFORE deploying the build that
-- declares them (better-auth selects every declared column).
--
-- Existing rows stored accountId in id, so it is copied across. Run the
-- UPDATE once more after the deploy, for any password accounts created by
-- the old build in between.
-- To revert: drop the five columns and the index.
BEGIN;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "account_id" text;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "id_token" text;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamptz;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamptz;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "scope" text;
UPDATE "accounts" SET "account_id" = "id"::text WHERE "account_id" IS NULL;
CREATE INDEX IF NOT EXISTS "accounts_provider_account_idx" ON "accounts" ("provider_id", "account_id");
COMMIT;
