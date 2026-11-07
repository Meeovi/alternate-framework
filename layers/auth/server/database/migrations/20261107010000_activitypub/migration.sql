-- Meeovi on the fediverse (ActivityPub, Fedify — layers/social
-- server/utils/activitypub/*). Fedify's own cache and delivery queue live in
-- Redis; these tables hold what must survive a restart.
--
--   ap_actor_keys    each Meeovi actor's signing keys (RSA + Ed25519, JWK).
--                    identifier: 'u-<user uuid>' (member), 'shop-<username>',
--                    'meeovi' (site), 'space-<id>', 'list-<id>'.
--   ap_followers     fediverse accounts following a Meeovi actor, with the
--                    inboxes to deliver to.
--   ap_outbox        what each actor has published (Create sent), so nothing
--                    is sent twice and edits/deletions can follow.
--                    object_type: 'note' | 'product' | 'vibe' | 'space_post' | 'list_item'
--   ap_interactions  likes, boosts and replies from the fediverse on Meeovi
--                    items (replies also go into the item's discussion;
--                    discussion_message_id is that Rocket.Chat message).
--
-- No anon/authenticated grants (default privileges revoked in
-- 20261015140000); row-level security on, as for every other table.
-- Private keys are only ever read by the app server.
-- To revert: DROP TABLE "ap_interactions", "ap_outbox", "ap_followers", "ap_actor_keys";
BEGIN;

CREATE TABLE IF NOT EXISTS "ap_actor_keys" (
  "identifier" varchar(160) NOT NULL,
  "key_type" varchar(32) NOT NULL CHECK ("key_type" IN ('RSASSA-PKCS1-v1_5', 'Ed25519')),
  "private_key" jsonb NOT NULL,
  "public_key" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("identifier", "key_type")
);

CREATE TABLE IF NOT EXISTS "ap_followers" (
  "identifier" varchar(160) NOT NULL,
  "actor_uri" text NOT NULL,
  "follow_id" text,
  "handle" text,
  "name" text,
  "url" text,
  "inbox_url" text NOT NULL,
  "shared_inbox_url" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("identifier", "actor_uri")
);
CREATE INDEX IF NOT EXISTS "ap_followers_actor_uri_idx" ON "ap_followers" ("actor_uri");

CREATE TABLE IF NOT EXISTS "ap_outbox" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "identifier" varchar(160) NOT NULL,
  "object_type" varchar(16) NOT NULL CHECK ("object_type" IN ('note', 'product', 'vibe', 'space_post', 'list_item')),
  "object_id" varchar(64) NOT NULL,
  "published_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  CONSTRAINT "ap_outbox_item_unique" UNIQUE ("identifier", "object_type", "object_id")
);
CREATE INDEX IF NOT EXISTS "ap_outbox_identifier_idx" ON "ap_outbox" ("identifier", "published_at" DESC);
CREATE INDEX IF NOT EXISTS "ap_outbox_object_idx" ON "ap_outbox" ("object_type", "object_id");

CREATE TABLE IF NOT EXISTS "ap_interactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "kind" varchar(12) NOT NULL CHECK ("kind" IN ('like', 'announce', 'reply')),
  "object_type" varchar(16) NOT NULL,
  "object_id" varchar(64) NOT NULL,
  "actor_uri" text NOT NULL,
  "actor_handle" text,
  "activity_id" text NOT NULL,
  "object_uri" text,
  "content" text,
  "discussion_message_id" varchar(64),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "ap_interactions_activity_unique" UNIQUE ("activity_id")
);
CREATE INDEX IF NOT EXISTS "ap_interactions_object_idx" ON "ap_interactions" ("object_type", "object_id", "kind");

ALTER TABLE "ap_actor_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ap_followers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ap_outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ap_interactions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ap_actor_keys", "ap_followers", "ap_outbox", "ap_interactions" FROM anon, authenticated, PUBLIC;

COMMIT;
