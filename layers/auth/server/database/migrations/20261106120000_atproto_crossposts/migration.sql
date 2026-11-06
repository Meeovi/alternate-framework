-- Meeovi products and members' notes posted to Bluesky (layers/social
-- server/utils/crosspost.ts): which Meeovi item became which Bluesky post,
-- so nothing is posted twice and a post can be deleted when its product or
-- note is unpublished. The "Meeovi" Bluesky feed lists these posts.
--   source_type  'product' (Directus products, posted by the site's account)
--                or 'note' (Directus posts, posted by the member's account)
--   author_did   the Bluesky account that posted it
--   user_id      the member, for notes (their row goes when they're deleted)
-- New tables get no anon/authenticated grants (default privileges revoked
-- in 20261015140000); row-level security on as for every other table.
-- To revert: DROP TABLE "atproto_crossposts";
BEGIN;
CREATE TABLE IF NOT EXISTS "atproto_crossposts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_type" varchar(16) NOT NULL CHECK ("source_type" IN ('product', 'note')),
  "source_id" varchar(64) NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "author_did" varchar(255) NOT NULL,
  "uri" text NOT NULL,
  "cid" varchar(255),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "atproto_crossposts_source_unique" UNIQUE ("source_type", "source_id"),
  CONSTRAINT "atproto_crossposts_uri_unique" UNIQUE ("uri")
);
CREATE INDEX IF NOT EXISTS "atproto_crossposts_created_at_idx" ON "atproto_crossposts" ("created_at" DESC);
ALTER TABLE "atproto_crossposts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "atproto_crossposts" FROM anon, authenticated, PUBLIC;
COMMIT;
