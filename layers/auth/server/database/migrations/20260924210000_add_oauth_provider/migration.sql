-- @better-auth/oauth-provider tables — Meeovi as OpenID Connect provider
-- (SSO into Pixanomy / app.pixanomy.com via Nextcloud's user_oidc app).
-- Named oauth_provider_* so they don't collide with the older, unused
-- oidcProvider/mcp tables (oauth_application, oauth_access_token,
-- oauth_consent) that are still in this database.
CREATE TABLE IF NOT EXISTS "oauth_provider_client" (
	"id" uuid PRIMARY KEY,
	"client_id" text NOT NULL UNIQUE,
	"client_secret" text,
	"disabled" boolean DEFAULT false,
	"skip_consent" boolean,
	"enable_end_session" boolean,
	"subject_type" text,
	"scopes" text[],
	"user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
	"created_at" timestamptz,
	"updated_at" timestamptz,
	"name" text,
	"uri" text,
	"icon" text,
	"contacts" text[],
	"tos" text,
	"policy" text,
	"software_id" text,
	"software_version" text,
	"software_statement" text,
	"redirect_uris" text[] NOT NULL,
	"post_logout_redirect_uris" text[],
	"token_endpoint_auth_method" text,
	"grant_types" text[],
	"response_types" text[],
	"public" boolean,
	"type" text,
	"require_pkce" boolean,
	"reference_id" text,
	"metadata" jsonb
);
CREATE INDEX IF NOT EXISTS "oauth_provider_client_user_id_idx" ON "oauth_provider_client" ("user_id");

CREATE TABLE IF NOT EXISTS "oauth_provider_refresh_token" (
	"id" uuid PRIMARY KEY,
	"token" text NOT NULL UNIQUE,
	"client_id" text NOT NULL REFERENCES "oauth_provider_client"("client_id") ON DELETE CASCADE,
	"session_id" uuid REFERENCES "sessions"("id") ON DELETE SET NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"reference_id" text,
	"expires_at" timestamptz,
	"created_at" timestamptz,
	"revoked" timestamptz,
	"auth_time" timestamptz,
	"scopes" text[] NOT NULL
);
CREATE INDEX IF NOT EXISTS "oauth_provider_refresh_token_client_id_idx" ON "oauth_provider_refresh_token" ("client_id");
CREATE INDEX IF NOT EXISTS "oauth_provider_refresh_token_session_id_idx" ON "oauth_provider_refresh_token" ("session_id");
CREATE INDEX IF NOT EXISTS "oauth_provider_refresh_token_user_id_idx" ON "oauth_provider_refresh_token" ("user_id");

CREATE TABLE IF NOT EXISTS "oauth_provider_access_token" (
	"id" uuid PRIMARY KEY,
	"token" text UNIQUE,
	"client_id" text NOT NULL REFERENCES "oauth_provider_client"("client_id") ON DELETE CASCADE,
	"session_id" uuid REFERENCES "sessions"("id") ON DELETE SET NULL,
	"user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
	"reference_id" text,
	"refresh_id" uuid REFERENCES "oauth_provider_refresh_token"("id") ON DELETE CASCADE,
	"expires_at" timestamptz,
	"created_at" timestamptz,
	"scopes" text[] NOT NULL
);
CREATE INDEX IF NOT EXISTS "oauth_provider_access_token_client_id_idx" ON "oauth_provider_access_token" ("client_id");
CREATE INDEX IF NOT EXISTS "oauth_provider_access_token_session_id_idx" ON "oauth_provider_access_token" ("session_id");
CREATE INDEX IF NOT EXISTS "oauth_provider_access_token_user_id_idx" ON "oauth_provider_access_token" ("user_id");
CREATE INDEX IF NOT EXISTS "oauth_provider_access_token_refresh_id_idx" ON "oauth_provider_access_token" ("refresh_id");

CREATE TABLE IF NOT EXISTS "oauth_provider_consent" (
	"id" uuid PRIMARY KEY,
	"client_id" text NOT NULL REFERENCES "oauth_provider_client"("client_id") ON DELETE CASCADE,
	"user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
	"reference_id" text,
	"scopes" text[] NOT NULL,
	"created_at" timestamptz,
	"updated_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "oauth_provider_consent_client_id_idx" ON "oauth_provider_consent" ("client_id");
CREATE INDEX IF NOT EXISTS "oauth_provider_consent_user_id_idx" ON "oauth_provider_consent" ("user_id");
