-- Members' connections to other networks through the social layer's
-- federation plugins (layers/social/server/utils/federation-connections.ts):
--
--   network 'zot'         a Hubzilla / Streams channel (hub URL, channel,
--                         password for the hub's Zot API)
--   network 'ostatus'     a GNU social / OStatus account (server, username,
--                         password for its GNU-social-compatible API)
--   network 'webtorrent'  opt-in to peer-to-peer playback; no credentials
--
-- One row per member per network. `credentials` is AES-256-GCM ciphertext
-- (key: FEDERATION_CREDENTIALS_KEY, else derived from BETTER_AUTH_SECRET),
-- never plain text. Rows go with the account (ON DELETE CASCADE).
--
-- No anon/authenticated grants (default privileges revoked in
-- 20261015140000); row-level security on, as for every other table.
-- To revert: DROP TABLE "federation_connections";
BEGIN;

CREATE TABLE IF NOT EXISTS "federation_connections" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "network" varchar(32) NOT NULL CHECK ("network" ~ '^[a-z][a-z0-9_-]{1,31}$'),
  "account" varchar(320),
  "service" varchar(255),
  "credentials" text,
  "settings" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id", "network")
);
CREATE INDEX IF NOT EXISTS "federation_connections_network_idx" ON "federation_connections" ("network");

ALTER TABLE "federation_connections" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "federation_connections" FROM anon, authenticated, PUBLIC;

COMMIT;
