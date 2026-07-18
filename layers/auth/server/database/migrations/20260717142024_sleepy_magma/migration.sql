-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "collaborrate";
--> statement-breakpoint
CREATE SCHEMA "creativesuite";
--> statement-breakpoint
CREATE SCHEMA "enovels";
--> statement-breakpoint
CREATE SCHEMA "extensions";
--> statement-breakpoint
CREATE SCHEMA "graphql";
--> statement-breakpoint
CREATE SCHEMA "graphql_public";
--> statement-breakpoint
CREATE SCHEMA "hdb_catalog";
--> statement-breakpoint
CREATE SCHEMA "meeovi";
--> statement-breakpoint
CREATE SCHEMA "meevendure";
--> statement-breakpoint
CREATE SCHEMA "net";
--> statement-breakpoint
CREATE SCHEMA "pgbouncer";
--> statement-breakpoint
CREATE SCHEMA "pgmq";
--> statement-breakpoint
CREATE SCHEMA "pgsodium";
--> statement-breakpoint
CREATE SCHEMA "pgsodium_masks";
--> statement-breakpoint
CREATE SCHEMA "pixanomy";
--> statement-breakpoint
CREATE SCHEMA "realtime";
--> statement-breakpoint
CREATE SCHEMA "storage";
--> statement-breakpoint
CREATE SCHEMA "supabase_functions";
--> statement-breakpoint
CREATE SCHEMA "vault";
--> statement-breakpoint
CREATE TYPE "net"."request_status" AS ENUM('PENDING', 'SUCCESS', 'ERROR');--> statement-breakpoint
CREATE TYPE "pgsodium"."key_status" AS ENUM('default', 'valid', 'invalid', 'expired');--> statement-breakpoint
CREATE TYPE "pgsodium"."key_type" AS ENUM('aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20');--> statement-breakpoint
CREATE TYPE "auth"."aal_level" AS ENUM('aal1', 'aal2', 'aal3');--> statement-breakpoint
CREATE TYPE "auth"."code_challenge_method" AS ENUM('s256', 'plain');--> statement-breakpoint
CREATE TYPE "auth"."factor_status" AS ENUM('unverified', 'verified');--> statement-breakpoint
CREATE TYPE "auth"."factor_type" AS ENUM('totp', 'webauthn', 'phone');--> statement-breakpoint
CREATE TYPE "auth"."one_time_token_type" AS ENUM('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');--> statement-breakpoint
CREATE TYPE "color_source" AS ENUM('99COLORS_NET', 'ART_PAINTS_YG07S', 'BYRNE', 'CRAYOLA', 'CMYK_COLOR_MODEL', 'COLORCODE_IS', 'COLORHEXA', 'COLORXS', 'CORNELL_UNIVERSITY', 'COLUMBIA_UNIVERSITY', 'DUKE_UNIVERSITY', 'ENCYCOLORPEDIA_COM', 'ETON_COLLEGE', 'FANTETTI_AND_PETRACCHI', 'FINDTHEDATA_COM', 'FERRARIO_1919', 'FEDERAL_STANDARD_595', 'FLAG_OF_INDIA', 'FLAG_OF_SOUTH_AFRICA', 'GLAZEBROOK_AND_BALDRY', 'GOOGLE', 'HEXCOLOR_CO', 'ISCC_NBS', 'KELLY_MOORE', 'MATTEL', 'MAERZ_AND_PAUL', 'MILK_PAINT', 'MUNSELL_COLOR_WHEEL', 'NATURAL_COLOR_SYSTEM', 'PANTONE', 'PLOCHERE', 'POURPRE_COM', 'RAL', 'RESENE', 'RGB_COLOR_MODEL', 'THOM_POOLE', 'UNIVERSITY_OF_ALABAMA', 'UNIVERSITY_OF_CALIFORNIA_DAVIS', 'UNIVERSITY_OF_CAMBRIDGE', 'UNIVERSITY_OF_NORTH_CAROLINA', 'UNIVERSITY_OF_TEXAS_AT_AUSTIN', 'X11_WEB', 'XONA_COM');--> statement-breakpoint
CREATE TYPE "realtime"."action" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR');--> statement-breakpoint
CREATE TYPE "realtime"."equality_op" AS ENUM('eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in');--> statement-breakpoint
CREATE TYPE "storage"."buckettype" AS ENUM('STANDARD', 'ANALYTICS', 'VECTOR');--> statement-breakpoint
CREATE TYPE "auth"."oauth_registration_type" AS ENUM('dynamic', 'manual');--> statement-breakpoint
CREATE TYPE "auth"."oauth_authorization_status" AS ENUM('pending', 'approved', 'denied', 'expired');--> statement-breakpoint
CREATE TYPE "auth"."oauth_response_type" AS ENUM('code');--> statement-breakpoint
CREATE TYPE "auth"."oauth_client_type" AS ENUM('public', 'confidential');--> statement-breakpoint
CREATE SEQUENCE "enovels"."directus_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "meeovi"."directus_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "auth"."audit_log_entries" (
	"instance_id" uuid,
	"id" uuid PRIMARY KEY,
	"payload" json,
	"created_at" timestamp with time zone,
	"ip_address" varchar(64) DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."custom_oauth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"provider_type" text NOT NULL,
	"identifier" text NOT NULL CONSTRAINT "custom_oauth_providers_identifier_key" UNIQUE,
	"name" text NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"acceptable_client_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"scopes" text[] DEFAULT '{}'::text[] NOT NULL,
	"pkce_enabled" boolean DEFAULT true NOT NULL,
	"attribute_mapping" jsonb DEFAULT '{}' NOT NULL,
	"authorization_params" jsonb DEFAULT '{}' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"email_optional" boolean DEFAULT false NOT NULL,
	"issuer" text,
	"discovery_url" text,
	"skip_nonce_check" boolean DEFAULT false NOT NULL,
	"cached_discovery" jsonb,
	"discovery_cached_at" timestamp with time zone,
	"authorization_url" text,
	"token_url" text,
	"userinfo_url" text,
	"jwks_uri" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"custom_claims_allowlist" text[] DEFAULT '{}'::text[] NOT NULL,
	CONSTRAINT "custom_oauth_providers_authorization_url_https" CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
	CONSTRAINT "custom_oauth_providers_authorization_url_length" CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
	CONSTRAINT "custom_oauth_providers_client_id_length" CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
	CONSTRAINT "custom_oauth_providers_discovery_url_length" CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
	CONSTRAINT "custom_oauth_providers_identifier_format" CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
	CONSTRAINT "custom_oauth_providers_issuer_length" CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
	CONSTRAINT "custom_oauth_providers_jwks_uri_https" CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
	CONSTRAINT "custom_oauth_providers_jwks_uri_length" CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
	CONSTRAINT "custom_oauth_providers_name_length" CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
	CONSTRAINT "custom_oauth_providers_oauth2_requires_endpoints" CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
	CONSTRAINT "custom_oauth_providers_oidc_discovery_url_https" CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
	CONSTRAINT "custom_oauth_providers_oidc_issuer_https" CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
	CONSTRAINT "custom_oauth_providers_oidc_requires_issuer" CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
	CONSTRAINT "custom_oauth_providers_provider_type_check" CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
	CONSTRAINT "custom_oauth_providers_token_url_https" CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
	CONSTRAINT "custom_oauth_providers_token_url_length" CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
	CONSTRAINT "custom_oauth_providers_userinfo_url_https" CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
	CONSTRAINT "custom_oauth_providers_userinfo_url_length" CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);
--> statement-breakpoint
CREATE TABLE "auth"."flow_state" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid,
	"auth_code" text,
	"code_challenge_method" "auth"."code_challenge_method",
	"code_challenge" text,
	"provider_type" text NOT NULL,
	"provider_access_token" text,
	"provider_refresh_token" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"authentication_method" text NOT NULL,
	"auth_code_issued_at" timestamp with time zone,
	"invite_token" text,
	"referrer" text,
	"oauth_client_state_id" uuid,
	"linking_target_id" uuid,
	"email_optional" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."identities" (
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"identity_data" jsonb NOT NULL,
	"provider" text NOT NULL,
	"last_sign_in_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"email" text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	CONSTRAINT "identities_provider_id_provider_unique" UNIQUE("provider_id","provider")
);
--> statement-breakpoint
ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."instances" (
	"id" uuid PRIMARY KEY,
	"uuid" uuid,
	"raw_base_config" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."mfa_amr_claims" (
	"session_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"authentication_method" text NOT NULL,
	"id" uuid,
	CONSTRAINT "amr_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE("session_id","authentication_method")
);
--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."mfa_challenges" (
	"id" uuid PRIMARY KEY,
	"factor_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"ip_address" inet NOT NULL,
	"otp_code" text,
	"web_authn_session_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."mfa_factors" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"friendly_name" text,
	"factor_type" "auth"."factor_type" NOT NULL,
	"status" "auth"."factor_status" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"secret" text,
	"phone" text,
	"last_challenged_at" timestamp with time zone CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE,
	"web_authn_credential" jsonb,
	"web_authn_aaguid" uuid,
	"last_webauthn_challenge_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."oauth_authorizations" (
	"id" uuid PRIMARY KEY,
	"authorization_id" text NOT NULL CONSTRAINT "oauth_authorizations_authorization_id_key" UNIQUE,
	"client_id" uuid NOT NULL,
	"user_id" uuid,
	"redirect_uri" text NOT NULL,
	"scope" text NOT NULL,
	"state" text,
	"resource" text,
	"code_challenge" text,
	"code_challenge_method" "auth"."code_challenge_method",
	"response_type" "auth"."oauth_response_type" DEFAULT 'code'::"auth"."oauth_response_type" NOT NULL,
	"status" "auth"."oauth_authorization_status" DEFAULT 'pending'::"auth"."oauth_authorization_status" NOT NULL,
	"authorization_code" text CONSTRAINT "oauth_authorizations_authorization_code_key" UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
	"approved_at" timestamp with time zone,
	"nonce" text,
	CONSTRAINT "oauth_authorizations_authorization_code_length" CHECK ((char_length(authorization_code) <= 255)),
	CONSTRAINT "oauth_authorizations_code_challenge_length" CHECK ((char_length(code_challenge) <= 128)),
	CONSTRAINT "oauth_authorizations_expires_at_future" CHECK ((expires_at > created_at)),
	CONSTRAINT "oauth_authorizations_nonce_length" CHECK ((char_length(nonce) <= 255)),
	CONSTRAINT "oauth_authorizations_redirect_uri_length" CHECK ((char_length(redirect_uri) <= 2048)),
	CONSTRAINT "oauth_authorizations_resource_length" CHECK ((char_length(resource) <= 2048)),
	CONSTRAINT "oauth_authorizations_scope_length" CHECK ((char_length(scope) <= 4096)),
	CONSTRAINT "oauth_authorizations_state_length" CHECK ((char_length(state) <= 4096))
);
--> statement-breakpoint
CREATE TABLE "auth"."oauth_client_states" (
	"id" uuid PRIMARY KEY,
	"provider_type" text NOT NULL,
	"code_verifier" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."oauth_clients" (
	"id" uuid PRIMARY KEY,
	"client_secret_hash" text,
	"registration_type" "auth"."oauth_registration_type" NOT NULL,
	"redirect_uris" text NOT NULL,
	"grant_types" text NOT NULL,
	"client_name" text,
	"client_uri" text,
	"logo_uri" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"client_type" "auth"."oauth_client_type" DEFAULT 'confidential'::"auth"."oauth_client_type" NOT NULL,
	"token_endpoint_auth_method" text NOT NULL,
	CONSTRAINT "oauth_clients_client_name_length" CHECK ((char_length(client_name) <= 1024)),
	CONSTRAINT "oauth_clients_client_uri_length" CHECK ((char_length(client_uri) <= 2048)),
	CONSTRAINT "oauth_clients_logo_uri_length" CHECK ((char_length(logo_uri) <= 2048)),
	CONSTRAINT "oauth_clients_token_endpoint_auth_method_check" CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);
--> statement-breakpoint
CREATE TABLE "auth"."oauth_consents" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"scopes" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "oauth_consents_user_client_unique" UNIQUE("user_id","client_id"),
	CONSTRAINT "oauth_consents_revoked_after_granted" CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
	CONSTRAINT "oauth_consents_scopes_length" CHECK ((char_length(scopes) <= 2048)),
	CONSTRAINT "oauth_consents_scopes_not_empty" CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);
--> statement-breakpoint
CREATE TABLE "auth"."one_time_tokens" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"token_type" "auth"."one_time_token_type" NOT NULL,
	"token_hash" text NOT NULL,
	"relates_to" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "one_time_tokens_token_hash_check" CHECK ((char_length(token_hash) > 0))
);
--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."refresh_tokens" (
	"instance_id" uuid,
	"id" bigserial PRIMARY KEY,
	"token" varchar(255) CONSTRAINT "refresh_tokens_token_unique" UNIQUE,
	"user_id" varchar(255),
	"revoked" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"parent" varchar(255),
	"session_id" uuid
);
--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."saml_providers" (
	"id" uuid PRIMARY KEY,
	"sso_provider_id" uuid NOT NULL,
	"entity_id" text NOT NULL CONSTRAINT "saml_providers_entity_id_key" UNIQUE,
	"metadata_xml" text NOT NULL,
	"metadata_url" text,
	"attribute_mapping" jsonb,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"name_id_format" text,
	CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
	CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
	CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);
--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."saml_relay_states" (
	"id" uuid PRIMARY KEY,
	"sso_provider_id" uuid NOT NULL,
	"request_id" text NOT NULL,
	"for_email" text,
	"redirect_to" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"flow_state_id" uuid,
	CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);
--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."schema_migrations" (
	"version" varchar(255) PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"factor_id" uuid,
	"aal" "auth"."aal_level",
	"not_after" timestamp with time zone,
	"refreshed_at" timestamp,
	"user_agent" text,
	"ip" inet,
	"tag" text,
	"oauth_client_id" uuid,
	"refresh_token_hmac_key" text,
	"refresh_token_counter" bigint,
	"scopes" text,
	CONSTRAINT "sessions_scopes_length" CHECK ((char_length(scopes) <= 4096))
);
--> statement-breakpoint
ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."sso_domains" (
	"id" uuid PRIMARY KEY,
	"sso_provider_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);
--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."sso_providers" (
	"id" uuid PRIMARY KEY,
	"resource_id" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"disabled" boolean,
	CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);
--> statement-breakpoint
ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"instance_id" uuid,
	"id" uuid PRIMARY KEY,
	"aud" varchar(255),
	"role" varchar(255),
	"email" varchar(255),
	"encrypted_password" varchar(255),
	"email_confirmed_at" timestamp with time zone,
	"invited_at" timestamp with time zone,
	"confirmation_token" varchar(255),
	"confirmation_sent_at" timestamp with time zone,
	"recovery_token" varchar(255),
	"recovery_sent_at" timestamp with time zone,
	"email_change_token_new" varchar(255),
	"email_change" varchar(255),
	"email_change_sent_at" timestamp with time zone,
	"last_sign_in_at" timestamp with time zone,
	"raw_app_meta_data" jsonb,
	"raw_user_meta_data" jsonb,
	"is_super_admin" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"phone" text DEFAULT NULL CONSTRAINT "users_phone_key" UNIQUE,
	"phone_confirmed_at" timestamp with time zone,
	"phone_change" text DEFAULT '',
	"phone_change_token" varchar(255) DEFAULT '',
	"phone_change_sent_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
	"email_change_token_current" varchar(255) DEFAULT '',
	"email_change_confirm_status" smallint DEFAULT 0,
	"banned_until" timestamp with time zone,
	"reauthentication_token" varchar(255) DEFAULT '',
	"reauthentication_sent_at" timestamp with time zone,
	"is_sso_user" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_change_confirm_status_check" CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);
--> statement-breakpoint
ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."webauthn_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"challenge_type" text NOT NULL,
	"session_data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "webauthn_challenges_challenge_type_check" CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);
--> statement-breakpoint
CREATE TABLE "auth"."webauthn_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"credential_id" bytea NOT NULL,
	"public_key" bytea NOT NULL,
	"attestation_type" text DEFAULT '' NOT NULL,
	"aaguid" uuid,
	"sign_count" bigint DEFAULT 0 NOT NULL,
	"transports" jsonb DEFAULT '[]' NOT NULL,
	"backup_eligible" boolean DEFAULT false NOT NULL,
	"backed_up" boolean DEFAULT false NOT NULL,
	"friendly_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "enovels"."abilities" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"type" varchar(255),
	"slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."blog" (
	"id" bigserial PRIMARY KEY,
	"name" text NOT NULL,
	"excerpt" text NOT NULL,
	"categories" text NOT NULL,
	"characters" text,
	"description" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"image" uuid,
	"file" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"content" text,
	"image" uuid,
	"visibility" varchar(255),
	"date_created" timestamp with time zone,
	"slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."categories_tags" (
	"id" serial PRIMARY KEY,
	"categories_id" integer,
	"tags_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."characters" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'published' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"age" integer,
	"alias" varchar(255),
	"description" text,
	"type" varchar(255),
	"image" uuid,
	"slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."characters_abilities" (
	"id" serial PRIMARY KEY,
	"characters_id" integer,
	"abilities_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."characters_characters" (
	"id" serial PRIMARY KEY,
	"characters_id" integer,
	"related_characters_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."characters_tags" (
	"id" serial PRIMARY KEY,
	"characters_id" integer,
	"tags_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."characters_videos" (
	"id" serial PRIMARY KEY,
	"characters_id" integer,
	"videos_id" bigint
);
--> statement-breakpoint
CREATE TABLE "enovels"."dictionary" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'published' NOT NULL,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"excerpt" text,
	"description" text,
	"image" uuid,
	"slug" varchar(255),
	"type" varchar(255),
	"pronunction" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_access" (
	"id" uuid PRIMARY KEY,
	"role" uuid,
	"user" uuid,
	"policy" uuid NOT NULL,
	"sort" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_activity" (
	"id" serial PRIMARY KEY,
	"action" varchar(45) NOT NULL,
	"user" uuid,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"ip" varchar(50),
	"user_agent" text,
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"origin" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_collections" (
	"collection" varchar(64) PRIMARY KEY,
	"icon" varchar(64),
	"note" text,
	"display_template" varchar(255),
	"hidden" boolean DEFAULT false NOT NULL,
	"singleton" boolean DEFAULT false NOT NULL,
	"translations" json,
	"archive_field" varchar(64),
	"archive_app_filter" boolean DEFAULT true NOT NULL,
	"archive_value" varchar(255),
	"unarchive_value" varchar(255),
	"sort_field" varchar(64),
	"accountability" varchar(255) DEFAULT 'all',
	"color" varchar(255),
	"item_duplication_fields" json,
	"sort" integer,
	"group" varchar(64),
	"collapse" varchar(255) DEFAULT 'open' NOT NULL,
	"preview_url" varchar(255),
	"versioning" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_comments" (
	"id" uuid PRIMARY KEY,
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"comment" text NOT NULL,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"date_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"user_updated" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_dashboards" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"icon" varchar(64) DEFAULT 'dashboard' NOT NULL,
	"note" text,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"color" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_extensions" (
	"enabled" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY,
	"folder" varchar(255) NOT NULL,
	"source" varchar(255) NOT NULL,
	"bundle" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_fields" (
	"id" serial PRIMARY KEY,
	"collection" varchar(64) NOT NULL,
	"field" varchar(64) NOT NULL,
	"special" varchar(64),
	"interface" varchar(64),
	"options" json,
	"display" varchar(64),
	"display_options" json,
	"readonly" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"sort" integer,
	"width" varchar(30) DEFAULT 'full',
	"translations" json,
	"note" text,
	"conditions" json,
	"required" boolean DEFAULT false,
	"group" varchar(64),
	"validation" json,
	"validation_message" text
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_files" (
	"id" uuid PRIMARY KEY,
	"storage" varchar(255) NOT NULL,
	"filename_disk" varchar(255),
	"filename_download" varchar(255) NOT NULL,
	"title" varchar(255),
	"type" varchar(255),
	"folder" uuid,
	"uploaded_by" uuid,
	"created_on" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified_by" uuid,
	"modified_on" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"charset" varchar(50),
	"filesize" bigint,
	"width" integer,
	"height" integer,
	"duration" integer,
	"embed" varchar(200),
	"description" text,
	"location" text,
	"tags" text,
	"metadata" json,
	"focal_point_x" integer,
	"focal_point_y" integer,
	"tus_id" varchar(64),
	"tus_data" json,
	"uploaded_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_flows" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"icon" varchar(64),
	"color" varchar(255),
	"description" text,
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"trigger" varchar(255),
	"accountability" varchar(255) DEFAULT 'all',
	"options" json,
	"operation" uuid CONSTRAINT "directus_flows_operation_unique" UNIQUE,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_folders" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"parent" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_migrations" (
	"version" varchar(255) PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_notifications" (
	"id" serial PRIMARY KEY,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"status" varchar(255) DEFAULT 'inbox',
	"recipient" uuid NOT NULL,
	"sender" uuid,
	"subject" varchar(255) NOT NULL,
	"message" text,
	"collection" varchar(64),
	"item" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_operations" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255),
	"key" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"position_x" integer NOT NULL,
	"position_y" integer NOT NULL,
	"options" json,
	"resolve" uuid CONSTRAINT "directus_operations_resolve_unique" UNIQUE,
	"reject" uuid CONSTRAINT "directus_operations_reject_unique" UNIQUE,
	"flow" uuid NOT NULL,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_panels" (
	"id" uuid PRIMARY KEY,
	"dashboard" uuid NOT NULL,
	"name" varchar(255),
	"icon" varchar(64) DEFAULT NULL,
	"color" varchar(10),
	"show_header" boolean DEFAULT false NOT NULL,
	"note" text,
	"type" varchar(255) NOT NULL,
	"position_x" integer NOT NULL,
	"position_y" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"options" json,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_permissions" (
	"id" serial PRIMARY KEY,
	"collection" varchar(64) NOT NULL,
	"action" varchar(10) NOT NULL,
	"permissions" json,
	"validation" json,
	"presets" json,
	"fields" text,
	"policy" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_policies" (
	"id" uuid PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"icon" varchar(64) DEFAULT 'badge' NOT NULL,
	"description" text,
	"ip_access" text,
	"enforce_tfa" boolean DEFAULT false NOT NULL,
	"admin_access" boolean DEFAULT false NOT NULL,
	"app_access" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_presets" (
	"id" serial PRIMARY KEY,
	"bookmark" varchar(255),
	"user" uuid,
	"role" uuid,
	"collection" varchar(64),
	"search" varchar(100),
	"layout" varchar(100) DEFAULT 'tabular',
	"layout_query" json,
	"layout_options" json,
	"refresh_interval" integer,
	"filter" json,
	"icon" varchar(64) DEFAULT 'bookmark',
	"color" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_relations" (
	"id" serial PRIMARY KEY,
	"many_collection" varchar(64) NOT NULL,
	"many_field" varchar(64) NOT NULL,
	"one_collection" varchar(64),
	"one_field" varchar(64),
	"one_collection_field" varchar(64),
	"one_allowed_collections" text,
	"junction_field" varchar(64),
	"sort_field" varchar(64),
	"one_deselect_action" varchar(255) DEFAULT 'nullify' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_revisions" (
	"id" serial PRIMARY KEY,
	"activity" integer NOT NULL,
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"data" json,
	"delta" json,
	"parent" integer,
	"version" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_roles" (
	"id" uuid PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"icon" varchar(64) DEFAULT 'supervised_user_circle' NOT NULL,
	"description" text,
	"parent" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_sessions" (
	"token" varchar(64) PRIMARY KEY,
	"user" uuid,
	"expires" timestamp with time zone NOT NULL,
	"ip" varchar(255),
	"user_agent" text,
	"share" uuid,
	"origin" varchar(255),
	"next_token" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_shares" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255),
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"role" uuid,
	"password" varchar(255),
	"user_created" uuid,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"date_start" timestamp with time zone,
	"date_end" timestamp with time zone,
	"times_used" integer DEFAULT 0,
	"max_uses" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_translations" (
	"id" uuid PRIMARY KEY,
	"language" varchar(255) NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_users" (
	"id" uuid PRIMARY KEY,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"email" varchar(128) CONSTRAINT "directus_users_email_unique" UNIQUE,
	"password" varchar(255),
	"location" varchar(255),
	"title" varchar(50),
	"description" text,
	"tags" json,
	"avatar" uuid,
	"language" varchar(255) DEFAULT NULL,
	"tfa_secret" varchar(255),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"role" uuid,
	"token" varchar(255) CONSTRAINT "directus_users_token_unique" UNIQUE,
	"last_access" timestamp with time zone,
	"last_page" varchar(255),
	"provider" varchar(128) DEFAULT 'default' NOT NULL,
	"external_identifier" varchar(255) CONSTRAINT "directus_users_external_identifier_unique" UNIQUE,
	"auth_data" json,
	"email_notifications" boolean DEFAULT true,
	"appearance" varchar(255),
	"theme_dark" varchar(255),
	"theme_light" varchar(255),
	"theme_light_overrides" json,
	"theme_dark_overrides" json
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_versions" (
	"id" uuid PRIMARY KEY,
	"key" varchar(64) NOT NULL,
	"name" varchar(255),
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"hash" varchar(255),
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"date_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"user_updated" uuid,
	"delta" json
);
--> statement-breakpoint
CREATE TABLE "enovels"."directus_webhooks" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"method" varchar(10) DEFAULT 'POST' NOT NULL,
	"url" varchar(255) NOT NULL,
	"status" varchar(10) DEFAULT 'active' NOT NULL,
	"data" boolean DEFAULT true NOT NULL,
	"actions" varchar(100) NOT NULL,
	"collections" varchar(255) NOT NULL,
	"headers" json,
	"was_active_before_deprecation" boolean DEFAULT false NOT NULL,
	"migrated_flow" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."items" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"type" varchar(255),
	"image" uuid,
	"slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."items_abilities" (
	"id" serial PRIMARY KEY,
	"items_id" integer,
	"abilities_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."items_characters" (
	"id" serial PRIMARY KEY,
	"items_id" integer,
	"characters_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."items_videos" (
	"id" serial PRIMARY KEY,
	"items_id" integer,
	"videos_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."levels" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"slug" varchar(255),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "enovels"."levels_characters" (
	"id" serial PRIMARY KEY,
	"levels_id" integer,
	"characters_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."navigation" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone,
	"type" varchar(255),
	"name" varchar(255),
	"url" varchar(255),
	"icon" varchar(255),
	"description" text,
	"menus" json
);
--> statement-breakpoint
CREATE TABLE "enovels"."pages" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"content" text,
	"image" uuid,
	"information" json,
	"slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."places" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid,
	"slug" varchar(255),
	"location" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."places_characters" (
	"id" serial PRIMARY KEY,
	"places_id" integer,
	"characters_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."places_items" (
	"id" serial PRIMARY KEY,
	"places_id" integer,
	"items_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."stories" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"type" varchar(255),
	"description" text,
	"image" uuid,
	"slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."stories_characters" (
	"id" serial PRIMARY KEY,
	"stories_id" integer,
	"characters_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."stories_tags" (
	"id" serial PRIMARY KEY,
	"stories_id" integer,
	"tags_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."tags" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid,
	"slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enovels"."tags_videos" (
	"id" serial PRIMARY KEY,
	"tags_id" integer,
	"videos_id" bigint
);
--> statement-breakpoint
CREATE TABLE "enovels"."types" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"slug" varchar(255),
	"description" text,
	"image" uuid
);
--> statement-breakpoint
CREATE TABLE "enovels"."types_characters" (
	"id" serial PRIMARY KEY,
	"types_id" integer,
	"characters_id" integer
);
--> statement-breakpoint
CREATE TABLE "enovels"."videos" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"file" uuid,
	"status" varchar(255),
	"type" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "extensions"."wrappers_fdw_stats" (
	"fdw_name" text PRIMARY KEY,
	"create_times" bigint,
	"rows_in" bigint,
	"rows_out" bigint,
	"bytes_in" bigint,
	"bytes_out" bigint,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_action_log" (
	"id" uuid PRIMARY KEY DEFAULT hdb_catalog.gen_hasura_uuid(),
	"action_name" text,
	"input_payload" jsonb NOT NULL,
	"request_headers" jsonb NOT NULL,
	"session_variables" jsonb NOT NULL,
	"response_payload" jsonb,
	"errors" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"response_received_at" timestamp with time zone,
	"status" text NOT NULL,
	CONSTRAINT "hdb_action_log_status_check" CHECK ((status = ANY (ARRAY['created'::text, 'processing'::text, 'completed'::text, 'error'::text])))
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_cron_event_invocation_logs" (
	"id" text PRIMARY KEY DEFAULT hdb_catalog.gen_hasura_uuid(),
	"event_id" text,
	"status" integer,
	"request" json,
	"response" json,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_cron_events" (
	"id" text PRIMARY KEY DEFAULT hdb_catalog.gen_hasura_uuid(),
	"trigger_name" text NOT NULL,
	"scheduled_time" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"tries" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"next_retry_at" timestamp with time zone,
	CONSTRAINT "valid_status" CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_metadata" (
	"id" integer PRIMARY KEY,
	"metadata" json NOT NULL,
	"resource_version" integer DEFAULT 1 NOT NULL CONSTRAINT "hdb_metadata_resource_version_key" UNIQUE
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_scheduled_event_invocation_logs" (
	"id" text PRIMARY KEY DEFAULT hdb_catalog.gen_hasura_uuid(),
	"event_id" text,
	"status" integer,
	"request" json,
	"response" json,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_scheduled_events" (
	"id" text PRIMARY KEY DEFAULT hdb_catalog.gen_hasura_uuid(),
	"webhook_conf" json NOT NULL,
	"scheduled_time" timestamp with time zone NOT NULL,
	"retry_conf" json,
	"payload" json,
	"header_conf" json,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"tries" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"next_retry_at" timestamp with time zone,
	"comment" text,
	CONSTRAINT "valid_status" CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_schema_notifications" (
	"id" integer PRIMARY KEY,
	"notification" json NOT NULL,
	"resource_version" integer DEFAULT 1 NOT NULL,
	"instance_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "hdb_schema_notifications_id_check" CHECK ((id = 1))
);
--> statement-breakpoint
CREATE TABLE "hdb_catalog"."hdb_version" (
	"hasura_uuid" uuid PRIMARY KEY DEFAULT hdb_catalog.gen_hasura_uuid(),
	"version" text NOT NULL,
	"upgraded_on" timestamp with time zone NOT NULL,
	"cli_state" jsonb DEFAULT '{}' NOT NULL,
	"console_state" jsonb DEFAULT '{}' NOT NULL,
	"ee_client_id" text,
	"ee_client_secret" text
);
--> statement-breakpoint
CREATE TABLE "meevendure"."migrations" (
	"id" serial,
	"timestamp" bigint NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "net"."_http_response" (
	"id" bigint,
	"status_code" integer,
	"content_type" text,
	"headers" jsonb,
	"content" text,
	"timed_out" boolean,
	"error_msg" text,
	"created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "net"."http_request_queue" (
	"id" bigserial,
	"method" net.http_method NOT NULL,
	"url" text NOT NULL,
	"headers" jsonb NOT NULL,
	"body" bytea,
	"timeout_milliseconds" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pgmq"."meta" (
	"queue_name" varchar NOT NULL CONSTRAINT "meta_queue_name_key" UNIQUE,
	"is_partitioned" boolean NOT NULL,
	"is_unlogged" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pgsodium"."key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"status" "pgsodium"."key_status" DEFAULT 'valid'::"pgsodium"."key_status",
	"created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires" timestamp with time zone,
	"key_type" "pgsodium"."key_type",
	"key_id" bigserial,
	"key_context" bytea DEFAULT '\x7067736f6469756d',
	"name" text CONSTRAINT "pgsodium_key_unique_name" UNIQUE,
	"associated_data" text DEFAULT 'associated',
	"raw_key" bytea,
	"raw_key_nonce" bytea,
	"parent_key" uuid,
	"comment" text,
	"user_data" text,
	CONSTRAINT "key_key_context_check" CHECK ((length(key_context) = 8)),
	CONSTRAINT "pgsodium_raw" CHECK (
CASE
    WHEN (raw_key IS NOT NULL) THEN ((key_id IS NULL) AND (key_context IS NULL) AND (parent_key IS NOT NULL))
    ELSE ((key_id IS NOT NULL) AND (key_context IS NOT NULL) AND (parent_key IS NULL))
END)
);
--> statement-breakpoint
CREATE TABLE "about_departments_articles" (
	"id" serial PRIMARY KEY,
	"articles_id" integer
);
--> statement-breakpoint
ALTER TABLE "about_departments_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "about_departments_pages" (
	"id" serial PRIMARY KEY,
	"pages_id" integer
);
--> statement-breakpoint
ALTER TABLE "about_departments_pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "about_departments_platform" (
	"id" serial PRIMARY KEY,
	"platform_id" integer
);
--> statement-breakpoint
ALTER TABLE "about_departments_platform" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "address" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"type" json,
	"address" text,
	"address2" varchar(255),
	"postalcode" varchar(255),
	"firstName" varchar(255),
	"lastName" varchar(255),
	"company" varchar(255),
	"email" varchar(255),
	"telephone" varchar(255),
	"format" varchar(255),
	"user" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "address" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "address_cart" (
	"id" serial PRIMARY KEY,
	"address_id" integer,
	"cart_id" integer
);
--> statement-breakpoint
ALTER TABLE "address_cart" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "address_cities" (
	"id" serial PRIMARY KEY,
	"address_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
ALTER TABLE "address_cities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "address_countries" (
	"id" serial PRIMARY KEY,
	"address_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "address_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "address_directus_users" (
	"id" serial PRIMARY KEY,
	"address_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "address_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "advertising" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"link" varchar(255),
	"start_date" timestamp,
	"end_time" timestamp
);
--> statement-breakpoint
ALTER TABLE "advertising" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "advertising_files" (
	"id" serial PRIMARY KEY,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "advertising_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "agreements" (
	"id" bigserial PRIMARY KEY,
	"created" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"content" text,
	"name" text,
	"excerpt" text,
	"type" json,
	"reference_id" bigint,
	"status" varchar(255),
	"updated" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "agreements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "agreements_directus_users" (
	"id" serial PRIMARY KEY,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "agreements_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "agreements_products" (
	"id" serial PRIMARY KEY,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "agreements_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_prompts" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"date_updated" timestamp with time zone,
	"user_updated" uuid,
	"name" varchar(255) CONSTRAINT "ai_prompts_name_unique" UNIQUE,
	"status" varchar(255) DEFAULT 'draft',
	"description" text,
	"system_prompt" text,
	"messages" json
);
--> statement-breakpoint
ALTER TABLE "ai_prompts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"subject" varchar(255),
	"description" text,
	"image" uuid,
	"location" json,
	"icon" varchar(255),
	"color" varchar(255),
	"border_color" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "announcements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"name" varchar(255),
	"description" text,
	"url" varchar(255),
	"image" uuid,
	"operating_systems" json,
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY,
	"name" text,
	"excerpt" text,
	"content" text,
	"created_at" timestamp with time zone,
	"image" uuid,
	"type" json,
	"isPublic" boolean,
	"stamp" integer,
	"slug" varchar(255),
	"author" uuid
);
--> statement-breakpoint
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "articles_categories" (
	"id" serial PRIMARY KEY,
	"articles_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "articles_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "articles_comments" (
	"id" serial PRIMARY KEY,
	"articles_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "articles_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "articles_departments" (
	"id" serial PRIMARY KEY,
	"articles_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "articles_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" serial,
	"default_label" text,
	"isPublic" boolean,
	"options" json,
	"attribute_code" varchar(255),
	CONSTRAINT "product_attribute_pkey" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "attributes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "attributes_product_types" (
	"id" serial PRIMARY KEY,
	"attributes_id" integer,
	"product_types_id" integer
);
--> statement-breakpoint
ALTER TABLE "attributes_product_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "attributes_products" (
	"id" serial PRIMARY KEY,
	"attributes_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "attributes_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auction_lots" (
	"id" bigserial PRIMARY KEY,
	"product_id" bigint,
	"reserve_price" numeric,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"anti_snipe_sec" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"uuid" uuid DEFAULT gen_random_uuid()
);
--> statement-breakpoint
ALTER TABLE "auction_lots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "bids" (
	"id" serial PRIMARY KEY,
	"lot_id" integer,
	"bidder_id" integer,
	"amount" numeric,
	"ts" timestamp with time zone DEFAULT now(),
	"status" text
);
--> statement-breakpoint
ALTER TABLE "bids" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "block_button" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"type" varchar(255) DEFAULT NULL,
	"page" uuid,
	"post" uuid,
	"external_url" varchar(255) DEFAULT NULL,
	"label" varchar(255) DEFAULT NULL,
	"color" varchar(255) DEFAULT 'primary',
	"variant" varchar(255) DEFAULT 'solid',
	"button_group" uuid
);
--> statement-breakpoint
CREATE TABLE "block_button_group" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"alignment" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_columns" (
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_columns_rows" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"block_columns" uuid,
	"title" varchar(255) DEFAULT NULL,
	"headline" text,
	"image" uuid,
	"image_position" varchar(255) DEFAULT NULL,
	"content" text,
	"button_group" uuid
);
--> statement-breakpoint
CREATE TABLE "block_cta" (
	"content" text,
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL,
	"button_group" uuid
);
--> statement-breakpoint
CREATE TABLE "block_divider" (
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_faqs" (
	"faqs" json,
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL,
	"alignment" varchar(255) DEFAULT 'center'
);
--> statement-breakpoint
CREATE TABLE "block_form" (
	"form" uuid,
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_gallery" (
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_gallery_files" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"block_gallery_id" uuid,
	"directus_files_id" uuid
);
--> statement-breakpoint
CREATE TABLE "block_hero" (
	"content" text,
	"headline" text,
	"id" uuid PRIMARY KEY,
	"image" uuid,
	"title" varchar(255) DEFAULT NULL,
	"image_position" varchar(255) DEFAULT NULL,
	"button_group" uuid
);
--> statement-breakpoint
CREATE TABLE "block_html" (
	"id" uuid PRIMARY KEY,
	"raw_html" text DEFAULT 'null'
);
--> statement-breakpoint
CREATE TABLE "block_logocloud" (
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_logocloud_logos" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"block_logocloud_id" uuid,
	"directus_files_id" uuid
);
--> statement-breakpoint
CREATE TABLE "block_quote" (
	"content" text,
	"id" uuid PRIMARY KEY,
	"subtitle" varchar(255) DEFAULT NULL,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_richtext" (
	"content" text,
	"headline" varchar(255) DEFAULT NULL,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL,
	"alignment" varchar(255) DEFAULT 'center'
);
--> statement-breakpoint
CREATE TABLE "block_step_items" (
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL,
	"image" uuid,
	"content" text,
	"block_steps" uuid,
	"sort" integer,
	"button_group" uuid
);
--> statement-breakpoint
CREATE TABLE "block_steps" (
	"alternate_image_position" boolean DEFAULT false NOT NULL,
	"headline" text,
	"id" uuid PRIMARY KEY,
	"show_step_numbers" boolean DEFAULT true,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_team" (
	"content" text,
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_testimonial_slider_items" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"block_testimonial_slider_id" uuid,
	"testimonials_id" uuid
);
--> statement-breakpoint
CREATE TABLE "block_testimonials" (
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "block_video" (
	"headline" text,
	"id" uuid PRIMARY KEY,
	"title" varchar(255) DEFAULT NULL,
	"type" varchar(255) DEFAULT NULL,
	"video_file" uuid,
	"video_url" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"code" text,
	"name" text,
	"description" text,
	"image" uuid
);
--> statement-breakpoint
ALTER TABLE "brands" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "brands_categories" (
	"id" serial PRIMARY KEY,
	"brands_id" bigint,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "brands_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "brands_departments" (
	"id" serial PRIMARY KEY,
	"brands_id" bigint,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "brands_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "brands_manufacturer" (
	"id" serial PRIMARY KEY,
	"brands_id" bigint,
	"manufacturer_id" bigint
);
--> statement-breakpoint
ALTER TABLE "brands_manufacturer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "brands_products" (
	"id" serial PRIMARY KEY,
	"brands_id" bigint,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "brands_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "brands_shorts" (
	"id" serial PRIMARY KEY,
	"brands_id" bigint,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "brands_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "buyagain" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "buyagain" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar" (
	"id" serial PRIMARY KEY,
	"name" varchar(255),
	"day" integer,
	"month" json,
	"year" integer,
	"image" uuid,
	"status" boolean,
	"description" text,
	"favorite" boolean,
	"facebook_id" varchar(255),
	"google_id" varchar(255),
	"appointment" json
);
--> statement-breakpoint
ALTER TABLE "calendar" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar_comments" (
	"id" serial PRIMARY KEY,
	"calendar_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "calendar_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar_directus_users" (
	"id" serial PRIMARY KEY,
	"calendar_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "calendar_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY,
	"calendar_id" integer,
	"events_id" integer
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar_integrations" (
	"id" serial PRIMARY KEY,
	"calendar_id" integer,
	"integrations_id" integer
);
--> statement-breakpoint
ALTER TABLE "calendar_integrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar_lists" (
	"id" serial PRIMARY KEY,
	"calendar_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "calendar_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "careers" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"url" varchar(255),
	"description" text,
	"type" varchar(255),
	"image" uuid,
	"degree_level" varchar(255),
	"experience" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "careers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cart" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"session_id" uuid,
	"total_price" real,
	"user" uuid,
	"status" varchar(255),
	"subtotal" integer,
	"tax_amount" integer,
	"shipping_amount" integer,
	"discount_amount" integer,
	"total" integer,
	"currency" varchar(255),
	"coupon_code" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "cart" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cart_cart_items" (
	"id" serial PRIMARY KEY,
	"cart_id" integer,
	"cart_items_id" integer
);
--> statement-breakpoint
ALTER TABLE "cart_cart_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY,
	"quantity" integer,
	"metadata" json,
	"products" bigint,
	"cart" integer,
	"product_id" varchar(255),
	"price" integer,
	"total" integer,
	"variant_id" varchar(255),
	"variant" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "cart_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cart_products" (
	"id" serial PRIMARY KEY,
	"cart_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "cart_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"name" text,
	"description" text,
	"content" text,
	"image" uuid,
	"menus" json,
	"uid" varchar(255),
	"color" varchar(255),
	"colortext" varchar(255),
	"slug" varchar(255),
	"headline" text,
	"seo" uuid,
	"sort" integer,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories_departments" (
	"id" serial PRIMARY KEY,
	"categories_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "categories_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories_postgresstores" (
	"id" serial PRIMARY KEY,
	"categories_id" integer,
	"postgresstores_id" integer
);
--> statement-breakpoint
ALTER TABLE "categories_postgresstores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories_shorts" (
	"id" serial PRIMARY KEY,
	"categories_id" integer,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "categories_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "chart_entries" (
	"id" serial PRIMARY KEY,
	"chart_id" integer,
	"product_id" bigint,
	"position" integer,
	"last_position" integer,
	"streams" integer,
	"sales" integer,
	"score" real,
	"this_week" varchar(255),
	"last_week" varchar(255),
	"peak_position" varchar(255),
	"weeks_on_chart" varchar(255),
	"award" varchar(255),
	"color" varchar(255),
	"trend" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "chart_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "charts" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" varchar(255),
	"slug" varchar(255),
	"type" varchar(255),
	"icon" uuid,
	"date" date
);
--> statement-breakpoint
ALTER TABLE "charts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "charts_departments" (
	"id" serial PRIMARY KEY,
	"charts_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "charts_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "charts_products" (
	"id" serial PRIMARY KEY,
	"charts_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "charts_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "charts_radios" (
	"id" serial PRIMARY KEY,
	"charts_id" integer,
	"radios_id" integer
);
--> statement-breakpoint
ALTER TABLE "charts_radios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "chat" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid,
	"message" text
);
--> statement-breakpoint
ALTER TABLE "chat" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "circles_directus_users" (
	"id" serial PRIMARY KEY,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "circles_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "circles_posts" (
	"id" serial PRIMARY KEY,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "circles_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "circles_products" (
	"id" serial PRIMARY KEY,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "circles_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"postalCode" text,
	"image" uuid,
	"longitude" varchar(255),
	"latitude" varchar(255),
	"languagenames" text
);
--> statement-breakpoint
ALTER TABLE "cities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cities_countries" (
	"id" serial PRIMARY KEY,
	"cities_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "cities_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cities_states" (
	"id" serial PRIMARY KEY,
	"cities_id" integer
);
--> statement-breakpoint
ALTER TABLE "cities_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collections" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"name" text,
	"description" text,
	"image" uuid,
	"type" json
);
--> statement-breakpoint
ALTER TABLE "collections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collections_brands" (
	"id" serial PRIMARY KEY,
	"collections_id" bigint,
	"brands_id" bigint
);
--> statement-breakpoint
ALTER TABLE "collections_brands" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collections_products" (
	"id" serial PRIMARY KEY,
	"collections_id" bigint,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "collections_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collections_spaces" (
	"id" serial PRIMARY KEY,
	"collections_id" bigint,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "collections_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "colors" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "colors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text,
	"hex" text NOT NULL,
	"red" smallint,
	"green" smallint,
	"blue" smallint,
	"hue" smallint,
	"sat_hsl" smallint,
	"light_hsl" smallint,
	"sat_hsv" smallint,
	"val_hsv" smallint,
	"source" "color_source"
);
--> statement-breakpoint
ALTER TABLE "colors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY,
	"response" text,
	"media" uuid,
	"name" varchar(255),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"helpful" boolean,
	"type" varchar(255),
	"ratings_breakdown" varchar(255),
	"average_rating" varchar(255),
	"nickname" varchar(255),
	"summary" text,
	"review_count" integer,
	"context_type" varchar(255),
	"message_type" varchar(255),
	"is_live" boolean,
	"user" uuid
);
--> statement-breakpoint
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "comments_directus_users" (
	"id" serial PRIMARY KEY,
	"comment_id" integer,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "comments_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "comments_products" (
	"id" serial PRIMARY KEY,
	"comments_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "comments_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "comments_reactions" (
	"id" serial PRIMARY KEY,
	"comments_id" integer,
	"reactions_id" integer
);
--> statement-breakpoint
ALTER TABLE "comments_reactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "comments_shorts" (
	"id" serial PRIMARY KEY,
	"comments_id" integer,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "comments_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone,
	"name" varchar(255),
	"description" varchar(255),
	"connection_type" varchar(255),
	"user_a" varchar(255),
	"recipient" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "connections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "connections_directus_users" (
	"id" serial PRIMARY KEY,
	"connections_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "connections_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'active',
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"first_name" varchar(255) DEFAULT NULL,
	"last_name" varchar(255) DEFAULT NULL,
	"user" uuid CONSTRAINT "contacts_user_unique" UNIQUE,
	"email" varchar(255) DEFAULT NULL,
	"phone" varchar(255) DEFAULT NULL,
	"job_title" varchar(255) DEFAULT NULL,
	"contact_notes" text
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"title" varchar(255) DEFAULT NULL,
	"visitor_id" varchar(36) DEFAULT NULL,
	"item" varchar(255) DEFAULT NULL,
	"collection" varchar(255) DEFAULT NULL,
	"user_created" uuid,
	"user_updated" uuid,
	"organization" uuid
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" integer PRIMARY KEY,
	"name" varchar(100),
	"iso3" char(3),
	"iso2" char(2),
	"phonecode" varchar(255),
	"capital" varchar(255),
	"tld" varchar(255),
	"native" varchar(255),
	"translations" text,
	"latitude" numeric(10,8),
	"longitude" numeric(11,8),
	"emoji" varchar(191),
	"emojiU" varchar(191),
	"created_at" timestamp,
	"updated_at" timestamp,
	"flag" integer DEFAULT 1 NOT NULL,
	"wikiDataId" varchar(255),
	"region" json
);
--> statement-breakpoint
ALTER TABLE "countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "countries_currency" (
	"id" serial PRIMARY KEY,
	"countries_id" integer,
	"currency_id" integer
);
--> statement-breakpoint
ALTER TABLE "countries_currency" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "countries_timezones" (
	"id" serial PRIMARY KEY,
	"countries_id" integer,
	"timezones_id" integer
);
--> statement-breakpoint
ALTER TABLE "countries_timezones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "coupons_products" (
	"id" serial PRIMARY KEY,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "coupons_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "credit_memos" (
	"id" serial PRIMARY KEY,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"adjustment" integer,
	"adjustment_negative" integer,
	"adjustment_positive" integer,
	"base_adjustment" integer,
	"base_adjustment_negative" integer,
	"base_adjustment_positive" integer,
	"base_currency_code" text,
	"base_discount_amount" integer,
	"base_grand_total" integer,
	"base_discount_tax_compensation_amount" integer,
	"base_shipping_amount" integer,
	"base_shipping_discount_tax_compensation_amnt" integer,
	"base_shipping_incl_tax" integer,
	"base_shipping_tax_amount" integer,
	"base_subtotal" integer,
	"base_subtotal_incl_tax" integer,
	"base_tax_amount" integer,
	"base_to_global_rate" integer,
	"base_to_order_rate" integer,
	"creditmemo_status" integer,
	"discount_amount" integer,
	"discount_description" text,
	"email_sent" integer,
	"entity_id" integer,
	"global_currency_code" text,
	"grand_total" integer,
	"discount_tax_compensation_amount" integer,
	"increment_id" text,
	"invoice_id" integer,
	"order_currency_code" text,
	"shipping_amount" integer,
	"shipping_discount_tax_compensation_amount" integer,
	"shipping_incl_tax" integer,
	"shipping_tax_amount" integer,
	"state" integer,
	"store_currency_code" text,
	"store_id" integer,
	"store_to_base_rate" integer,
	"store_to_order_rate" integer,
	"subtotal" integer,
	"subtotal_incl_tax" integer,
	"tax_amount" integer,
	"user" uuid
);
--> statement-breakpoint
ALTER TABLE "credit_memos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cross_sell_products" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"user" uuid
);
--> statement-breakpoint
ALTER TABLE "cross_sell_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cross_sell_products_products" (
	"id" serial PRIMARY KEY,
	"cross_sell_products_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "currencies_countries" (
	"id" serial PRIMARY KEY,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "currencies_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "currency" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"code" varchar(255),
	"symbol" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "currency" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "currency_departments" (
	"id" serial PRIMARY KEY,
	"currency_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "currency_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "department_channels" (
	"id" serial PRIMARY KEY,
	"department_id" integer,
	"rules_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "department_channels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"content" text,
	"color" varchar(255),
	"image" uuid,
	"colortext" varchar(255),
	"menus" json,
	"callouts" json,
	"slug" varchar(255),
	"active" varchar(255),
	"relative_id" varchar(255),
	"type" varchar(255),
	"custom_domain" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments_categories" (
	"id" serial PRIMARY KEY,
	"departments_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "departments_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments_collections" (
	"id" serial PRIMARY KEY,
	"departments_id" integer,
	"collections_id" bigint
);
--> statement-breakpoint
ALTER TABLE "departments_collections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments_products" (
	"id" serial PRIMARY KEY,
	"departments_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "departments_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments_shorts" (
	"id" serial PRIMARY KEY,
	"departments_id" integer,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "departments_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departments_showcases" (
	"id" serial PRIMARY KEY,
	"departments_id" integer,
	"showcases_id" integer
);
--> statement-breakpoint
ALTER TABLE "departments_showcases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "digiboard" (
	"id" serial,
	"name" text NOT NULL,
	"board" text,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"image" uuid,
	CONSTRAINT "product_attribute_set_pkey" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "digiboard" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "digiboard_directus_users" (
	"id" serial PRIMARY KEY,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "digiboard_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_access" (
	"id" uuid PRIMARY KEY,
	"role" uuid,
	"user" uuid,
	"policy" uuid NOT NULL,
	"sort" integer
);
--> statement-breakpoint
ALTER TABLE "directus_access" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_activity" (
	"id" serial PRIMARY KEY,
	"action" varchar(45) NOT NULL,
	"user" uuid,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"ip" varchar(50),
	"user_agent" text,
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"origin" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "directus_activity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_collections" (
	"collection" varchar(64) PRIMARY KEY,
	"icon" varchar(64),
	"note" text,
	"display_template" varchar(255),
	"hidden" boolean DEFAULT false NOT NULL,
	"singleton" boolean DEFAULT false NOT NULL,
	"translations" json,
	"archive_field" varchar(64),
	"archive_app_filter" boolean DEFAULT true NOT NULL,
	"archive_value" varchar(255),
	"unarchive_value" varchar(255),
	"sort_field" varchar(64),
	"accountability" varchar(255) DEFAULT 'all',
	"color" varchar(255),
	"item_duplication_fields" json,
	"sort" integer,
	"group" varchar(64),
	"collapse" varchar(255) DEFAULT 'open' NOT NULL,
	"preview_url" varchar(255),
	"versioning" boolean DEFAULT false NOT NULL,
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"autosave_revision_interval" real
);
--> statement-breakpoint
ALTER TABLE "directus_collections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_comments" (
	"id" uuid PRIMARY KEY,
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"comment" text NOT NULL,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"date_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"user_updated" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_dashboards" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"icon" varchar(64) DEFAULT 'dashboard' NOT NULL,
	"note" text,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"color" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "directus_dashboards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_deployment_projects" (
	"id" uuid PRIMARY KEY,
	"deployment" uuid NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"url" varchar(255),
	"framework" varchar(255),
	"deployable" boolean DEFAULT true NOT NULL,
	CONSTRAINT "directus_deployment_projects_deployment_external_id_unique" UNIQUE("deployment","external_id")
);
--> statement-breakpoint
CREATE TABLE "directus_deployment_runs" (
	"id" uuid PRIMARY KEY,
	"project" uuid NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"target" varchar(255) NOT NULL,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"status" varchar(255),
	"url" varchar(255),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "directus_deployments" (
	"id" uuid PRIMARY KEY,
	"provider" varchar(255) NOT NULL CONSTRAINT "directus_deployments_provider_unique" UNIQUE,
	"credentials" text,
	"options" text,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"webhook_ids" json,
	"webhook_secret" varchar(255),
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "directus_extensions" (
	"enabled" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY,
	"folder" varchar(255) NOT NULL,
	"source" varchar(255) NOT NULL,
	"bundle" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_extensions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_fields" (
	"id" serial PRIMARY KEY,
	"collection" varchar(64) NOT NULL,
	"field" varchar(64) NOT NULL,
	"special" varchar(64),
	"interface" varchar(64),
	"options" json,
	"display" varchar(64),
	"display_options" json,
	"readonly" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"sort" integer,
	"width" varchar(30) DEFAULT 'full',
	"translations" json,
	"note" text,
	"conditions" json,
	"required" boolean DEFAULT false,
	"group" varchar(64),
	"validation" json,
	"validation_message" text,
	"searchable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directus_fields" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_files" (
	"id" uuid PRIMARY KEY,
	"storage" varchar(255) NOT NULL,
	"filename_disk" varchar(255),
	"filename_download" varchar(255) NOT NULL,
	"title" varchar(255),
	"type" varchar(255),
	"folder" uuid,
	"uploaded_by" uuid,
	"created_on" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified_by" uuid,
	"modified_on" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"charset" varchar(50),
	"filesize" bigint,
	"width" integer,
	"height" integer,
	"duration" integer,
	"embed" varchar(200),
	"description" text,
	"location" text,
	"tags" text,
	"metadata" json,
	"focal_point_x" integer,
	"focal_point_y" integer,
	"tus_id" varchar(64),
	"tus_data" json,
	"uploaded_on" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "directus_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_flows" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"icon" varchar(64),
	"color" varchar(255),
	"description" text,
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"trigger" varchar(255),
	"accountability" varchar(255) DEFAULT 'all',
	"options" json,
	"operation" uuid CONSTRAINT "directus_flows_operation_unique" UNIQUE,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_flows" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_folders" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"parent" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_folders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_migrations" (
	"version" varchar(255) PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "directus_migrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_notifications" (
	"id" serial PRIMARY KEY,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"status" varchar(255) DEFAULT 'inbox',
	"recipient" uuid NOT NULL,
	"sender" uuid,
	"subject" varchar(255) NOT NULL,
	"message" text,
	"collection" varchar(64),
	"item" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "directus_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_oauth_clients" (
	"client_id" varchar(255) PRIMARY KEY,
	"client_name" varchar(200) NOT NULL,
	"redirect_uris" json NOT NULL,
	"grant_types" json NOT NULL,
	"token_endpoint_auth_method" varchar(255) DEFAULT 'none' NOT NULL,
	"client_secret_hash" varchar(64),
	"registration_type" varchar(10) DEFAULT 'dcr' NOT NULL,
	"client_uri" text,
	"logo_uri" text,
	"tos_uri" text,
	"policy_uri" text,
	"metadata_fetched_at" timestamp with time zone,
	"metadata_expires_at" timestamp with time zone,
	"metadata_etag" varchar(255),
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "directus_oauth_codes" (
	"id" uuid PRIMARY KEY,
	"code_hash" varchar(64) NOT NULL CONSTRAINT "directus_oauth_codes_code_hash_unique" UNIQUE,
	"client" varchar(255) NOT NULL,
	"user" uuid NOT NULL,
	"redirect_uri" varchar(255) NOT NULL,
	"resource" varchar(255) NOT NULL,
	"code_challenge" varchar(128) NOT NULL,
	"code_challenge_method" varchar(10) NOT NULL,
	"scope" varchar(255),
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "directus_oauth_consents" (
	"id" uuid PRIMARY KEY,
	"user" uuid NOT NULL,
	"client" varchar(255) NOT NULL,
	"redirect_uri" varchar(255) NOT NULL,
	"scope" varchar(255),
	"date_created" timestamp with time zone NOT NULL,
	"date_updated" timestamp with time zone NOT NULL,
	CONSTRAINT "directus_oauth_consents_user_client_redirect_uri_unique" UNIQUE("user","client","redirect_uri")
);
--> statement-breakpoint
CREATE TABLE "directus_oauth_tokens" (
	"id" uuid PRIMARY KEY,
	"client" varchar(255) NOT NULL,
	"user" uuid NOT NULL,
	"session" varchar(64) NOT NULL,
	"previous_session" varchar(64),
	"resource" varchar(255) NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"scope" varchar(255),
	"expires_at" timestamp with time zone NOT NULL,
	"date_created" timestamp with time zone NOT NULL,
	CONSTRAINT "directus_oauth_tokens_client_user_unique" UNIQUE("client","user")
);
--> statement-breakpoint
CREATE TABLE "directus_operations" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255),
	"key" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"position_x" integer NOT NULL,
	"position_y" integer NOT NULL,
	"options" json,
	"resolve" uuid CONSTRAINT "directus_operations_resolve_unique" UNIQUE,
	"reject" uuid CONSTRAINT "directus_operations_reject_unique" UNIQUE,
	"flow" uuid NOT NULL,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_operations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_panels" (
	"id" uuid PRIMARY KEY,
	"dashboard" uuid NOT NULL,
	"name" varchar(255),
	"icon" varchar(64) DEFAULT NULL,
	"color" varchar(10),
	"show_header" boolean DEFAULT false NOT NULL,
	"note" text,
	"type" varchar(255) NOT NULL,
	"position_x" integer NOT NULL,
	"position_y" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"options" json,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_panels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_permissions" (
	"id" serial PRIMARY KEY,
	"collection" varchar(64) NOT NULL,
	"action" varchar(10) NOT NULL,
	"permissions" json,
	"validation" json,
	"presets" json,
	"fields" text,
	"policy" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directus_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_policies" (
	"id" uuid PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"icon" varchar(64) DEFAULT 'badge' NOT NULL,
	"description" text,
	"ip_access" text,
	"enforce_tfa" boolean DEFAULT false NOT NULL,
	"admin_access" boolean DEFAULT false NOT NULL,
	"app_access" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directus_policies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_presets" (
	"id" serial PRIMARY KEY,
	"bookmark" varchar(255),
	"user" uuid,
	"role" uuid,
	"collection" varchar(64),
	"search" varchar(100),
	"layout" varchar(100) DEFAULT 'tabular',
	"layout_query" json,
	"layout_options" json,
	"refresh_interval" integer,
	"filter" json,
	"icon" varchar(64) DEFAULT 'bookmark',
	"color" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "directus_presets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_relations" (
	"id" serial PRIMARY KEY,
	"many_collection" varchar(64) NOT NULL,
	"many_field" varchar(64) NOT NULL,
	"one_collection" varchar(64),
	"one_field" varchar(64),
	"one_collection_field" varchar(64),
	"one_allowed_collections" text,
	"junction_field" varchar(64),
	"sort_field" varchar(64),
	"one_deselect_action" varchar(255) DEFAULT 'nullify' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directus_relations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_revisions" (
	"id" serial PRIMARY KEY,
	"activity" integer NOT NULL,
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"data" json,
	"delta" json,
	"parent" integer,
	"version" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_revisions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_roles" (
	"id" uuid PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"icon" varchar(64) DEFAULT 'supervised_user_circle' NOT NULL,
	"description" text,
	"parent" uuid
);
--> statement-breakpoint
ALTER TABLE "directus_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_sessions" (
	"token" varchar(64) PRIMARY KEY,
	"user" uuid,
	"expires" timestamp with time zone NOT NULL,
	"ip" varchar(255),
	"user_agent" text,
	"share" uuid,
	"origin" varchar(255),
	"next_token" varchar(64),
	"oauth_client" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "directus_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_settings" (
	"id" serial PRIMARY KEY,
	"project_name" varchar(100) DEFAULT 'Directus' NOT NULL,
	"project_url" varchar(255),
	"project_color" varchar(255) DEFAULT '#6644FF' NOT NULL,
	"project_logo" uuid,
	"public_foreground" uuid,
	"public_background" uuid,
	"public_note" text,
	"auth_login_attempts" integer DEFAULT 25,
	"auth_password_policy" varchar(100),
	"storage_asset_transform" varchar(7) DEFAULT 'all',
	"storage_asset_presets" json,
	"custom_css" text,
	"storage_default_folder" uuid,
	"basemaps" json,
	"mapbox_key" varchar(255),
	"module_bar" json,
	"project_descriptor" varchar(100),
	"default_language" varchar(255) DEFAULT 'en-US' NOT NULL,
	"custom_aspect_ratios" json,
	"public_favicon" uuid,
	"default_appearance" varchar(255) DEFAULT 'auto' NOT NULL,
	"default_theme_light" varchar(255),
	"theme_light_overrides" json,
	"default_theme_dark" varchar(255),
	"theme_dark_overrides" json,
	"report_error_url" varchar(255),
	"report_bug_url" varchar(255),
	"report_feature_url" varchar(255),
	"public_registration" boolean DEFAULT false NOT NULL,
	"public_registration_verify_email" boolean DEFAULT true NOT NULL,
	"public_registration_role" uuid,
	"public_registration_email_filter" json,
	"visual_editor_urls" json,
	"project_id" uuid,
	"mcp_enabled" boolean DEFAULT false NOT NULL,
	"mcp_allow_deletes" boolean DEFAULT false NOT NULL,
	"mcp_prompts_collection" varchar(255) DEFAULT NULL,
	"mcp_system_prompt_enabled" boolean DEFAULT true NOT NULL,
	"mcp_system_prompt" text,
	"project_owner" varchar(255),
	"project_usage" varchar(255),
	"org_name" varchar(255),
	"product_updates" boolean,
	"project_status" varchar(255),
	"ai_openai_api_key" text,
	"ai_anthropic_api_key" text,
	"ai_system_prompt" text,
	"ai_google_api_key" text,
	"ai_openai_compatible_api_key" text,
	"ai_openai_compatible_base_url" text,
	"ai_openai_compatible_name" text,
	"ai_openai_compatible_models" json,
	"ai_openai_compatible_headers" json,
	"ai_openai_allowed_models" json,
	"ai_anthropic_allowed_models" json,
	"ai_google_allowed_models" json,
	"collaborative_editing_enabled" boolean DEFAULT false NOT NULL,
	"ai_translation_default_model" text,
	"ai_translation_glossary" json,
	"ai_translation_style_guide" text,
	"license_key" varchar(255) DEFAULT NULL,
	"license_token" text,
	"mcp_oauth_enabled" boolean DEFAULT false NOT NULL,
	"mcp_oauth_dcr_enabled" boolean DEFAULT false NOT NULL,
	"mcp_oauth_cimd_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directus_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_shares" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255),
	"collection" varchar(64) NOT NULL,
	"item" varchar(255) NOT NULL,
	"role" uuid,
	"password" varchar(255),
	"user_created" uuid,
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"date_start" timestamp with time zone,
	"date_end" timestamp with time zone,
	"times_used" integer DEFAULT 0,
	"max_uses" integer
);
--> statement-breakpoint
ALTER TABLE "directus_shares" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_translations" (
	"id" uuid PRIMARY KEY,
	"language" varchar(255) NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directus_translations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_users" (
	"id" uuid PRIMARY KEY,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"email" varchar(128) CONSTRAINT "directus_users_email_unique" UNIQUE,
	"password" varchar(255),
	"location" varchar(255),
	"title" varchar(50),
	"description" text,
	"tags" json,
	"avatar" uuid,
	"language" varchar(255) DEFAULT NULL,
	"tfa_secret" varchar(255),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"role" uuid,
	"token" varchar(255) CONSTRAINT "directus_users_token_unique" UNIQUE,
	"last_access" timestamp with time zone,
	"last_page" varchar(255),
	"provider" varchar(128) DEFAULT 'default' NOT NULL,
	"external_identifier" varchar(255) CONSTRAINT "directus_users_external_identifier_unique" UNIQUE,
	"auth_data" json,
	"email_notifications" boolean DEFAULT true,
	"appearance" varchar(255),
	"theme_dark" varchar(255),
	"theme_light" varchar(255),
	"theme_light_overrides" json,
	"theme_dark_overrides" json,
	"newsletter" boolean DEFAULT true,
	"text_direction" varchar(255) DEFAULT 'auto' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "directus_versions" (
	"id" uuid PRIMARY KEY,
	"key" varchar(64) NOT NULL,
	"name" varchar(255),
	"collection" varchar(64) NOT NULL,
	"item" varchar(255),
	"hash" varchar(255),
	"date_created" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"date_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"user_created" uuid,
	"user_updated" uuid,
	"delta" json
);
--> statement-breakpoint
ALTER TABLE "directus_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "emoji_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"target_type" text,
	"target_id" uuid NOT NULL,
	"user_id" uuid,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "emoji_reactions_target_type_check" CHECK ((target_type = ANY (ARRAY['video'::text, 'comment'::text])))
);
--> statement-breakpoint
ALTER TABLE "emoji_reactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "engagement_signals" (
	"id" serial PRIMARY KEY,
	"entity_type" text,
	"entity_id" integer,
	"signal_type" text,
	"weight" numeric,
	"ts" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "engagement_signals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"event_calendar" timestamp,
	"image" uuid,
	"location" varchar(255),
	"start_time" time,
	"end_time" time,
	"url" varchar(255),
	"postalcode" varchar(255),
	"type" varchar(255),
	"qr_code" varchar(255),
	"check_in" varchar(255),
	"rsvp_status" varchar(255),
	"rsvp_policies" json,
	"date" timestamp,
	"slug" varchar(255),
	"tickets_url" varchar(255),
	"address" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_cities" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
ALTER TABLE "events_cities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_countries" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "events_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_coupons" (
	"id" serial PRIMARY KEY,
	"events_id" integer
);
--> statement-breakpoint
ALTER TABLE "events_coupons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_directus_users" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "events_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_files" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "events_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_invoices" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"invoices_id" bigint
);
--> statement-breakpoint
ALTER TABLE "events_invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_lists" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "events_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_posts" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "events_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_products" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "events_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_states" (
	"id" serial PRIMARY KEY,
	"events_id" integer,
	"states_id" integer
);
--> statement-breakpoint
ALTER TABLE "events_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"user_updated" uuid,
	"question" varchar(255),
	"answer" text,
	"creator" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "faqs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "faqs_directus_users" (
	"id" serial PRIMARY KEY,
	"faqs_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "faqs_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "faqs_files" (
	"id" serial PRIMARY KEY,
	"faqs_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "faqs_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "faqs_products" (
	"id" serial PRIMARY KEY,
	"faqs_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "faqs_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "federated_spaces" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"activitypub_url" varchar(255),
	"syndication_type" varchar(255),
	"last_synced" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "federated_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "federated_spaces_spaces" (
	"id" serial PRIMARY KEY,
	"federated_spaces_id" integer,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feeds" (
	"id" bigserial PRIMARY KEY,
	"updated_at" timestamp with time zone,
	"user" uuid,
	"shop" integer,
	"context_id" uuid,
	"context_type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "feeds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feeds_posts" (
	"id" serial PRIMARY KEY,
	"feed_id" bigint,
	"post_id" integer
);
--> statement-breakpoint
ALTER TABLE "feeds_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "finance_index" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"previous_close" varchar(255),
	"day_range" varchar(255),
	"year_range" varchar(255),
	"today_price" varchar(255),
	"stock_up_down" boolean,
	"stock_exchange_name" varchar(255),
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "finance_index" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "finance_index_articles" (
	"id" serial PRIMARY KEY,
	"finance_index_id" integer,
	"articles_id" integer
);
--> statement-breakpoint
ALTER TABLE "finance_index_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "finance_index_currency" (
	"id" serial PRIMARY KEY,
	"finance_index_id" integer,
	"currency_id" integer
);
--> statement-breakpoint
ALTER TABLE "finance_index_currency" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "finance_index_region" (
	"id" serial PRIMARY KEY,
	"finance_index_id" integer,
	"region_id" integer
);
--> statement-breakpoint
ALTER TABLE "finance_index_region" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "followers" (
	"id" serial PRIMARY KEY,
	"following_id" uuid,
	"follower_id" uuid,
	"profile_following" uuid DEFAULT gen_random_uuid() CONSTRAINT "followers_profile_following_key" UNIQUE,
	"profile_followers" uuid DEFAULT gen_random_uuid() CONSTRAINT "followers_profile_followers_key" UNIQUE
);
--> statement-breakpoint
ALTER TABLE "followers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "forms" (
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"id" uuid PRIMARY KEY,
	"key" varchar(255) DEFAULT NULL,
	"on_success" varchar(255) DEFAULT NULL,
	"redirect_url" varchar(255) DEFAULT NULL,
	"schema" json,
	"sort" integer,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"submit_label" varchar(255) DEFAULT NULL,
	"success_message" text,
	"title" varchar(255) DEFAULT NULL,
	"user_created" uuid,
	"user_updated" uuid
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"message" text
);
--> statement-breakpoint
CREATE TABLE "friend_requests_address" (
	"id" serial PRIMARY KEY,
	"friend_requests_id" integer,
	"address_id" integer
);
--> statement-breakpoint
CREATE TABLE "friend_requests_profiles" (
	"id" serial PRIMARY KEY,
	"friend_requests_id" integer,
	"profiles_id" uuid
);
--> statement-breakpoint
CREATE TABLE "friend_suggestions" (
	"id" serial PRIMARY KEY,
	"reason" text,
	"score" varchar(255),
	"mutual_friends" text
);
--> statement-breakpoint
CREATE TABLE "friend_suggestions_profiles" (
	"id" serial PRIMARY KEY,
	"friend_suggestions_id" integer,
	"profiles_id" uuid
);
--> statement-breakpoint
CREATE TABLE "gamification" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"user_created" uuid,
	"user_updated" uuid,
	"name" varchar(255),
	"time_limit" timestamp,
	"user_profile" integer,
	"ranks" json,
	"achievement_type" json,
	"points_type" json,
	"open_badge_compatible" varchar(255),
	"nomination_user" uuid,
	"birthdays" uuid,
	"leaderboards" uuid,
	"anniversaries" uuid,
	"progress" varchar(255),
	"daily_login_rewards" timestamp with time zone,
	"time_based_awards" timestamp,
	"referrals" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "gamification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gamification_directus_users" (
	"id" serial PRIMARY KEY,
	"gamification_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "gamification_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gamification_events" (
	"id" serial PRIMARY KEY,
	"gamification_id" integer,
	"events_id" integer
);
--> statement-breakpoint
ALTER TABLE "gamification_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gamification_notifications" (
	"id" serial PRIMARY KEY,
	"gamification_id" integer,
	"notifications_id" integer
);
--> statement-breakpoint
ALTER TABLE "gamification_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gamification_products" (
	"id" serial PRIMARY KEY,
	"gamification_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "gamification_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gamification_videos" (
	"id" serial PRIMARY KEY,
	"gamification_id" integer,
	"videos_id" integer
);
--> statement-breakpoint
ALTER TABLE "gamification_videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "geo_regions" (
	"id" serial PRIMARY KEY,
	"delivery_sla" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"name" varchar(255),
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "geo_regions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "geo_regions_cities" (
	"id" serial PRIMARY KEY,
	"geo_regions_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
CREATE TABLE "geo_regions_countries" (
	"id" serial PRIMARY KEY,
	"geo_regions_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
CREATE TABLE "geo_regions_states" (
	"id" serial PRIMARY KEY,
	"geo_regions_id" integer,
	"states_id" integer
);
--> statement-breakpoint
CREATE TABLE "globals" (
	"address_country" varchar(255) DEFAULT NULL,
	"address_locality" varchar(255) DEFAULT NULL,
	"address_region" varchar(255) DEFAULT NULL,
	"build_hook_url" varchar(255) DEFAULT NULL,
	"description" text,
	"email" varchar(255) DEFAULT NULL,
	"id" uuid PRIMARY KEY,
	"og_image" uuid,
	"phone" varchar(255) DEFAULT NULL,
	"postal_code" varchar(255) DEFAULT NULL,
	"social_links" json DEFAULT '[]',
	"street_address" varchar(255) DEFAULT NULL,
	"tagline" varchar(255) DEFAULT NULL,
	"title" varchar(255) DEFAULT NULL,
	"url" varchar(255) DEFAULT NULL,
	"logo_on_dark_bg" uuid,
	"logo_on_light_bg" uuid,
	"theme" json
);
--> statement-breakpoint
CREATE TABLE "help_articles" (
	"content" text,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"help_collection" uuid,
	"id" uuid PRIMARY KEY,
	"owner" uuid,
	"slug" varchar(255) DEFAULT NULL,
	"sort" integer,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"summary" text,
	"title" varchar(255) DEFAULT NULL,
	"user_created" uuid,
	"user_updated" uuid
);
--> statement-breakpoint
CREATE TABLE "help_collections" (
	"description" text,
	"icon" varchar(255) DEFAULT NULL,
	"id" uuid PRIMARY KEY,
	"slug" varchar(255) DEFAULT NULL,
	"sort" integer,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "help_feedback" (
	"comments" text,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"id" uuid PRIMARY KEY,
	"rating" integer,
	"title" varchar(255) DEFAULT NULL,
	"url" varchar(255) DEFAULT NULL,
	"user_created" uuid,
	"user_updated" uuid,
	"visitor_id" varchar(36) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox" (
	"data" json DEFAULT '{}',
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"form" uuid,
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"status" varchar(255) DEFAULT 'new',
	"user_created" uuid,
	"user_updated" uuid,
	"project" uuid,
	"task" uuid
);
--> statement-breakpoint
CREATE TABLE "incentives" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"incentive_type" varchar(255),
	"amount" numeric(10,5),
	"user_id" uuid,
	"expires_at" timestamp with time zone,
	"metadata" json
);
--> statement-breakpoint
ALTER TABLE "incentives" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "incentives_currency" (
	"id" serial PRIMARY KEY,
	"incentives_id" integer,
	"currency_id" integer
);
--> statement-breakpoint
ALTER TABLE "incentives_currency" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "incentives_orders" (
	"id" serial PRIMARY KEY,
	"incentives_id" integer,
	"orders_id" integer
);
--> statement-breakpoint
ALTER TABLE "incentives_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "incentives_products" (
	"id" serial PRIMARY KEY,
	"incentives_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "incentives_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"url" varchar(255),
	"commands" varchar(255),
	"description" text,
	"version" varchar(255),
	"developer" varchar(255),
	"is_cost" varchar(255),
	"system_requirements" json,
	"publisher_info" text,
	"warnings" text,
	"disclaimers" text,
	"terms" text,
	"permissions" text,
	"type" varchar(255),
	"ratings" varchar(255),
	"price" real,
	"features" json
);
--> statement-breakpoint
ALTER TABLE "integrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_attributes" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"attributes_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_attributes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_categories" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_departments" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_files" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "integrations_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_platform" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"platform_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_platform" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_product_types" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"product_types_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_product_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_ratings" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"ratings_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_report" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"report_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_report" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_spaces" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "integrations_tags" (
	"id" serial PRIMARY KEY,
	"integrations_id" integer,
	"tags_id" integer
);
--> statement-breakpoint
ALTER TABLE "integrations_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory_lots" (
	"id" serial PRIMARY KEY,
	"location_id" integer,
	"qty" integer,
	"batch" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "inventory_lots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"base_currency_code" text,
	"base_discount_amount" integer,
	"base_grand_total" integer,
	"base_discount_tax_compensation_amount" integer,
	"base_shipping_amount" integer,
	"base_shipping_discount_tax_compensation_amnt" integer,
	"base_shipping_incl_tax" integer,
	"base_shipping_tax_amount" integer,
	"base_subtotal" integer,
	"base_subtotal_incl_tax" integer,
	"base_tax_amount" integer,
	"base_total_refunded" integer,
	"base_to_global_rate" integer,
	"base_to_order_rate" integer,
	"can_void_flag" integer,
	"discount_amount" integer,
	"discount_description" text,
	"email_sent" integer,
	"entity_id" integer,
	"global_currency_code" text,
	"grand_total" integer,
	"discount_tax_compensation_amount" integer,
	"increment_id" text,
	"is_used_for_refund" integer,
	"order_currency_code" text,
	"shipping_amount" integer,
	"shipping_discount_tax_compensation_amount" integer,
	"shipping_incl_tax" integer,
	"shipping_tax_amount" integer,
	"state" integer,
	"store_currency_code" text,
	"store_id" integer,
	"store_to_base_rate" integer,
	"store_to_order_rate" integer,
	"subtotal" integer,
	"subtotal_incl_tax" integer,
	"tax_amount" integer,
	"total_qty" integer,
	"user" uuid,
	"plan" varchar(255),
	"service_period" varchar(255),
	"payment_period" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices_address" (
	"id" serial PRIMARY KEY,
	"invoice_id" bigint,
	"address_id" integer
);
--> statement-breakpoint
ALTER TABLE "invoices_address" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices_orders" (
	"id" serial PRIMARY KEY,
	"invoice_id" bigint,
	"order_id" integer
);
--> statement-breakpoint
ALTER TABLE "invoices_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices_shipping_address" (
	"id" serial PRIMARY KEY,
	"invoice_id" bigint,
	"shipping_address_id" integer
);
--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices_transactions" (
	"id" serial PRIMARY KEY,
	"invoice_id" bigint,
	"transaction_id" bigint
);
--> statement-breakpoint
ALTER TABLE "invoices_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "list_items" (
	"id" serial PRIMARY KEY,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"list_id" integer,
	"post_id" integer,
	"title" varchar(255),
	"description" text,
	"status" varchar(255),
	"due_date" timestamp,
	"link" varchar(255),
	"media" uuid,
	"priority" varchar(255),
	"position" integer,
	"is_checked" boolean,
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "list_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "list_items_directus_users" (
	"id" serial PRIMARY KEY,
	"list_items_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "list_items_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "list_items_products" (
	"id" serial PRIMARY KEY,
	"list_items_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "list_items_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "list_products" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone,
	"product_sku" varchar(255),
	"quantity" integer
);
--> statement-breakpoint
ALTER TABLE "list_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "list_products_lists" (
	"id" serial PRIMARY KEY,
	"list_products_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "list_products_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid,
	"type" varchar(255),
	"status" varchar(255),
	"favorite" varchar(255),
	"product_sku" json,
	"slug" varchar(255),
	"priority" varchar(255),
	"progress" integer
);
--> statement-breakpoint
ALTER TABLE "lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_categories" (
	"id" serial PRIMARY KEY,
	"lists_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_departments" (
	"id" serial PRIMARY KEY,
	"lists_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_directus_users" (
	"id" serial PRIMARY KEY,
	"list_id" integer,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "lists_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_files" (
	"id" serial PRIMARY KEY,
	"lists_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "lists_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_products" (
	"id" serial PRIMARY KEY,
	"lists_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "lists_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_shorts" (
	"id" serial PRIMARY KEY,
	"lists_id" integer,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_template" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"title" varchar(255),
	"visibility" varchar(255),
	"icon" varchar(255),
	"theme" varchar(255),
	"description" text,
	"type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "lists_template" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_template_directus_users" (
	"id" serial PRIMARY KEY,
	"lists_template_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_template_list_items" (
	"id" serial PRIMARY KEY,
	"lists_template_id" integer,
	"list_items_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_template_list_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_template_tags" (
	"id" serial PRIMARY KEY,
	"lists_template_id" integer,
	"tags_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_template_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_templates" (
	"id" serial PRIMARY KEY,
	"lists_id" integer,
	"templates_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_type" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"visibility" varchar(255),
	"category" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "lists_type" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_type_categories" (
	"id" serial PRIMARY KEY,
	"lists_type_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_type_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lists_type_lists" (
	"id" serial PRIMARY KEY,
	"lists_type_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "lists_type_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "manufacturer" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"code" text,
	"name" text,
	"description" text,
	"isPublic" boolean,
	"image" uuid
);
--> statement-breakpoint
ALTER TABLE "manufacturer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "manufacturer_countries" (
	"id" serial PRIMARY KEY,
	"manufacturer_id" bigint,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "manufacturer_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"user" uuid,
	"profile_id" uuid
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY,
	"media_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
CREATE TABLE "media_folders" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"user" uuid,
	"parent_folder" integer
);
--> statement-breakpoint
CREATE TABLE "media_folders_directus_users" (
	"id" serial PRIMARY KEY,
	"media_folders_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
CREATE TABLE "meeovistores" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"content" text,
	"color" varchar(255),
	"colortext" varchar(255),
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "meeovistores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "meilisearch_settings" (
	"id" serial PRIMARY KEY,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"host" varchar(255) DEFAULT NULL,
	"api_key" varchar(255) DEFAULT NULL,
	"collections_configuration" json DEFAULT '[]'
);
--> statement-breakpoint
ALTER TABLE "meilisearch_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member_groups_events" (
	"id" serial PRIMARY KEY,
	"events_id" integer
);
--> statement-breakpoint
ALTER TABLE "member_groups_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member_groups_polls" (
	"id" serial PRIMARY KEY,
	"polls_id" integer
);
--> statement-breakpoint
ALTER TABLE "member_groups_polls" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member_groups_posts" (
	"id" serial PRIMARY KEY,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "member_groups_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member_groups_products" (
	"id" serial PRIMARY KEY,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "member_groups_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member_groups_space_members" (
	"id" serial PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "member_groups_space_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "merch_recipes" (
	"id" serial PRIMARY KEY,
	"department_id" integer,
	"inputs_json" jsonb,
	"constraints_json" jsonb,
	"output_slots" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "merch_recipes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"title" varchar(255),
	"content" text,
	"conversation" uuid,
	"text" text,
	"visitor_id" varchar(36) DEFAULT NULL,
	"contact_id" varchar(36) DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "moments" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone,
	"content" text,
	"type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "moments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "moments_products" (
	"id" serial PRIMARY KEY,
	"moments_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "moments_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "moments_spaces" (
	"id" serial PRIMARY KEY,
	"moments_id" integer,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "moments_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "musicchart" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid,
	"this_week" varchar(255),
	"last_week" varchar(255),
	"peak_position" varchar(255),
	"weeks_on_chart" varchar(255),
	"award" varchar(255),
	"color" varchar(255),
	"type" varchar(255),
	"creator" varchar(255),
	"previous_position" varchar(255),
	"first_appearance" varchar(255),
	"current_sales" varchar(255),
	"previous_sales" varchar(255),
	"trend" varchar(255),
	"seller" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "musicchart" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "musicchart_departments" (
	"id" serial PRIMARY KEY,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "musicchart_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "navigation" (
	"id" serial PRIMARY KEY,
	"type" varchar(255),
	"name" varchar(255),
	"url" varchar(255),
	"image" uuid,
	"submenus" json,
	"menus" json,
	"description" text,
	"color" varchar(255),
	"colortext" varchar(255),
	"custom_tabs" json,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"title" varchar(255) DEFAULT NULL,
	"user_created" uuid,
	"user_updated" uuid,
	"items" jsonb DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "navigation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "navigation_pages" (
	"id" serial PRIMARY KEY,
	"navigation_id" integer,
	"pages_id" integer
);
--> statement-breakpoint
ALTER TABLE "navigation_pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "navigation_websites" (
	"id" serial PRIMARY KEY,
	"navigation_id" integer,
	"websites_id" bigint
);
--> statement-breakpoint
ALTER TABLE "navigation_websites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" serial,
	"email" text NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"status" varchar(255),
	CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "newsletters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"content" text,
	"is_read" boolean,
	"image" uuid,
	"payload" json,
	"type" varchar(255),
	"recipient" uuid
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY,
	"quantity" integer,
	"price" numeric(10,5)
);
--> statement-breakpoint
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "order_items_orders" (
	"id" serial PRIMARY KEY,
	"order_items_id" integer,
	"orders_id" integer
);
--> statement-breakpoint
ALTER TABLE "order_items_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "order_items_products" (
	"id" serial PRIMARY KEY,
	"order_items_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "order_items_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"type" varchar(255),
	"adjustment_negative" integer,
	"adjustment_positive" integer,
	"applied_rule_ids" text,
	"base_adjustment_negative" integer,
	"base_adjustment_positive" integer,
	"base_currency_code" text,
	"base_discount_amount" integer,
	"base_discount_canceled" integer,
	"base_discount_invoiced" integer,
	"base_discount_refunded" integer,
	"base_grand_total" integer,
	"base_discount_tax_compensation_amount" integer,
	"base_discount_tax_compensation_invoiced" integer,
	"base_discount_tax_compensation_refunded" integer,
	"base_shipping_amount" integer,
	"base_shipping_canceled" integer,
	"base_shipping_discount_amount" integer,
	"base_shipping_discount_tax_compensation_amnt" integer,
	"base_shipping_incl_tax" integer,
	"base_shipping_invoiced" integer,
	"base_shipping_refunded" integer,
	"base_shipping_tax_amount" integer,
	"base_shipping_tax_refunded" integer,
	"base_subtotal" integer,
	"base_subtotal_canceled" integer,
	"base_subtotal_incl_tax" integer,
	"base_subtotal_invoiced" integer,
	"base_subtotal_refunded" integer,
	"base_tax_amount" integer,
	"base_tax_canceled" integer,
	"base_tax_invoiced" integer,
	"base_tax_refunded" integer,
	"base_total_canceled" integer,
	"base_total_due" integer,
	"base_total_invoiced" integer,
	"base_total_invoiced_cost" integer,
	"base_total_offline_refunded" integer,
	"base_total_online_refunded" integer,
	"base_total_paid" integer,
	"base_total_qty_ordered" integer,
	"base_total_refunded" integer,
	"base_to_global_rate" integer,
	"base_to_order_rate" integer,
	"billing_address_id" integer,
	"can_ship_partially" integer,
	"can_ship_partially_item" integer,
	"coupon_code" text,
	"customer_dob" text,
	"customer_email" text,
	"customer_firstname" text,
	"customer_gender" integer,
	"customer_group_id" integer,
	"customer_id" integer,
	"customer_is_guest" integer,
	"customer_lastname" text,
	"customer_middlename" text,
	"customer_note" text,
	"customer_note_notify" integer,
	"customer_prefix" text,
	"customer_suffix" text,
	"customer_taxvat" text,
	"discount_amount" integer,
	"discount_canceled" integer,
	"discount_description" text,
	"discount_invoiced" integer,
	"discount_refunded" integer,
	"edit_increment" integer,
	"email_sent" integer,
	"entity_id" integer,
	"ext_customer_id" text,
	"ext_order_id" text,
	"forced_shipment_with_invoice" integer,
	"global_currency_code" text,
	"grand_total" integer,
	"discount_tax_compensation_amount" integer,
	"discount_tax_compensation_invoiced" integer,
	"discount_tax_compensation_refunded" integer,
	"hold_before_state" text,
	"hold_before_status" text,
	"increment_id" text,
	"is_virtual" integer,
	"order_currency_code" text,
	"original_increment_id" text,
	"payment_authorization_amount" integer,
	"payment_auth_expiration" integer,
	"protect_code" text,
	"quote_address_id" integer,
	"quote_id" integer,
	"relation_child_id" text,
	"relation_child_real_id" text,
	"relation_parent_id" text,
	"relation_parent_real_id" text,
	"remote_ip" text,
	"shipping_amount" integer,
	"shipping_canceled" integer,
	"shipping_description" text,
	"shipping_discount_amount" integer,
	"shipping_discount_tax_compensation_amount" integer,
	"shipping_incl_tax" integer,
	"shipping_invoiced" integer,
	"shipping_refunded" integer,
	"shipping_tax_amount" integer,
	"shipping_tax_refunded" integer,
	"state" text,
	"store_currency_code" text,
	"store_id" integer,
	"store_name" text,
	"store_to_base_rate" integer,
	"store_to_order_rate" integer,
	"subtotal" integer,
	"subtotal_canceled" integer,
	"subtotal_incl_tax" integer,
	"subtotal_invoiced" integer,
	"subtotal_refunded" integer,
	"tax_amount" integer,
	"tax_canceled" integer,
	"tax_invoiced" integer,
	"tax_refunded" integer,
	"total_canceled" integer,
	"total_due" integer,
	"total_invoiced" integer,
	"total_item_count" integer,
	"total_offline_refunded" integer,
	"total_online_refunded" integer,
	"total_paid" integer,
	"total_qty_ordered" integer,
	"total_refunded" integer,
	"weight" integer,
	"x_forwarded_for" text,
	"payment_status" varchar(255),
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders_products" (
	"id" serial PRIMARY KEY,
	"orders_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "orders_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_addresses" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"organization" uuid,
	"name" varchar(255) DEFAULT NULL,
	"street_address" varchar(255) DEFAULT NULL,
	"postal_code" varchar(255) DEFAULT NULL,
	"address_region" varchar(255) DEFAULT NULL,
	"address_country" varchar(255) DEFAULT 'US',
	"address_locality" varchar(255) DEFAULT NULL,
	"is_primary_billing" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"website" varchar(255) DEFAULT NULL,
	"logo" uuid,
	"brand_color" varchar(255) DEFAULT NULL,
	"organization_notes" text,
	"email" varchar(255) DEFAULT NULL,
	"payment_terms" uuid,
	"owner" uuid,
	"phone" varchar(255) DEFAULT NULL,
	"folder" uuid,
	"stripe_customer_id" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations_contacts" (
	"id" uuid PRIMARY KEY,
	"contacts_id" uuid,
	"organizations_id" uuid,
	"sort" integer
);
--> statement-breakpoint
CREATE TABLE "os_activities" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"deal" uuid,
	"activity_type" varchar(255) DEFAULT NULL,
	"activity_notes" text,
	"name" varchar(255) DEFAULT NULL,
	"organization" uuid,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"due_date" timestamp with time zone,
	"assigned_to" uuid
);
--> statement-breakpoint
CREATE TABLE "os_activity_contacts" (
	"id" uuid PRIMARY KEY,
	"os_activities_id" uuid,
	"contacts_id" uuid
);
--> statement-breakpoint
CREATE TABLE "os_deal_contacts" (
	"id" uuid PRIMARY KEY,
	"primary" boolean,
	"os_deals_id" uuid,
	"contacts_id" uuid,
	"sort" integer
);
--> statement-breakpoint
CREATE TABLE "os_deal_stages" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"color" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "os_deals" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"owner" uuid,
	"organization" uuid,
	"close_date" date,
	"deal_stage" uuid,
	"next_contact_date" timestamp,
	"deal_value" integer,
	"deal_notes" text
);
--> statement-breakpoint
CREATE TABLE "os_email_templates" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"subject" varchar(255) DEFAULT NULL,
	"body" text,
	"name" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "os_expenses" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"category" varchar(255) DEFAULT NULL,
	"name" varchar(255) DEFAULT NULL,
	"cost" numeric(10,2) DEFAULT 'NULL',
	"description" text,
	"date" timestamp with time zone,
	"file" uuid,
	"project" uuid,
	"is_billable" boolean DEFAULT false,
	"invoice_item" uuid,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"is_reimbursable" boolean DEFAULT false,
	"user_submitted" uuid
);
--> statement-breakpoint
CREATE TABLE "os_invoice_items" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"invoice" uuid,
	"line_item_number" integer,
	"description" text,
	"tax_rate" uuid,
	"tax_amount" numeric(10,2) DEFAULT 'NULL',
	"unit_price" numeric(10,2) DEFAULT 'NULL',
	"quantity" numeric(10,2) DEFAULT 'NULL',
	"line_amount" numeric(10,2) DEFAULT 'NULL',
	"billable_expense" uuid,
	"item" uuid,
	"type" varchar(255) DEFAULT 'item',
	"item_name" varchar(255) DEFAULT NULL,
	"override_unit_price" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "os_invoices" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"invoice_number" varchar(255) DEFAULT NULL,
	"due_date" timestamp with time zone,
	"reference" varchar(255) DEFAULT NULL,
	"organization" uuid,
	"contact" uuid,
	"issue_date" timestamp with time zone,
	"project" uuid,
	"subtotal" numeric(10,5) DEFAULT 'NULL',
	"total_tax" numeric(10,5) DEFAULT 'NULL',
	"total" numeric(10,5) DEFAULT 'NULL',
	"amount_paid" numeric(10,5) DEFAULT 'NULL',
	"amount_due" numeric(10,5) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE "os_items" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'active',
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"description" text,
	"unit_price" numeric(10,2) DEFAULT 'NULL',
	"default_tax_rate" uuid,
	"icon" varchar(255) DEFAULT NULL,
	"unit_cost" numeric(10,2) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE "os_payment_terms" (
	"id" uuid PRIMARY KEY,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "os_payments" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'pending',
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"payment_date" timestamp with time zone,
	"amount" numeric(10,2) DEFAULT 'NULL',
	"stripe_payment_id" varchar(255) DEFAULT NULL,
	"organization" uuid,
	"contact" uuid,
	"invoice" uuid,
	"metadata" json,
	"payment_method_type" varchar(255) DEFAULT NULL,
	"receipt_url" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "os_project_contacts" (
	"id" uuid PRIMARY KEY,
	"os_projects_id" uuid,
	"contacts_id" uuid,
	"sort" integer
);
--> statement-breakpoint
CREATE TABLE "os_project_templates" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"tasks" json,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "os_project_updates" (
	"id" uuid PRIMARY KEY,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"project" uuid,
	"message" text
);
--> statement-breakpoint
CREATE TABLE "os_projects" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'new',
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"organization" uuid,
	"description" text,
	"owner" uuid,
	"start_date" timestamp with time zone,
	"due_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "os_proposal_approvals" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"signature_text" varchar(255) DEFAULT NULL,
	"signature_image" uuid,
	"signature_type" varchar(255) DEFAULT NULL,
	"first_name" varchar(255) DEFAULT NULL,
	"last_name" varchar(255) DEFAULT NULL,
	"organization" varchar(255) DEFAULT NULL,
	"proposal" uuid,
	"email" varchar(255) DEFAULT NULL,
	"metadata" json,
	"ip_address" varchar(255) DEFAULT NULL,
	"esignature_agreement" boolean DEFAULT false,
	"contact" uuid
);
--> statement-breakpoint
CREATE TABLE "os_proposal_blocks" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"os_proposals_id" uuid,
	"item" varchar(255) DEFAULT NULL,
	"collection" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "os_proposal_contacts" (
	"id" uuid PRIMARY KEY,
	"os_proposals_id" uuid,
	"contacts_id" uuid,
	"sort" integer
);
--> statement-breakpoint
CREATE TABLE "os_proposals" (
	"id" uuid PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"organization" uuid,
	"deal" uuid,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"expiration_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "os_settings" (
	"id" uuid PRIMARY KEY,
	"next_invoice_number" integer,
	"next_proposal_number" integer,
	"organization_folder_root" uuid
);
--> statement-breakpoint
CREATE TABLE "os_task_files" (
	"id" uuid PRIMARY KEY,
	"os_tasks_id" uuid,
	"directus_files_id" uuid,
	"sort" integer
);
--> statement-breakpoint
CREATE TABLE "os_tasks" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'pending',
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"project" uuid,
	"name" varchar(255) DEFAULT NULL,
	"description" text,
	"assigned_to" uuid,
	"due_date" timestamp with time zone,
	"is_visible_to_client" boolean DEFAULT false NOT NULL,
	"type" varchar(255) DEFAULT 'tasks' NOT NULL,
	"date_completed" timestamp with time zone,
	"responsibility" varchar(255) DEFAULT NULL,
	"start_date" timestamp with time zone,
	"embed_url" varchar(255) DEFAULT NULL,
	"form" uuid
);
--> statement-breakpoint
CREATE TABLE "os_tax_rates" (
	"id" uuid PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255) DEFAULT NULL,
	"rate" numeric(10,5) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE "outlets" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"color" varchar(255),
	"colortext" varchar(255),
	"description" text,
	"image" uuid,
	"callouts" json,
	"uid" varchar(255),
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "outlets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "outlets_categories" (
	"id" serial PRIMARY KEY,
	"outlets_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "outlets_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "outlets_shorts" (
	"id" serial PRIMARY KEY,
	"outlets_id" integer,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "outlets_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"content" json,
	"menus" json,
	"pages_id" uuid,
	"item" varchar(255) DEFAULT NULL,
	"collection" varchar(255) DEFAULT NULL,
	"hide_block" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "page_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "page_blocks_files" (
	"id" serial PRIMARY KEY,
	"page_blocks_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "page_blocks_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"content" text,
	"list" json,
	"type" varchar(255),
	"link" varchar(255),
	"image" uuid,
	"repeaterTextBox" json,
	"slug" varchar(255),
	"seo" uuid,
	"user_created" varchar(36) DEFAULT NULL,
	"user_updated" varchar(36) DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pages_blog" (
	"featured_post" uuid,
	"headline" text,
	"id" uuid PRIMARY KEY,
	"seo" uuid,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "pages_projects" (
	"headline" text,
	"id" uuid PRIMARY KEY,
	"seo" uuid,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"description" text,
	"gateway" varchar(255),
	"amount" numeric(10,5),
	"created_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments_countries" (
	"id" serial PRIMARY KEY,
	"payment_id" integer,
	"country_id" integer
);
--> statement-breakpoint
ALTER TABLE "payments_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments_currency" (
	"id" serial PRIMARY KEY,
	"payments_id" integer,
	"currency_id" integer
);
--> statement-breakpoint
ALTER TABLE "payments_currency" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments_directus_users" (
	"id" serial PRIMARY KEY,
	"payments_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "payments_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments_orders" (
	"id" serial PRIMARY KEY,
	"payments_id" integer,
	"orders_id" integer
);
--> statement-breakpoint
ALTER TABLE "payments_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pickup_locations" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"phone" bigint,
	"address" varchar(255),
	"postcode" varchar(255),
	"pickup_location_code" varchar(255),
	"contact_name" varchar(255),
	"email" varchar(255),
	"fax" varchar(255),
	"latitude" varchar(255),
	"longitude" varchar(255),
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "pickup_locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pickup_locations_city" (
	"id" serial PRIMARY KEY,
	"pickup_locations_id" integer,
	"item" varchar(255),
	"collection" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "pickup_locations_city" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pickup_locations_country" (
	"id" serial PRIMARY KEY,
	"pickup_locations_id" integer,
	"item" varchar(255),
	"collection" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "pickup_locations_country" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pickup_locations_state" (
	"id" serial PRIMARY KEY,
	"pickup_locations_id" integer,
	"item" varchar(255),
	"collection" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "pickup_locations_state" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid
);
--> statement-breakpoint
ALTER TABLE "platform" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_articles" (
	"id" serial PRIMARY KEY,
	"platform_id" integer,
	"articles_id" integer
);
--> statement-breakpoint
ALTER TABLE "platform_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_categories" (
	"id" serial PRIMARY KEY,
	"platform_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "platform_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_lists" (
	"id" serial PRIMARY KEY,
	"platform_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "platform_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_navigation" (
	"id" serial PRIMARY KEY,
	"platform_id" integer,
	"navigation_id" integer
);
--> statement-breakpoint
ALTER TABLE "platform_navigation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_page_blocks" (
	"id" serial PRIMARY KEY,
	"platform_id" integer,
	"page_blocks_id" integer
);
--> statement-breakpoint
ALTER TABLE "platform_page_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_pages" (
	"id" serial PRIMARY KEY,
	"platform_id" integer,
	"pages_id" integer
);
--> statement-breakpoint
ALTER TABLE "platform_pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "platform_products" (
	"id" serial PRIMARY KEY,
	"platform_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "platform_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "polls" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"slug" varchar(255),
	"isPublic" boolean,
	"content" json,
	"image" uuid,
	"author" uuid
);
--> statement-breakpoint
ALTER TABLE "polls" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "polls_spaces" (
	"id" serial PRIMARY KEY,
	"polls_id" integer,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "polls_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "post_gallery_items" (
	"id" uuid PRIMARY KEY,
	"posts_id" uuid,
	"directus_files_id" uuid,
	"sort" integer
);
--> statement-breakpoint
CREATE TABLE "postgresstores" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"content" text,
	"image" uuid,
	"color" varchar(255),
	"colortext" varchar(255),
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "postgresstores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "postgresstores_collections" (
	"id" serial PRIMARY KEY,
	"postgresstores_id" integer,
	"collections_id" bigint
);
--> statement-breakpoint
ALTER TABLE "postgresstores_collections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "postgresstores_products" (
	"id" serial PRIMARY KEY,
	"postgresstores_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "postgresstores_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "postgresstores_websites" (
	"id" serial PRIMARY KEY,
	"postgresstores_id" integer,
	"websites_id" bigint
);
--> statement-breakpoint
ALTER TABLE "postgresstores_websites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"content" text,
	"file" uuid,
	"username" varchar(255),
	"user_avatar" varchar(255),
	"image" uuid,
	"title" varchar(255),
	"type" varchar(255) DEFAULT 'blog',
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"audio" uuid,
	"slug" varchar(255),
	"author" uuid,
	"pinned_post" boolean,
	"auto_publish" boolean,
	"mastodon_id" varchar(255),
	"blsky_id" varchar(255),
	"target_audience" varchar(255),
	"visibility_scope" varchar(255),
	"link_preview" json,
	"content_type" varchar(255),
	"views" integer,
	"category" uuid,
	"date_published" timestamp,
	"date_updated" timestamp,
	"seo" uuid,
	"sort" integer,
	"summary" text,
	"user_updated" varchar(36) DEFAULT NULL,
	"client" varchar(255) DEFAULT NULL,
	"cost" varchar(255) DEFAULT NULL,
	"built_with" json,
	"video_url" varchar(255) DEFAULT NULL,
	"gallery" jsonb DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "posts_departments" (
	"id" serial PRIMARY KEY,
	"posts_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
CREATE TABLE "posts_polls" (
	"id" serial PRIMARY KEY,
	"posts_id" integer,
	"polls_id" integer
);
--> statement-breakpoint
ALTER TABLE "posts_polls" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" serial PRIMARY KEY,
	"product_id" bigint,
	"attribute_id" integer,
	"value" json
);
--> statement-breakpoint
ALTER TABLE "product_attributes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_types" (
	"id" serial PRIMARY KEY,
	"name" varchar(255),
	"isShippable" boolean,
	"options" json
);
--> statement-breakpoint
ALTER TABLE "product_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_types_products" (
	"id" serial PRIMARY KEY,
	"product_types_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "product_types_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigserial PRIMARY KEY,
	"sku" bigint,
	"name" text,
	"tax_class" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"content" text,
	"part_number" text,
	"file" uuid,
	"image" uuid,
	"visibility" boolean,
	"stock" integer,
	"rating" integer,
	"salable_quantity" bigint,
	"updated_at" timestamp with time zone,
	"status" varchar(255),
	"price" numeric(10,5),
	"ratings" varchar(255) DEFAULT '0',
	"uuid" uuid DEFAULT gen_random_uuid()
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_attributes" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"attributes_id" integer
);
--> statement-breakpoint
ALTER TABLE "products_attributes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_categories" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "products_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_countries" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "products_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_currency" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"currency_id" integer
);
--> statement-breakpoint
ALTER TABLE "products_currency" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_departments" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "products_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_directus_users" (
	"id" serial PRIMARY KEY,
	"product_id" bigint,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "products_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_manufacturer" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"manufacturer_id" bigint
);
--> statement-breakpoint
ALTER TABLE "products_manufacturer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_product_designer" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"item" varchar(255),
	"collection" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "products_product_designer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_spaces" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "products_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_tags" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"tags_id" integer
);
--> statement-breakpoint
ALTER TABLE "products_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products_websites" (
	"id" serial PRIMARY KEY,
	"products_id" bigint,
	"websites_id" bigint
);
--> statement-breakpoint
ALTER TABLE "products_websites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY,
	"username" text CONSTRAINT "profiles_username_unique" UNIQUE,
	"birth_date" date,
	"description" text,
	"slug" varchar(255) DEFAULT NULL CONSTRAINT "profiles_slug_unique" UNIQUE,
	"company" varchar(255),
	"activitypub_handle" varchar(255),
	"dropshipping_partner_id" varchar(255),
	"user" uuid CONSTRAINT "profiles_user_unique" UNIQUE,
	"commerce_auth_id" varchar(255),
	"cms_auth_id" varchar(255),
	"keycloak_id" varchar(255),
	"supabase_user_id" uuid CONSTRAINT "profiles_supabase_user_id_unique" UNIQUE,
	"role" uuid,
	"seller_requested" boolean,
	"seller_approved" boolean,
	"position" varchar(255),
	"links" json,
	"magento_customer_id" varchar(255),
	"avatar" uuid
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles_cities" (
	"id" serial PRIMARY KEY,
	"profiles_id" uuid,
	"cities_id" integer
);
--> statement-breakpoint
ALTER TABLE "profiles_cities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles_countries" (
	"id" serial PRIMARY KEY,
	"profiles_id" uuid,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "profiles_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles_followers" (
	"id" serial PRIMARY KEY,
	"profiles_id" uuid,
	"followers_id" integer
);
--> statement-breakpoint
ALTER TABLE "profiles_followers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles_states" (
	"id" serial PRIMARY KEY,
	"profiles_id" uuid,
	"states_id" integer
);
--> statement-breakpoint
ALTER TABLE "profiles_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_board" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"cards" json,
	"progress" integer,
	"custom_fields" json
);
--> statement-breakpoint
ALTER TABLE "project_board" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_board_comments" (
	"id" serial PRIMARY KEY,
	"project_board_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "project_board_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_board_directus_users" (
	"id" serial PRIMARY KEY,
	"project_board_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "project_board_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_board_files" (
	"id" serial PRIMARY KEY,
	"project_board_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "project_board_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_board_projects" (
	"id" serial PRIMARY KEY,
	"project_board_id" integer,
	"projects_id" integer
);
--> statement-breakpoint
ALTER TABLE "project_board_projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_timeline" (
	"id" serial PRIMARY KEY,
	"stage" json
);
--> statement-breakpoint
ALTER TABLE "project_timeline" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"due_date" timestamp,
	"priority" varchar(255),
	"budget" integer,
	"spend" integer,
	"difference" integer,
	"estimated_time" time,
	"icon" uuid,
	"slug" varchar(255),
	"custom_fields" json,
	"name" varchar(255),
	"task_name" json,
	"gantt" json
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_calendar" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"calendar_id" integer
);
--> statement-breakpoint
ALTER TABLE "projects_calendar" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_comments" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "projects_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_directus_users" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "projects_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_files" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "projects_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_integrations" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"integrations_id" integer
);
--> statement-breakpoint
ALTER TABLE "projects_integrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_lists" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "projects_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_products" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "projects_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_project_timeline" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"project_timeline_id" integer
);
--> statement-breakpoint
ALTER TABLE "projects_project_timeline" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects_region" (
	"id" serial PRIMARY KEY,
	"projects_id" integer,
	"region_id" integer
);
--> statement-breakpoint
ALTER TABLE "projects_region" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "radios" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"format" varchar(255),
	"satellite" varchar(255),
	"internet" varchar(255),
	"description" text,
	"image" uuid,
	"file" uuid,
	"creator" varchar(255),
	"type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "radios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "radios_categories" (
	"id" serial PRIMARY KEY,
	"radios_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "radios_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "radios_departments" (
	"id" serial PRIMARY KEY,
	"radios_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "radios_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "radios_musicchart" (
	"id" serial PRIMARY KEY,
	"radios_id" integer
);
--> statement-breakpoint
ALTER TABLE "radios_musicchart" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY,
	"name" varchar(255),
	"description" text,
	"image" uuid
);
--> statement-breakpoint
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ratings_products" (
	"id" serial PRIMARY KEY,
	"ratings_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "ratings_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"content_id" varchar(255),
	"content_type" varchar(255),
	"posts" integer,
	"user_id" uuid,
	"list_id" integer,
	"space_id" integer,
	"video_id" integer,
	"product" bigint,
	"user" uuid,
	"counter" integer,
	"image" uuid,
	"name" varchar(255),
	"icon" varchar(255),
	"target_type" varchar(255),
	"interaction_type" varchar(255),
	"reaction_type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "reactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reactions_comments" (
	"id" serial PRIMARY KEY,
	"reactions_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "reactions_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reactions_directus_users" (
	"id" serial PRIMARY KEY,
	"reaction_id" integer,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "reactions_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reactions_lists" (
	"id" serial PRIMARY KEY,
	"reactions_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "reactions_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reactions_posts" (
	"id" serial PRIMARY KEY,
	"reactions_id" integer,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "reactions_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reactions_shorts" (
	"id" serial PRIMARY KEY,
	"reactions_id" integer,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "reactions_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" serial PRIMARY KEY,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"response_code" integer,
	"url_new" varchar(255),
	"url_old" varchar(255),
	"notice_redirects" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "redirects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "region" (
	"id" serial PRIMARY KEY,
	"created_at" timestamp with time zone,
	"region_id" integer,
	"name" varchar(255),
	"code" varchar(255),
	"description" text,
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "region" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "region_address" (
	"id" serial PRIMARY KEY,
	"region_id" integer,
	"address_id" integer
);
--> statement-breakpoint
ALTER TABLE "region_address" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "region_countries" (
	"id" serial PRIMARY KEY,
	"region_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "region_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "region_shipping_address" (
	"id" serial PRIMARY KEY,
	"region_id" integer,
	"shipping_address_id" integer
);
--> statement-breakpoint
ALTER TABLE "region_shipping_address" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "related_products" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"user" uuid
);
--> statement-breakpoint
ALTER TABLE "related_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "related_products_products" (
	"id" serial PRIMARY KEY,
	"related_products_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "related_products_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report" (
	"id" serial PRIMARY KEY,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"title" varchar(255),
	"content" text,
	"url" varchar(255),
	"rating" integer
);
--> statement-breakpoint
ALTER TABLE "report" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_comments" (
	"id" serial PRIMARY KEY,
	"report_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "report_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_directus_users" (
	"id" serial PRIMARY KEY,
	"report_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "report_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_faqs" (
	"id" serial PRIMARY KEY,
	"report_id" integer,
	"faqs_id" integer
);
--> statement-breakpoint
ALTER TABLE "report_faqs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_posts" (
	"id" serial PRIMARY KEY,
	"report_id" integer,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "report_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_products" (
	"id" serial PRIMARY KEY,
	"report_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "report_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_spaces" (
	"id" serial PRIMARY KEY,
	"report_id" integer,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "report_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "returns" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"return_number" uuid,
	"reason" text
);
--> statement-breakpoint
ALTER TABLE "returns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "returns_orders" (
	"id" serial PRIMARY KEY,
	"returns_id" integer,
	"orders_id" integer
);
--> statement-breakpoint
ALTER TABLE "returns_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "returns_products" (
	"id" serial PRIMARY KEY,
	"returns_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "returns_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews_products" (
	"id" serial PRIMARY KEY,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "reviews_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"description" text,
	"release_date" timestamp,
	"number" integer,
	"name" integer
);
--> statement-breakpoint
ALTER TABLE "seasons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "seasons_videos" (
	"id" serial PRIMARY KEY,
	"seasons_id" integer,
	"videos_id" integer
);
--> statement-breakpoint
ALTER TABLE "seasons_videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "seo" (
	"canonical_url" varchar(255) DEFAULT NULL,
	"id" uuid PRIMARY KEY,
	"meta_description" text,
	"no_follow" boolean DEFAULT false,
	"no_index" boolean DEFAULT false,
	"sitemap_change_frequency" varchar(255) DEFAULT 'hourly',
	"sitemap_priority" real DEFAULT 0.5,
	"title" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment" (
	"id" serial PRIMARY KEY,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"email_sent" integer,
	"user" uuid,
	"order" integer,
	"shipment_status" varchar(255),
	"shipping_label" varchar(255),
	"store_id" integer,
	"total_qty" integer,
	"total_weight" integer,
	"code" varchar(255),
	"cost" integer,
	"delivery_time" varchar(255),
	"delivery_window" varchar(255),
	"carrier_matrix" json
);
--> statement-breakpoint
ALTER TABLE "shipment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipment_address" (
	"id" serial PRIMARY KEY,
	"shipment_id" integer,
	"address_id" integer
);
--> statement-breakpoint
ALTER TABLE "shipment_address" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipment_comments" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone,
	"parent_id" integer,
	"comment" text,
	"entity_id" integer,
	"is_customer_notified" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "shipment_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipment_products" (
	"id" serial PRIMARY KEY,
	"shipment_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "shipment_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipment_tracking" (
	"id" serial PRIMARY KEY,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"entity_id" integer,
	"weight" integer,
	"qty" integer,
	"description" text,
	"track_number" integer,
	"title" varchar(255),
	"carrier_code" varchar(255),
	"parent_id" integer
);
--> statement-breakpoint
ALTER TABLE "shipment_tracking" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipping_address" (
	"id" serial PRIMARY KEY,
	"created_at" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"customer_id" integer,
	"region_id" integer,
	"country_id" text,
	"street" text,
	"company" text,
	"telephone" text,
	"fax" text,
	"postcode" text,
	"city" text,
	"firstname" text,
	"lastname" text,
	"middlename" text,
	"prefix" text,
	"suffix" text,
	"vat_id" text,
	"default_shipping" boolean,
	"default_billing" boolean
);
--> statement-breakpoint
ALTER TABLE "shipping_address" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipping_addresses" (
	"id" serial PRIMARY KEY,
	"street" varchar(255),
	"zipcode" varchar(255),
	"phone" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "shipping_addresses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipping_addresses_cities" (
	"id" serial PRIMARY KEY,
	"shipping_addresses_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipping_addresses_countries" (
	"id" serial PRIMARY KEY,
	"shipping_addresses_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipping_addresses_directus_users" (
	"id" serial PRIMARY KEY,
	"shipping_addresses_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipping_addresses_orders" (
	"id" serial PRIMARY KEY,
	"shipping_addresses_id" integer,
	"orders_id" integer
);
--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shipping_addresses_states" (
	"id" serial PRIMARY KEY,
	"shipping_addresses_id" integer,
	"states_id" integer
);
--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shop_type" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text
);
--> statement-breakpoint
ALTER TABLE "shop_type" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shop_type_shops" (
	"id" serial PRIMARY KEY,
	"shop_type_id" integer,
	"shops_id" integer
);
--> statement-breakpoint
ALTER TABLE "shop_type_shops" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"content" text,
	"website" varchar(255),
	"type" json,
	"address" text,
	"rating" integer,
	"image" uuid,
	"description" text,
	"slug" varchar(255),
	"phone" varchar(255),
	"shipping_policy" text,
	"policies" json,
	"food_offered" varchar(255),
	"custom_domain" varchar(255),
	"theme" json,
	"trusted_score" json
);
--> statement-breakpoint
ALTER TABLE "shops" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_agreements" (
	"id" serial PRIMARY KEY,
	"shops_id" integer
);
--> statement-breakpoint
ALTER TABLE "shops_agreements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_categories" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "shops_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_comments" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "shops_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_countries" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "shops_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_departments" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "shops_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_directus_users" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "shops_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_files" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "shops_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_products" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "shops_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shops_showcases" (
	"id" serial PRIMARY KEY,
	"shops_id" integer,
	"showcases_id" integer
);
--> statement-breakpoint
ALTER TABLE "shops_showcases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shorts" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"video_url" varchar(255),
	"duration" varchar(255),
	"host" varchar(255),
	"thumbnail" uuid,
	"dateTime" timestamp,
	"type" varchar(255),
	"age_requirement" varchar(255),
	"creator" varchar(255),
	"video" uuid,
	"watch_time" varchar(255),
	"click_through_rate" varchar(255),
	"conversion" varchar(255),
	"saves" varchar(255),
	"favorite" boolean,
	"age_gate" varchar(255),
	"region" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shorts_directus_users" (
	"id" serial PRIMARY KEY,
	"shorts_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "shorts_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shorts_files" (
	"id" serial PRIMARY KEY,
	"shorts_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "shorts_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shorts_products" (
	"id" serial PRIMARY KEY,
	"shorts_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "shorts_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shorts_spaces" (
	"id" serial PRIMARY KEY,
	"shorts_id" integer,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "shorts_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "showcases" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'published',
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"color" varchar(255),
	"colortext" varchar(255),
	"image" uuid,
	"thumbnail" uuid,
	"rating" varchar(255),
	"slug" varchar(255),
	"owner" uuid,
	"type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "showcases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "showcases_products" (
	"id" serial PRIMARY KEY,
	"showcases_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "showcases_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "showcases_shops" (
	"id" serial PRIMARY KEY,
	"showcases_id" integer,
	"shops_id" integer
);
--> statement-breakpoint
ALTER TABLE "showcases_shops" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "showcases_spaces" (
	"id" serial PRIMARY KEY,
	"showcases_id" integer,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "showcases_spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_preference_categories" (
	"id" serial PRIMARY KEY,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "site_preference_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_preference_countries" (
	"id" serial PRIMARY KEY,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "site_preference_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_preference_departments" (
	"id" serial PRIMARY KEY,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "site_preference_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_preference_products" (
	"id" serial PRIMARY KEY,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "site_preference_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "social_connections" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"user" uuid,
	"platform" varchar(255),
	"identifier" varchar(255),
	"credentials" json,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "social_connections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "Space" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid,
	"media" uuid,
	"numberOfMembers" varchar(255),
	"groupType" varchar(255),
	"creator_id" bigint,
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "Space" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "Space_products" (
	"id" serial PRIMARY KEY,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "Space_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "space_types" (
	"id" serial PRIMARY KEY,
	"name" varchar(255),
	"slug" varchar(255),
	"allowed_content_types" json,
	"default_tabs" json,
	"custom_tabs" json,
	"description" text,
	"icon" uuid,
	"component_path" text,
	"layout_name" varchar(255),
	"remote_url" varchar(255),
	"enabled" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "space_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"numberOfMembers" integer,
	"description" text,
	"image" uuid,
	"products" varchar(255),
	"group_rules" json,
	"owner" uuid,
	"cover_image" uuid,
	"custom_tabs" json,
	"slug" varchar(255),
	"custom_domain" varchar(255),
	"theme" json,
	"space_analytics" boolean,
	"federation_enabled" boolean,
	"default_language" varchar(255),
	"invite_only" boolean,
	"badges_enabled" boolean,
	"rss" json,
	"is_shop" boolean,
	"address" varchar(255),
	"rating" integer,
	"shipping_policy" text,
	"trusted_score" varchar(255),
	"menu" json
);
--> statement-breakpoint
ALTER TABLE "spaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_articles" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"articles_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_cities" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_cities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_countries" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_departments" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
CREATE TABLE "spaces_directus_users" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "spaces_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_files" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"directus_files_id" uuid
);
--> statement-breakpoint
ALTER TABLE "spaces_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_lists" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"lists_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_live_rooms" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_live_rooms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_meta_Space" (
	"id" serial PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "spaces_meta_Space" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_pages" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"pages_id" integer
);
--> statement-breakpoint
CREATE TABLE "spaces_posts" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_shop_type" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"shop_type_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_shop_type" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_space_types" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"space_types_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_space_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_states" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"states_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_tags" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"tags_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "spaces_templates" (
	"id" serial PRIMARY KEY,
	"spaces_id" integer,
	"templates_id" integer
);
--> statement-breakpoint
ALTER TABLE "spaces_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY,
	"name" varchar(255),
	"country_code" varchar(255),
	"fips_code" varchar(255),
	"iso2" varchar(255),
	"latitude" numeric(10,5),
	"longitude" numeric(10,5),
	"flag" integer,
	"wikiDataId" varchar(255),
	"country_id" varchar(255),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "states_cities" (
	"id" serial PRIMARY KEY,
	"states_id" integer,
	"cities_id" integer
);
--> statement-breakpoint
ALTER TABLE "states_cities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "states_countries" (
	"id" serial PRIMARY KEY,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "states_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "streams" (
	"id" serial PRIMARY KEY,
	"stream_id" integer,
	"stream_date" timestamp with time zone,
	"stream_duration" varchar(255),
	"stream_time" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "streams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "streams_ratings" (
	"id" serial PRIMARY KEY,
	"streams_id" integer,
	"ratings_id" integer
);
--> statement-breakpoint
ALTER TABLE "streams_ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"subscription_number" uuid,
	"start_date" date,
	"end_date" date
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions_directus_users" (
	"id" serial PRIMARY KEY,
	"subscriptions_id" integer,
	"directus_users_id" uuid
);
--> statement-breakpoint
ALTER TABLE "subscriptions_directus_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions_products" (
	"id" serial PRIMARY KEY,
	"subscriptions_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "subscriptions_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"name" varchar(255),
	"description" text,
	"image" uuid,
	"slug" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags_articles" (
	"id" serial PRIMARY KEY,
	"tags_id" integer,
	"articles_id" integer
);
--> statement-breakpoint
ALTER TABLE "tags_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags_categories" (
	"id" serial PRIMARY KEY,
	"tags_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "tags_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags_departments" (
	"id" serial PRIMARY KEY,
	"tags_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "tags_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags_posts" (
	"id" serial PRIMARY KEY,
	"tags_id" integer,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "tags_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags_products" (
	"id" serial PRIMARY KEY,
	"tags_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "tags_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags_shorts" (
	"id" serial PRIMARY KEY,
	"tags_id" integer,
	"shorts_id" integer
);
--> statement-breakpoint
ALTER TABLE "tags_shorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "taxes" (
	"id" serial PRIMARY KEY,
	"rate" numeric(10,5),
	"tax_class" varchar(255),
	"certifications" json,
	"age_gating" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "taxes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "taxes_countries" (
	"id" serial PRIMARY KEY,
	"taxes_id" integer,
	"countries_id" integer
);
--> statement-breakpoint
ALTER TABLE "taxes_countries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "taxes_states" (
	"id" serial PRIMARY KEY,
	"taxes_id" integer,
	"states_id" integer
);
--> statement-breakpoint
ALTER TABLE "taxes_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team" (
	"bio" text,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"id" uuid PRIMARY KEY,
	"image" uuid,
	"job_title" varchar(255) DEFAULT NULL,
	"name" varchar(255) DEFAULT NULL,
	"social_media" json,
	"sort" integer,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"user_created" uuid,
	"user_updated" uuid
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"title" varchar(255),
	"description" text,
	"default_tabs" varchar(255),
	"default_types" varchar(255),
	"default_roles" varchar(255),
	"default_content" varchar(255),
	"theme" json,
	"template_type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "templates_space_types" (
	"id" serial PRIMARY KEY,
	"templates_id" integer,
	"space_types_id" integer
);
--> statement-breakpoint
ALTER TABLE "templates_space_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "testimonials" (
	"company" varchar(255) DEFAULT NULL,
	"company_logo" uuid,
	"content" text,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"id" uuid PRIMARY KEY,
	"image" uuid,
	"link" varchar(255) DEFAULT NULL,
	"sort" integer,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"subtitle" varchar(255) DEFAULT NULL,
	"title" varchar(255) DEFAULT NULL,
	"user_created" uuid,
	"user_updated" uuid
);
--> statement-breakpoint
CREATE TABLE "timezones" (
	"id" serial PRIMARY KEY,
	"name" varchar(255),
	"code" varchar(255),
	"description" text
);
--> statement-breakpoint
ALTER TABLE "timezones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" bigserial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'open',
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"order" integer,
	"payment_method" varchar(255),
	"transactions_parent_id" varchar(255),
	"type" varchar(255),
	"amount" numeric(10,5)
);
--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transactions_currency" (
	"id" serial PRIMARY KEY,
	"transactions_id" bigint,
	"currency_id" integer
);
--> statement-breakpoint
ALTER TABLE "transactions_currency" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"date_created" timestamp with time zone,
	"date_updated" timestamp with time zone,
	"name" varchar(255),
	"url" varchar(255),
	"image" uuid,
	"code" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "translations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "translations_postgresstores" (
	"id" serial PRIMARY KEY,
	"translations_id" integer,
	"postgresstores_id" integer
);
--> statement-breakpoint
ALTER TABLE "translations_postgresstores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_content_interaction" (
	"id" serial PRIMARY KEY,
	"date_created" timestamp with time zone,
	"interaction_type" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "user_content_interaction" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_friends" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"user" uuid,
	"friend" uuid,
	"created_at" timestamp with time zone,
	"relation" json
);
--> statement-breakpoint
ALTER TABLE "user_friends" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_friends_posts" (
	"id" serial PRIMARY KEY,
	"user_friends_id" integer,
	"posts_id" integer
);
--> statement-breakpoint
ALTER TABLE "user_friends_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" serial PRIMARY KEY,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"user" uuid,
	"display_name" varchar(255),
	"bio" text,
	"avatar" uuid,
	"location" varchar(255),
	"socials" json,
	"store" varchar(255),
	"age" integer
);
--> statement-breakpoint
ALTER TABLE "user_profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "variants" (
	"id" serial PRIMARY KEY,
	"product_id" integer,
	"sku" text,
	"options_json" jsonb,
	"price" numeric,
	"cost" numeric,
	"barcode" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"product_uuid" uuid
);
--> statement-breakpoint
ALTER TABLE "variants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vibez_clips" (
	"id" serial PRIMARY KEY,
	"creator_id" integer,
	"media_url" text,
	"duration" integer,
	"captions" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vibez_clips" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vibez_product_map" (
	"clip_id" integer,
	"product_id" integer,
	CONSTRAINT "vibez_product_map_pkey" PRIMARY KEY("clip_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "vibez_product_map" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"sort" integer,
	"user_created" uuid,
	"date_created" timestamp with time zone,
	"user_updated" uuid,
	"date_updated" timestamp with time zone,
	"type" varchar(255),
	"description" text,
	"ratings" integer,
	"name" varchar(255),
	"media" uuid,
	"thumbnail" uuid,
	"video_url" varchar(255),
	"user" uuid,
	"minio_key" varchar(255),
	"duration" varchar(255),
	"visibility" varchar(255),
	"view_count" integer,
	"distributor" integer
);
--> statement-breakpoint
ALTER TABLE "videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos_categories" (
	"id" serial PRIMARY KEY,
	"videos_id" integer,
	"categories_id" integer
);
--> statement-breakpoint
ALTER TABLE "videos_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos_comments" (
	"id" serial PRIMARY KEY,
	"videos_id" integer,
	"comments_id" integer
);
--> statement-breakpoint
ALTER TABLE "videos_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos_departments" (
	"id" serial PRIMARY KEY,
	"videos_id" integer,
	"departments_id" integer
);
--> statement-breakpoint
ALTER TABLE "videos_departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos_manufacturer" (
	"id" serial PRIMARY KEY,
	"videos_id" integer,
	"manufacturer_id" bigint
);
--> statement-breakpoint
ALTER TABLE "videos_manufacturer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos_product_types" (
	"id" serial PRIMARY KEY,
	"videos_id" integer,
	"product_types_id" integer
);
--> statement-breakpoint
ALTER TABLE "videos_product_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos_products" (
	"id" serial PRIMARY KEY,
	"videos_id" integer,
	"products_id" bigint
);
--> statement-breakpoint
ALTER TABLE "videos_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos_tags" (
	"id" serial PRIMARY KEY,
	"videos_id" integer,
	"tags_id" integer
);
--> statement-breakpoint
ALTER TABLE "videos_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "websites" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
	"name" text,
	"url" text,
	"image" uuid,
	"type" varchar(255),
	"slug" varchar(255),
	"icon" varchar(255),
	"status" varchar(255),
	"note" text,
	"username" varchar(255),
	"description" text,
	"creator" uuid
);
--> statement-breakpoint
ALTER TABLE "websites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "realtime"."messages" (
	"topic" text NOT NULL,
	"extension" text NOT NULL,
	"payload" jsonb,
	"event" text,
	"private" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"inserted_at" timestamp DEFAULT now(),
	"id" uuid DEFAULT gen_random_uuid(),
	"binary_payload" bytea,
	CONSTRAINT "messages_pkey" PRIMARY KEY("id","inserted_at"),
	CONSTRAINT "messages_payload_exclusive" CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI)
);
--> statement-breakpoint
ALTER TABLE "realtime"."messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "realtime"."messages_2025_02_07" (
	"topic" text NOT NULL,
	"extension" text NOT NULL,
	"payload" jsonb,
	"event" text,
	"private" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"inserted_at" timestamp DEFAULT now(),
	"id" uuid DEFAULT gen_random_uuid(),
	"binary_payload" bytea,
	CONSTRAINT "messages_2025_02_07_pkey" PRIMARY KEY("id","inserted_at"),
	CONSTRAINT "messages_payload_exclusive" CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI)
);
--> statement-breakpoint
CREATE TABLE "realtime"."messages_2025_02_08" (
	"topic" text NOT NULL,
	"extension" text NOT NULL,
	"payload" jsonb,
	"event" text,
	"private" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"inserted_at" timestamp DEFAULT now(),
	"id" uuid DEFAULT gen_random_uuid(),
	"binary_payload" bytea,
	CONSTRAINT "messages_2025_02_08_pkey" PRIMARY KEY("id","inserted_at"),
	CONSTRAINT "messages_payload_exclusive" CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI)
);
--> statement-breakpoint
CREATE TABLE "realtime"."messages_2025_02_09" (
	"topic" text NOT NULL,
	"extension" text NOT NULL,
	"payload" jsonb,
	"event" text,
	"private" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"inserted_at" timestamp DEFAULT now(),
	"id" uuid DEFAULT gen_random_uuid(),
	"binary_payload" bytea,
	CONSTRAINT "messages_2025_02_09_pkey" PRIMARY KEY("id","inserted_at"),
	CONSTRAINT "messages_payload_exclusive" CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI)
);
--> statement-breakpoint
CREATE TABLE "realtime"."messages_2025_02_10" (
	"topic" text NOT NULL,
	"extension" text NOT NULL,
	"payload" jsonb,
	"event" text,
	"private" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"inserted_at" timestamp DEFAULT now(),
	"id" uuid DEFAULT gen_random_uuid(),
	"binary_payload" bytea,
	CONSTRAINT "messages_2025_02_10_pkey" PRIMARY KEY("id","inserted_at"),
	CONSTRAINT "messages_payload_exclusive" CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI)
);
--> statement-breakpoint
CREATE TABLE "realtime"."messages_2025_02_11" (
	"topic" text NOT NULL,
	"extension" text NOT NULL,
	"payload" jsonb,
	"event" text,
	"private" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"inserted_at" timestamp DEFAULT now(),
	"id" uuid DEFAULT gen_random_uuid(),
	"binary_payload" bytea,
	CONSTRAINT "messages_2025_02_11_pkey" PRIMARY KEY("id","inserted_at"),
	CONSTRAINT "messages_payload_exclusive" CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI)
);
--> statement-breakpoint
CREATE TABLE "realtime"."schema_migrations" (
	"version" bigint PRIMARY KEY,
	"inserted_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "realtime"."subscription" (
	"id" bigint GENERATED ALWAYS AS IDENTITY (sequence name "realtime"."subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"subscription_id" uuid NOT NULL,
	"entity" regclass NOT NULL,
	"filters" realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
	"claims" jsonb NOT NULL,
	"claims_role" regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
	"created_at" timestamp DEFAULT timezone('utc'::text, now()) NOT NULL,
	"action_filter" text DEFAULT '*',
	"selected_columns" text[],
	CONSTRAINT "pk_subscription" PRIMARY KEY("id"),
	CONSTRAINT "subscription_action_filter_check" CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);
--> statement-breakpoint
CREATE TABLE "storage"."buckets" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"owner" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"public" boolean DEFAULT false,
	"avif_autodetection" boolean DEFAULT false,
	"file_size_limit" bigint,
	"allowed_mime_types" text[],
	"owner_id" text,
	"type" "storage"."buckettype" DEFAULT 'STANDARD'::"storage"."buckettype" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storage"."buckets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storage"."buckets_analytics" (
	"name" text NOT NULL,
	"type" "storage"."buckettype" DEFAULT 'ANALYTICS'::"storage"."buckettype" NOT NULL,
	"format" text DEFAULT 'ICEBERG' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "storage"."buckets_analytics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storage"."buckets_vectors" (
	"id" text PRIMARY KEY,
	"type" "storage"."buckettype" DEFAULT 'VECTOR'::"storage"."buckettype" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storage"."buckets_vectors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storage"."migrations" (
	"id" integer PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "migrations_name_key" UNIQUE,
	"hash" varchar(40) NOT NULL,
	"executed_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "storage"."migrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storage"."objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bucket_id" text,
	"name" text,
	"owner" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"last_accessed_at" timestamp with time zone DEFAULT now(),
	"metadata" jsonb,
	"path_tokens" text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
	"version" text,
	"owner_id" text,
	"user_metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "storage"."objects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storage"."s3_multipart_uploads" (
	"id" text PRIMARY KEY,
	"in_progress_size" bigint DEFAULT 0 NOT NULL,
	"upload_signature" text NOT NULL,
	"bucket_id" text NOT NULL,
	"key" text NOT NULL,
	"version" text NOT NULL,
	"owner_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_metadata" jsonb,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storage"."s3_multipart_uploads_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"upload_id" text NOT NULL,
	"size" bigint DEFAULT 0 NOT NULL,
	"part_number" integer NOT NULL,
	"bucket_id" text NOT NULL,
	"key" text NOT NULL,
	"etag" text NOT NULL,
	"owner_id" text,
	"version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storage"."vector_indexes" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"bucket_id" text NOT NULL,
	"data_type" text NOT NULL,
	"dimension" integer NOT NULL,
	"distance_metric" text NOT NULL,
	"metadata_configuration" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storage"."vector_indexes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "supabase_functions"."hooks" (
	"id" bigserial PRIMARY KEY,
	"hook_table_id" integer NOT NULL,
	"hook_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" bigint
);
--> statement-breakpoint
CREATE TABLE "supabase_functions"."migrations" (
	"version" text PRIMARY KEY,
	"inserted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vault"."secrets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text,
	"description" text DEFAULT '' NOT NULL,
	"secret" text NOT NULL,
	"key_id" uuid,
	"nonce" bytea DEFAULT vault._crypto_aead_det_noncegen(),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" ("instance_id");--> statement-breakpoint
CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" ("confirmation_token") WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" ("email_change_token_current") WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" ("email_change_token_new") WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" ("reauthentication_token") WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" ("recovery_token") WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" ("email") WHERE (is_sso_user = false);--> statement-breakpoint
CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" ("instance_id",lower((email)::text));--> statement-breakpoint
CREATE INDEX "users_instance_id_idx" ON "auth"."users" ("instance_id");--> statement-breakpoint
CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" ("is_anonymous");--> statement-breakpoint
CREATE INDEX "custom_oauth_providers_created_at_idx" ON "auth"."custom_oauth_providers" ("created_at");--> statement-breakpoint
CREATE INDEX "custom_oauth_providers_enabled_idx" ON "auth"."custom_oauth_providers" ("enabled");--> statement-breakpoint
CREATE INDEX "custom_oauth_providers_identifier_idx" ON "auth"."custom_oauth_providers" ("identifier");--> statement-breakpoint
CREATE INDEX "custom_oauth_providers_provider_type_idx" ON "auth"."custom_oauth_providers" ("provider_type");--> statement-breakpoint
CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" ("friendly_name","user_id") WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);--> statement-breakpoint
CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" ("user_id","phone");--> statement-breakpoint
CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_auth_code" ON "auth"."flow_state" ("auth_code");--> statement-breakpoint
CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" ("user_id","authentication_method");--> statement-breakpoint
CREATE INDEX "identities_email_idx" ON "auth"."identities" ("email" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "identities_user_id_idx" ON "auth"."identities" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_oauth_client_states_created_at" ON "auth"."oauth_client_states" ("created_at");--> statement-breakpoint
CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "oauth_auth_pending_exp_idx" ON "auth"."oauth_authorizations" ("expires_at") WHERE (status = 'pending'::auth.oauth_authorization_status);--> statement-breakpoint
CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" ("deleted_at");--> statement-breakpoint
CREATE INDEX "oauth_consents_active_client_idx" ON "auth"."oauth_consents" ("client_id") WHERE (revoked_at IS NULL);--> statement-breakpoint
CREATE INDEX "oauth_consents_active_user_client_idx" ON "auth"."oauth_consents" ("user_id","client_id") WHERE (revoked_at IS NULL);--> statement-breakpoint
CREATE INDEX "oauth_consents_user_order_idx" ON "auth"."oauth_consents" ("user_id","granted_at" DESC);--> statement-breakpoint
CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING hash ("relates_to");--> statement-breakpoint
CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING hash ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" ("user_id","token_type");--> statement-breakpoint
CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" ("instance_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" ("instance_id","user_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" ("parent");--> statement-breakpoint
CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" ("session_id","revoked");--> statement-breakpoint
CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" ("updated_at" DESC);--> statement-breakpoint
CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" ("sso_provider_id");--> statement-breakpoint
CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" ("for_email");--> statement-breakpoint
CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" ("sso_provider_id");--> statement-breakpoint
CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" ("not_after" DESC);--> statement-breakpoint
CREATE INDEX "sessions_oauth_client_id_idx" ON "auth"."sessions" ("oauth_client_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" (lower(domain));--> statement-breakpoint
CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" ("sso_provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" (lower(resource_id));--> statement-breakpoint
CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" ("resource_id" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "webauthn_challenges_expires_at_idx" ON "auth"."webauthn_challenges" ("expires_at");--> statement-breakpoint
CREATE INDEX "webauthn_challenges_user_id_idx" ON "auth"."webauthn_challenges" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webauthn_credentials_credential_id_key" ON "auth"."webauthn_credentials" ("credential_id");--> statement-breakpoint
CREATE INDEX "webauthn_credentials_user_id_idx" ON "auth"."webauthn_credentials" ("user_id");--> statement-breakpoint
CREATE INDEX "hdb_cron_event_invocation_event_id" ON "hdb_catalog"."hdb_cron_event_invocation_logs" ("event_id");--> statement-breakpoint
CREATE INDEX "hdb_cron_event_status" ON "hdb_catalog"."hdb_cron_events" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "hdb_cron_events_unique_scheduled" ON "hdb_catalog"."hdb_cron_events" ("trigger_name","scheduled_time") WHERE (status = 'scheduled'::text);--> statement-breakpoint
CREATE INDEX "hdb_scheduled_event_status" ON "hdb_catalog"."hdb_scheduled_events" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "hdb_version_one_row" ON "hdb_catalog"."hdb_version" ((version IS NOT NULL));--> statement-breakpoint
CREATE INDEX "_http_response_created_idx" ON "net"."_http_response" ("created");--> statement-breakpoint
CREATE UNIQUE INDEX "key_key_id_key_context_key_type_idx" ON "pgsodium"."key" ("key_id","key_context","key_type");--> statement-breakpoint
CREATE INDEX "key_status_idx" ON "pgsodium"."key" ("status") WHERE (status = ANY (ARRAY['valid'::pgsodium.key_status, 'default'::pgsodium.key_status]));--> statement-breakpoint
CREATE UNIQUE INDEX "key_status_idx1" ON "pgsodium"."key" ("status") WHERE (status = 'default'::pgsodium.key_status);--> statement-breakpoint
CREATE INDEX "ai_prompts_name_index" ON "ai_prompts" ("name");--> statement-breakpoint
CREATE INDEX "directus_activity_timestamp_index" ON "directus_activity" ("timestamp");--> statement-breakpoint
CREATE INDEX "directus_oauth_clients_date_created_index" ON "directus_oauth_clients" ("date_created");--> statement-breakpoint
CREATE INDEX "directus_oauth_codes_expires_at_index" ON "directus_oauth_codes" ("expires_at");--> statement-breakpoint
CREATE INDEX "directus_oauth_codes_used_at_index" ON "directus_oauth_codes" ("used_at");--> statement-breakpoint
CREATE INDEX "directus_oauth_consents_client_index" ON "directus_oauth_consents" ("client");--> statement-breakpoint
CREATE INDEX "directus_oauth_tokens_code_hash_index" ON "directus_oauth_tokens" ("code_hash");--> statement-breakpoint
CREATE INDEX "directus_oauth_tokens_expires_at_index" ON "directus_oauth_tokens" ("expires_at");--> statement-breakpoint
CREATE INDEX "directus_oauth_tokens_previous_session_index" ON "directus_oauth_tokens" ("previous_session");--> statement-breakpoint
CREATE INDEX "directus_oauth_tokens_session_index" ON "directus_oauth_tokens" ("session");--> statement-breakpoint
CREATE INDEX "directus_revisions_activity_index" ON "directus_revisions" ("activity");--> statement-breakpoint
CREATE INDEX "directus_revisions_parent_index" ON "directus_revisions" ("parent");--> statement-breakpoint
CREATE INDEX "directus_sessions_oauth_client_index" ON "directus_sessions" ("oauth_client");--> statement-breakpoint
CREATE INDEX "profiles_supabase_user_id_index" ON "profiles" ("supabase_user_id");--> statement-breakpoint
CREATE INDEX "ix_realtime_subscription_entity" ON "realtime"."subscription" ("entity");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_subscription_id_entity_filters_action_filter_selec" ON "realtime"."subscription" ("subscription_id","entity","filters","action_filter",COALESCE(selected_columns, '{}'::text[]));--> statement-breakpoint
CREATE INDEX "messages_2025_02_07_inserted_at_topic_idx" ON "realtime"."messages_2025_02_07" ("inserted_at" DESC,"topic") WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));--> statement-breakpoint
CREATE INDEX "messages_2025_02_08_inserted_at_topic_idx" ON "realtime"."messages_2025_02_08" ("inserted_at" DESC,"topic") WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));--> statement-breakpoint
CREATE INDEX "messages_2025_02_09_inserted_at_topic_idx" ON "realtime"."messages_2025_02_09" ("inserted_at" DESC,"topic") WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));--> statement-breakpoint
CREATE INDEX "messages_2025_02_10_inserted_at_topic_idx" ON "realtime"."messages_2025_02_10" ("inserted_at" DESC,"topic") WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));--> statement-breakpoint
CREATE INDEX "messages_2025_02_11_inserted_at_topic_idx" ON "realtime"."messages_2025_02_11" ("inserted_at" DESC,"topic") WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));--> statement-breakpoint
CREATE UNIQUE INDEX "bname" ON "storage"."buckets" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "bucketid_objname" ON "storage"."objects" ("bucket_id","name");--> statement-breakpoint
CREATE INDEX "idx_objects_bucket_id_name" ON "storage"."objects" ("bucket_id","name");--> statement-breakpoint
CREATE INDEX "idx_objects_bucket_id_name_lower" ON "storage"."objects" ("bucket_id",lower(name));--> statement-breakpoint
CREATE INDEX "name_prefix_search" ON "storage"."objects" ("name" text_pattern_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "buckets_analytics_unique_name_idx" ON "storage"."buckets_analytics" ("name") WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_multipart_uploads_list" ON "storage"."s3_multipart_uploads" ("bucket_id","key","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "vector_indexes_name_bucket_id_idx" ON "storage"."vector_indexes" ("name","bucket_id");--> statement-breakpoint
CREATE INDEX "supabase_functions_hooks_h_table_id_h_name_idx" ON "supabase_functions"."hooks" ("hook_table_id","hook_name");--> statement-breakpoint
CREATE INDEX "supabase_functions_hooks_request_id_idx" ON "supabase_functions"."hooks" ("request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "secrets_name_idx" ON "vault"."secrets" ("name") WHERE (name IS NOT NULL);--> statement-breakpoint
ALTER TABLE "pgsodium"."key" ADD CONSTRAINT "key_parent_key_fkey" FOREIGN KEY ("parent_key") REFERENCES "pgsodium"."key"("id");--> statement-breakpoint
ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_oauth_client_id_fkey" FOREIGN KEY ("oauth_client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."blog" ADD CONSTRAINT "blog_file_foreign" FOREIGN KEY ("file") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."blog" ADD CONSTRAINT "blog_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."categories" ADD CONSTRAINT "categories_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" ADD CONSTRAINT "categories_tags_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "enovels"."categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" ADD CONSTRAINT "categories_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters" ADD CONSTRAINT "characters_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" ADD CONSTRAINT "characters_abilities_abilities_id_foreign" FOREIGN KEY ("abilities_id") REFERENCES "enovels"."abilities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" ADD CONSTRAINT "characters_abilities_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" ADD CONSTRAINT "characters_characters_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" ADD CONSTRAINT "characters_characters_related_characters_id_foreign" FOREIGN KEY ("related_characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" ADD CONSTRAINT "characters_tags_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" ADD CONSTRAINT "characters_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" ADD CONSTRAINT "characters_videos_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" ADD CONSTRAINT "characters_videos_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "enovels"."videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."dictionary" ADD CONSTRAINT "dictionary_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" ADD CONSTRAINT "directus_access_policy_foreign" FOREIGN KEY ("policy") REFERENCES "enovels"."directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" ADD CONSTRAINT "directus_access_role_foreign" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" ADD CONSTRAINT "directus_access_user_foreign" FOREIGN KEY ("user") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_collections" ADD CONSTRAINT "directus_collections_group_foreign" FOREIGN KEY ("group") REFERENCES "enovels"."directus_collections"("collection");--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" ADD CONSTRAINT "directus_comments_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" ADD CONSTRAINT "directus_comments_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_dashboards" ADD CONSTRAINT "directus_dashboards_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" ADD CONSTRAINT "directus_files_folder_foreign" FOREIGN KEY ("folder") REFERENCES "enovels"."directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" ADD CONSTRAINT "directus_files_modified_by_foreign" FOREIGN KEY ("modified_by") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" ADD CONSTRAINT "directus_files_uploaded_by_foreign" FOREIGN KEY ("uploaded_by") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_flows" ADD CONSTRAINT "directus_flows_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_folders" ADD CONSTRAINT "directus_folders_parent_foreign" FOREIGN KEY ("parent") REFERENCES "enovels"."directus_folders"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" ADD CONSTRAINT "directus_notifications_recipient_foreign" FOREIGN KEY ("recipient") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" ADD CONSTRAINT "directus_notifications_sender_foreign" FOREIGN KEY ("sender") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" ADD CONSTRAINT "directus_operations_flow_foreign" FOREIGN KEY ("flow") REFERENCES "enovels"."directus_flows"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" ADD CONSTRAINT "directus_operations_reject_foreign" FOREIGN KEY ("reject") REFERENCES "enovels"."directus_operations"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" ADD CONSTRAINT "directus_operations_resolve_foreign" FOREIGN KEY ("resolve") REFERENCES "enovels"."directus_operations"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" ADD CONSTRAINT "directus_operations_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" ADD CONSTRAINT "directus_panels_dashboard_foreign" FOREIGN KEY ("dashboard") REFERENCES "enovels"."directus_dashboards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" ADD CONSTRAINT "directus_panels_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_permissions" ADD CONSTRAINT "directus_permissions_policy_foreign" FOREIGN KEY ("policy") REFERENCES "enovels"."directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" ADD CONSTRAINT "directus_presets_role_foreign" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" ADD CONSTRAINT "directus_presets_user_foreign" FOREIGN KEY ("user") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" ADD CONSTRAINT "directus_revisions_activity_foreign" FOREIGN KEY ("activity") REFERENCES "enovels"."directus_activity"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" ADD CONSTRAINT "directus_revisions_parent_foreign" FOREIGN KEY ("parent") REFERENCES "enovels"."directus_revisions"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" ADD CONSTRAINT "directus_revisions_version_foreign" FOREIGN KEY ("version") REFERENCES "enovels"."directus_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_roles" ADD CONSTRAINT "directus_roles_parent_foreign" FOREIGN KEY ("parent") REFERENCES "enovels"."directus_roles"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" ADD CONSTRAINT "directus_sessions_share_foreign" FOREIGN KEY ("share") REFERENCES "enovels"."directus_shares"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" ADD CONSTRAINT "directus_sessions_user_foreign" FOREIGN KEY ("user") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" ADD CONSTRAINT "directus_shares_collection_foreign" FOREIGN KEY ("collection") REFERENCES "enovels"."directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" ADD CONSTRAINT "directus_shares_role_foreign" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" ADD CONSTRAINT "directus_shares_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_users" ADD CONSTRAINT "directus_users_role_foreign" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" ADD CONSTRAINT "directus_versions_collection_foreign" FOREIGN KEY ("collection") REFERENCES "enovels"."directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" ADD CONSTRAINT "directus_versions_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" ADD CONSTRAINT "directus_versions_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_webhooks" ADD CONSTRAINT "directus_webhooks_migrated_flow_foreign" FOREIGN KEY ("migrated_flow") REFERENCES "enovels"."directus_flows"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items" ADD CONSTRAINT "items_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" ADD CONSTRAINT "items_abilities_abilities_id_foreign" FOREIGN KEY ("abilities_id") REFERENCES "enovels"."abilities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" ADD CONSTRAINT "items_abilities_items_id_foreign" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" ADD CONSTRAINT "items_characters_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" ADD CONSTRAINT "items_characters_items_id_foreign" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" ADD CONSTRAINT "items_videos_items_id_foreign" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" ADD CONSTRAINT "items_videos_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "enovels"."videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" ADD CONSTRAINT "levels_characters_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" ADD CONSTRAINT "levels_characters_levels_id_foreign" FOREIGN KEY ("levels_id") REFERENCES "enovels"."levels"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."pages" ADD CONSTRAINT "pages_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places" ADD CONSTRAINT "places_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" ADD CONSTRAINT "places_characters_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" ADD CONSTRAINT "places_characters_places_id_foreign" FOREIGN KEY ("places_id") REFERENCES "enovels"."places"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_items" ADD CONSTRAINT "places_items_items_id_foreign" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_items" ADD CONSTRAINT "places_items_places_id_foreign" FOREIGN KEY ("places_id") REFERENCES "enovels"."places"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories" ADD CONSTRAINT "stories_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories" ADD CONSTRAINT "stories_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."stories" ADD CONSTRAINT "stories_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" ADD CONSTRAINT "stories_characters_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" ADD CONSTRAINT "stories_characters_stories_id_foreign" FOREIGN KEY ("stories_id") REFERENCES "enovels"."stories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" ADD CONSTRAINT "stories_tags_stories_id_foreign" FOREIGN KEY ("stories_id") REFERENCES "enovels"."stories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" ADD CONSTRAINT "stories_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."tags" ADD CONSTRAINT "tags_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" ADD CONSTRAINT "tags_videos_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" ADD CONSTRAINT "tags_videos_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "enovels"."videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."types" ADD CONSTRAINT "types_image_foreign" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" ADD CONSTRAINT "types_characters_characters_id_foreign" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" ADD CONSTRAINT "types_characters_types_id_foreign" FOREIGN KEY ("types_id") REFERENCES "enovels"."types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."videos" ADD CONSTRAINT "videos_file_foreign" FOREIGN KEY ("file") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_cron_event_invocation_logs" ADD CONSTRAINT "hdb_cron_event_invocation_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "hdb_catalog"."hdb_cron_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_scheduled_event_invocation_logs" ADD CONSTRAINT "hdb_scheduled_event_invocation_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "hdb_catalog"."hdb_scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "Space_products" ADD CONSTRAINT "space_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cart" ADD CONSTRAINT "address_cart_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cart" ADD CONSTRAINT "address_cart_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cities" ADD CONSTRAINT "address_cities_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cities" ADD CONSTRAINT "address_cities_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_countries" ADD CONSTRAINT "address_countries_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_countries" ADD CONSTRAINT "address_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_directus_users" ADD CONSTRAINT "address_directus_users_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "agreements_products" ADD CONSTRAINT "agreements_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_foreign" FOREIGN KEY ("author") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_categories" ADD CONSTRAINT "articles_categories_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_categories" ADD CONSTRAINT "articles_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_comments" ADD CONSTRAINT "articles_comments_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_comments" ADD CONSTRAINT "articles_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_departments" ADD CONSTRAINT "articles_departments_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_departments" ADD CONSTRAINT "articles_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_products" ADD CONSTRAINT "attributes_products_attributes_id_foreign" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_products" ADD CONSTRAINT "attributes_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_categories" ADD CONSTRAINT "brands_categories_brands_id_foreign" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_categories" ADD CONSTRAINT "brands_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_departments" ADD CONSTRAINT "brands_departments_brands_id_foreign" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_departments" ADD CONSTRAINT "brands_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_manufacturer" ADD CONSTRAINT "brands_manufacturer_brands_id_foreign" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_manufacturer" ADD CONSTRAINT "brands_manufacturer_manufacturer_id_foreign" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_products" ADD CONSTRAINT "brands_products_brands_id_foreign" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_products" ADD CONSTRAINT "brands_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_shorts" ADD CONSTRAINT "brands_shorts_brands_id_foreign" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_shorts" ADD CONSTRAINT "brands_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_foreign" FOREIGN KEY ("cart") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_products_foreign" FOREIGN KEY ("products") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_seo_foreign" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_departments" ADD CONSTRAINT "categories_departments_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_departments" ADD CONSTRAINT "categories_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_postgresstores" ADD CONSTRAINT "categories_postgresstores_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_postgresstores" ADD CONSTRAINT "categories_postgresstores_postgresstores_id_foreign" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_shorts" ADD CONSTRAINT "categories_shorts_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_shorts" ADD CONSTRAINT "categories_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "circles_directus_users" ADD CONSTRAINT "circles_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cities_countries" ADD CONSTRAINT "cities_countries_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cities_states" ADD CONSTRAINT "cities_states_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_brands" ADD CONSTRAINT "collections_brands_brands_id_foreign" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_brands" ADD CONSTRAINT "collections_brands_collections_id_foreign" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_products" ADD CONSTRAINT "collections_products_collections_id_foreign" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_products" ADD CONSTRAINT "collections_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_directus_users" ADD CONSTRAINT "comments_directus_users_comment_id_foreign" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_products" ADD CONSTRAINT "comments_products_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_products" ADD CONSTRAINT "comments_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_reactions" ADD CONSTRAINT "comments_reactions_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_reactions" ADD CONSTRAINT "comments_reactions_reactions_id_foreign" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_shorts" ADD CONSTRAINT "comments_shorts_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_shorts" ADD CONSTRAINT "comments_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connections_directus_users" ADD CONSTRAINT "connections_directus_users_connections_id_foreign" FOREIGN KEY ("connections_id") REFERENCES "connections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "coupons_products" ADD CONSTRAINT "coupons_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cross_sell_products" ADD CONSTRAINT "cross_sell_products_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" ADD CONSTRAINT "cross_sell_products_products_cross_sell_products_id_foreign" FOREIGN KEY ("cross_sell_products_id") REFERENCES "cross_sell_products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" ADD CONSTRAINT "cross_sell_products_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "currency_departments" ADD CONSTRAINT "currency_departments_currency_id_foreign" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "currency_departments" ADD CONSTRAINT "currency_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_categories" ADD CONSTRAINT "departments_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_categories" ADD CONSTRAINT "departments_categories_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_collections" ADD CONSTRAINT "departments_collections_collections_id_foreign" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_collections" ADD CONSTRAINT "departments_collections_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_products" ADD CONSTRAINT "departments_products_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_products" ADD CONSTRAINT "departments_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_shorts" ADD CONSTRAINT "departments_shorts_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_shorts" ADD CONSTRAINT "departments_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_access" ADD CONSTRAINT "directus_access_policy_foreign" FOREIGN KEY ("policy") REFERENCES "directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_access" ADD CONSTRAINT "directus_access_role_foreign" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_access" ADD CONSTRAINT "directus_access_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_collections" ADD CONSTRAINT "directus_collections_group_foreign" FOREIGN KEY ("group") REFERENCES "directus_collections"("collection");--> statement-breakpoint
ALTER TABLE "directus_comments" ADD CONSTRAINT "directus_comments_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_comments" ADD CONSTRAINT "directus_comments_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_dashboards" ADD CONSTRAINT "directus_dashboards_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_files" ADD CONSTRAINT "directus_files_folder_foreign" FOREIGN KEY ("folder") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_files" ADD CONSTRAINT "directus_files_modified_by_foreign" FOREIGN KEY ("modified_by") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_files" ADD CONSTRAINT "directus_files_uploaded_by_foreign" FOREIGN KEY ("uploaded_by") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_flows" ADD CONSTRAINT "directus_flows_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_folders" ADD CONSTRAINT "directus_folders_parent_foreign" FOREIGN KEY ("parent") REFERENCES "directus_folders"("id");--> statement-breakpoint
ALTER TABLE "directus_notifications" ADD CONSTRAINT "directus_notifications_recipient_foreign" FOREIGN KEY ("recipient") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_notifications" ADD CONSTRAINT "directus_notifications_sender_foreign" FOREIGN KEY ("sender") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_operations" ADD CONSTRAINT "directus_operations_flow_foreign" FOREIGN KEY ("flow") REFERENCES "directus_flows"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_operations" ADD CONSTRAINT "directus_operations_reject_foreign" FOREIGN KEY ("reject") REFERENCES "directus_operations"("id");--> statement-breakpoint
ALTER TABLE "directus_operations" ADD CONSTRAINT "directus_operations_resolve_foreign" FOREIGN KEY ("resolve") REFERENCES "directus_operations"("id");--> statement-breakpoint
ALTER TABLE "directus_operations" ADD CONSTRAINT "directus_operations_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_panels" ADD CONSTRAINT "directus_panels_dashboard_foreign" FOREIGN KEY ("dashboard") REFERENCES "directus_dashboards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_panels" ADD CONSTRAINT "directus_panels_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_permissions" ADD CONSTRAINT "directus_permissions_policy_foreign" FOREIGN KEY ("policy") REFERENCES "directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_presets" ADD CONSTRAINT "directus_presets_role_foreign" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_presets" ADD CONSTRAINT "directus_presets_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_revisions" ADD CONSTRAINT "directus_revisions_activity_foreign" FOREIGN KEY ("activity") REFERENCES "directus_activity"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_revisions" ADD CONSTRAINT "directus_revisions_parent_foreign" FOREIGN KEY ("parent") REFERENCES "directus_revisions"("id");--> statement-breakpoint
ALTER TABLE "directus_revisions" ADD CONSTRAINT "directus_revisions_version_foreign" FOREIGN KEY ("version") REFERENCES "directus_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_roles" ADD CONSTRAINT "directus_roles_parent_foreign" FOREIGN KEY ("parent") REFERENCES "directus_roles"("id");--> statement-breakpoint
ALTER TABLE "directus_sessions" ADD CONSTRAINT "directus_sessions_oauth_client_foreign" FOREIGN KEY ("oauth_client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_sessions" ADD CONSTRAINT "directus_sessions_share_foreign" FOREIGN KEY ("share") REFERENCES "directus_shares"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_sessions" ADD CONSTRAINT "directus_sessions_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_project_logo_foreign" FOREIGN KEY ("project_logo") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_public_background_foreign" FOREIGN KEY ("public_background") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_public_favicon_foreign" FOREIGN KEY ("public_favicon") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_public_foreground_foreign" FOREIGN KEY ("public_foreground") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_public_registration_role_foreign" FOREIGN KEY ("public_registration_role") REFERENCES "directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_storage_default_folder_foreign" FOREIGN KEY ("storage_default_folder") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_shares" ADD CONSTRAINT "directus_shares_collection_foreign" FOREIGN KEY ("collection") REFERENCES "directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_shares" ADD CONSTRAINT "directus_shares_role_foreign" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_shares" ADD CONSTRAINT "directus_shares_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_users" ADD CONSTRAINT "directus_users_role_foreign" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_versions" ADD CONSTRAINT "directus_versions_collection_foreign" FOREIGN KEY ("collection") REFERENCES "directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_versions" ADD CONSTRAINT "directus_versions_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_versions" ADD CONSTRAINT "directus_versions_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "events_cities" ADD CONSTRAINT "events_cities_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_cities" ADD CONSTRAINT "events_cities_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_countries" ADD CONSTRAINT "events_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_countries" ADD CONSTRAINT "events_countries_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_coupons" ADD CONSTRAINT "events_coupons_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_directus_users" ADD CONSTRAINT "events_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_directus_users" ADD CONSTRAINT "events_directus_users_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_files" ADD CONSTRAINT "events_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_files" ADD CONSTRAINT "events_files_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_invoices" ADD CONSTRAINT "events_invoices_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_invoices" ADD CONSTRAINT "events_invoices_invoices_id_foreign" FOREIGN KEY ("invoices_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_lists" ADD CONSTRAINT "events_lists_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_lists" ADD CONSTRAINT "events_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_products" ADD CONSTRAINT "events_products_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_products" ADD CONSTRAINT "events_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_states" ADD CONSTRAINT "events_states_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_states" ADD CONSTRAINT "events_states_states_id_foreign" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_directus_users" ADD CONSTRAINT "faqs_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_directus_users" ADD CONSTRAINT "faqs_directus_users_faqs_id_foreign" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_files" ADD CONSTRAINT "faqs_files_faqs_id_foreign" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_products" ADD CONSTRAINT "faqs_products_faqs_id_foreign" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_products" ADD CONSTRAINT "faqs_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_shop_foreign" FOREIGN KEY ("shop") REFERENCES "shops"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feeds_posts" ADD CONSTRAINT "feeds_posts_feed_id_foreign" FOREIGN KEY ("feed_id") REFERENCES "feeds"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "feeds_posts" ADD CONSTRAINT "feeds_posts_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_anniversaries_foreign" FOREIGN KEY ("anniversaries") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_birthdays_foreign" FOREIGN KEY ("birthdays") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_leaderboards_foreign" FOREIGN KEY ("leaderboards") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_nomination_user_foreign" FOREIGN KEY ("nomination_user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_user_profile_foreign" FOREIGN KEY ("user_profile") REFERENCES "user_profile"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "gamification_directus_users" ADD CONSTRAINT "gamification_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_directus_users" ADD CONSTRAINT "gamification_directus_users_gamification_id_foreign" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_events" ADD CONSTRAINT "gamification_events_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_events" ADD CONSTRAINT "gamification_events_gamification_id_foreign" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_gamification_id_foreign" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_notifications_id_foreign" FOREIGN KEY ("notifications_id") REFERENCES "notifications"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_products" ADD CONSTRAINT "gamification_products_gamification_id_foreign" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_products" ADD CONSTRAINT "gamification_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_videos" ADD CONSTRAINT "gamification_videos_gamification_id_foreign" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_videos" ADD CONSTRAINT "gamification_videos_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "integrations_departments" ADD CONSTRAINT "integrations_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_departments" ADD CONSTRAINT "integrations_departments_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_files" ADD CONSTRAINT "integrations_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_files" ADD CONSTRAINT "integrations_files_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_ratings" ADD CONSTRAINT "integrations_ratings_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_ratings" ADD CONSTRAINT "integrations_ratings_ratings_id_foreign" FOREIGN KEY ("ratings_id") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_report" ADD CONSTRAINT "integrations_report_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_report" ADD CONSTRAINT "integrations_report_report_id_foreign" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_spaces" ADD CONSTRAINT "integrations_spaces_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_spaces" ADD CONSTRAINT "integrations_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_address" ADD CONSTRAINT "invoices_address_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_address" ADD CONSTRAINT "invoices_address_invoice_id_foreign" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_orders" ADD CONSTRAINT "invoices_orders_invoice_id_foreign" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_orders" ADD CONSTRAINT "invoices_orders_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" ADD CONSTRAINT "invoices_shipping_address_invoice_id_foreign" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" ADD CONSTRAINT "invoices_shipping_address_shipping_address_id_foreign" FOREIGN KEY ("shipping_address_id") REFERENCES "shipping_address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_foreign" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_media_foreign" FOREIGN KEY ("media") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "list_items_products" ADD CONSTRAINT "list_items_products_list_items_id_foreign" FOREIGN KEY ("list_items_id") REFERENCES "list_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items_products" ADD CONSTRAINT "list_items_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_products_lists" ADD CONSTRAINT "list_products_lists_list_products_id_foreign" FOREIGN KEY ("list_products_id") REFERENCES "list_products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_products_lists" ADD CONSTRAINT "list_products_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_directus_users" ADD CONSTRAINT "lists_directus_users_list_id_foreign" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_products" ADD CONSTRAINT "lists_products_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_products" ADD CONSTRAINT "lists_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "manufacturer_countries" ADD CONSTRAINT "manufacturer_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "manufacturer_countries" ADD CONSTRAINT "manufacturer_countries_manufacturer_id_foreign" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_foreign" FOREIGN KEY ("conversation") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "musicchart_departments" ADD CONSTRAINT "musicchart_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation" ADD CONSTRAINT "navigation_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "navigation" ADD CONSTRAINT "navigation_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "navigation_pages" ADD CONSTRAINT "navigation_pages_navigation_id_foreign" FOREIGN KEY ("navigation_id") REFERENCES "navigation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation_pages" ADD CONSTRAINT "navigation_pages_pages_id_foreign" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation_websites" ADD CONSTRAINT "navigation_websites_navigation_id_foreign" FOREIGN KEY ("navigation_id") REFERENCES "navigation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation_websites" ADD CONSTRAINT "navigation_websites_websites_id_foreign" FOREIGN KEY ("websites_id") REFERENCES "websites"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_foreign" FOREIGN KEY ("recipient") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items_orders" ADD CONSTRAINT "order_items_orders_order_items_id_foreign" FOREIGN KEY ("order_items_id") REFERENCES "order_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items_orders" ADD CONSTRAINT "order_items_orders_orders_id_foreign" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items_products" ADD CONSTRAINT "order_items_products_order_items_id_foreign" FOREIGN KEY ("order_items_id") REFERENCES "order_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items_products" ADD CONSTRAINT "order_items_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders_products" ADD CONSTRAINT "orders_products_orders_id_foreign" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders_products" ADD CONSTRAINT "orders_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_categories" ADD CONSTRAINT "outlets_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_categories" ADD CONSTRAINT "outlets_categories_outlets_id_foreign" FOREIGN KEY ("outlets_id") REFERENCES "outlets"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_shorts" ADD CONSTRAINT "outlets_shorts_outlets_id_foreign" FOREIGN KEY ("outlets_id") REFERENCES "outlets"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_shorts" ADD CONSTRAINT "outlets_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "page_blocks_files" ADD CONSTRAINT "page_blocks_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "page_blocks_files" ADD CONSTRAINT "page_blocks_files_page_blocks_id_foreign" FOREIGN KEY ("page_blocks_id") REFERENCES "page_blocks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_foreign" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_countries" ADD CONSTRAINT "payments_countries_country_id_foreign" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_countries" ADD CONSTRAINT "payments_countries_payment_id_foreign" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_currency" ADD CONSTRAINT "payments_currency_currency_id_foreign" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_currency" ADD CONSTRAINT "payments_currency_payments_id_foreign" FOREIGN KEY ("payments_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_directus_users" ADD CONSTRAINT "payments_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_directus_users" ADD CONSTRAINT "payments_directus_users_payments_id_foreign" FOREIGN KEY ("payments_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_orders" ADD CONSTRAINT "payments_orders_orders_id_foreign" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_orders" ADD CONSTRAINT "payments_orders_payments_id_foreign" FOREIGN KEY ("payments_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pickup_locations_city" ADD CONSTRAINT "pickup_locations_city_pickup_locations_id_foreign" FOREIGN KEY ("pickup_locations_id") REFERENCES "pickup_locations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pickup_locations_country" ADD CONSTRAINT "pickup_locations_country_pickup_locations_id_foreign" FOREIGN KEY ("pickup_locations_id") REFERENCES "pickup_locations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pickup_locations_state" ADD CONSTRAINT "pickup_locations_state_pickup_locations_id_foreign" FOREIGN KEY ("pickup_locations_id") REFERENCES "pickup_locations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_collections" ADD CONSTRAINT "postgresstores_collections_collections_id_foreign" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_collections" ADD CONSTRAINT "postgresstores_collections_postgresstores_id_foreign" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_products" ADD CONSTRAINT "postgresstores_products_postgresstores_id_foreign" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_products" ADD CONSTRAINT "postgresstores_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_websites" ADD CONSTRAINT "postgresstores_websites_postgresstores_id_foreign" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_websites" ADD CONSTRAINT "postgresstores_websites_websites_id_foreign" FOREIGN KEY ("websites_id") REFERENCES "websites"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_audio_foreign" FOREIGN KEY ("audio") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_foreign" FOREIGN KEY ("author") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_foreign" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_types_products" ADD CONSTRAINT "product_types_products_product_types_id_foreign" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_types_products" ADD CONSTRAINT "product_types_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_attributes" ADD CONSTRAINT "products_attributes_attributes_id_foreign" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_attributes" ADD CONSTRAINT "products_attributes_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_categories" ADD CONSTRAINT "products_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_categories" ADD CONSTRAINT "products_categories_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_countries" ADD CONSTRAINT "products_countries_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_currency" ADD CONSTRAINT "products_currency_currency_id_foreign" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_currency" ADD CONSTRAINT "products_currency_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_departments" ADD CONSTRAINT "products_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_departments" ADD CONSTRAINT "products_departments_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_directus_users" ADD CONSTRAINT "products_directus_users_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_manufacturer" ADD CONSTRAINT "products_manufacturer_manufacturer_id_foreign" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_manufacturer" ADD CONSTRAINT "products_manufacturer_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_product_designer" ADD CONSTRAINT "products_product_designer_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_spaces" ADD CONSTRAINT "products_spaces_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_spaces" ADD CONSTRAINT "products_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_tags" ADD CONSTRAINT "products_tags_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_tags" ADD CONSTRAINT "products_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_websites" ADD CONSTRAINT "products_websites_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_websites" ADD CONSTRAINT "products_websites_websites_id_foreign" FOREIGN KEY ("websites_id") REFERENCES "websites"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_foreign" FOREIGN KEY ("avatar") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_role_foreign" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_followers" ADD CONSTRAINT "profiles_followers_followers_id_foreign" FOREIGN KEY ("followers_id") REFERENCES "followers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_followers" ADD CONSTRAINT "profiles_followers_profiles_id_foreign" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_file_foreign" FOREIGN KEY ("file") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "radios_categories" ADD CONSTRAINT "radios_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_categories" ADD CONSTRAINT "radios_categories_radios_id_foreign" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_departments" ADD CONSTRAINT "radios_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_departments" ADD CONSTRAINT "radios_departments_radios_id_foreign" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_musicchart" ADD CONSTRAINT "radios_musicchart_radios_id_foreign" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ratings_products" ADD CONSTRAINT "ratings_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ratings_products" ADD CONSTRAINT "ratings_products_ratings_id_foreign" FOREIGN KEY ("ratings_id") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_list_id_foreign" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_posts_foreign" FOREIGN KEY ("posts") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_product_foreign" FOREIGN KEY ("product") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_space_id_foreign" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_video_id_foreign" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_comments" ADD CONSTRAINT "reactions_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_comments" ADD CONSTRAINT "reactions_comments_reactions_id_foreign" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_directus_users" ADD CONSTRAINT "reactions_directus_users_reaction_id_foreign" FOREIGN KEY ("reaction_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_lists" ADD CONSTRAINT "reactions_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_lists" ADD CONSTRAINT "reactions_lists_reactions_id_foreign" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_posts" ADD CONSTRAINT "reactions_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_posts" ADD CONSTRAINT "reactions_posts_reactions_id_foreign" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_shorts" ADD CONSTRAINT "reactions_shorts_reactions_id_foreign" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_shorts" ADD CONSTRAINT "reactions_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "region_address" ADD CONSTRAINT "region_address_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_address" ADD CONSTRAINT "region_address_region_id_foreign" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_shipping_address" ADD CONSTRAINT "region_shipping_address_region_id_foreign" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_shipping_address" ADD CONSTRAINT "region_shipping_address_shipping_address_id_foreign" FOREIGN KEY ("shipping_address_id") REFERENCES "shipping_address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "related_products_products" ADD CONSTRAINT "related_products_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "related_products_products" ADD CONSTRAINT "related_products_products_related_products_id_foreign" FOREIGN KEY ("related_products_id") REFERENCES "related_products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_report_id_foreign" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_directus_users" ADD CONSTRAINT "report_directus_users_report_id_foreign" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_faqs" ADD CONSTRAINT "report_faqs_faqs_id_foreign" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_faqs" ADD CONSTRAINT "report_faqs_report_id_foreign" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_products" ADD CONSTRAINT "report_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_products" ADD CONSTRAINT "report_products_report_id_foreign" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_orders" ADD CONSTRAINT "returns_orders_orders_id_foreign" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_orders" ADD CONSTRAINT "returns_orders_returns_id_foreign" FOREIGN KEY ("returns_id") REFERENCES "returns"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_products" ADD CONSTRAINT "returns_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_products" ADD CONSTRAINT "returns_products_returns_id_foreign" FOREIGN KEY ("returns_id") REFERENCES "returns"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reviews_products" ADD CONSTRAINT "reviews_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_name_foreign" FOREIGN KEY ("name") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_order_foreign" FOREIGN KEY ("order") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_address" ADD CONSTRAINT "shipment_address_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_address" ADD CONSTRAINT "shipment_address_shipment_id_foreign" FOREIGN KEY ("shipment_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_comments" ADD CONSTRAINT "shipment_comments_parent_id_foreign" FOREIGN KEY ("parent_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_products" ADD CONSTRAINT "shipment_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_products" ADD CONSTRAINT "shipment_products_shipment_id_foreign" FOREIGN KEY ("shipment_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_tracking" ADD CONSTRAINT "shipment_tracking_parent_id_foreign" FOREIGN KEY ("parent_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" ADD CONSTRAINT "shipping_addresses_cities_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" ADD CONSTRAINT "shipping_addresses_cities_shipping_addresses_id_foreign" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" ADD CONSTRAINT "shipping_addresses_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" ADD CONSTRAINT "shipping_addresses_countries_shipping_addresses_id_foreign" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" ADD CONSTRAINT "shipping_addresses_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" ADD CONSTRAINT "shipping_addresses_directus_users_shipping__1c96539d_foreign" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" ADD CONSTRAINT "shipping_addresses_orders_orders_id_foreign" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" ADD CONSTRAINT "shipping_addresses_orders_shipping_addresses_id_foreign" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" ADD CONSTRAINT "shipping_addresses_states_shipping_addresses_id_foreign" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" ADD CONSTRAINT "shipping_addresses_states_states_id_foreign" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_agreements" ADD CONSTRAINT "shops_agreements_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_categories" ADD CONSTRAINT "shops_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_categories" ADD CONSTRAINT "shops_categories_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_comments" ADD CONSTRAINT "shops_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_comments" ADD CONSTRAINT "shops_comments_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_countries" ADD CONSTRAINT "shops_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_countries" ADD CONSTRAINT "shops_countries_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_departments" ADD CONSTRAINT "shops_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_departments" ADD CONSTRAINT "shops_departments_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_directus_users" ADD CONSTRAINT "shops_directus_users_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_files" ADD CONSTRAINT "shops_files_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_products" ADD CONSTRAINT "shops_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_products" ADD CONSTRAINT "shops_products_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_showcases" ADD CONSTRAINT "shops_showcases_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_showcases" ADD CONSTRAINT "shops_showcases_showcases_id_foreign" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts" ADD CONSTRAINT "shorts_video_foreign" FOREIGN KEY ("video") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_directus_users" ADD CONSTRAINT "shorts_directus_users_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_files" ADD CONSTRAINT "shorts_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_files" ADD CONSTRAINT "shorts_files_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_products" ADD CONSTRAINT "shorts_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_products" ADD CONSTRAINT "shorts_products_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_spaces" ADD CONSTRAINT "shorts_spaces_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_spaces" ADD CONSTRAINT "shorts_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases" ADD CONSTRAINT "showcases_owner_foreign" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_categories" ADD CONSTRAINT "site_preference_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_countries" ADD CONSTRAINT "site_preference_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_departments" ADD CONSTRAINT "site_preference_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_products" ADD CONSTRAINT "site_preference_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_cover_image_foreign" FOREIGN KEY ("cover_image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_owner_foreign" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "spaces_files" ADD CONSTRAINT "spaces_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_files" ADD CONSTRAINT "spaces_files_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_posts" ADD CONSTRAINT "spaces_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_posts" ADD CONSTRAINT "spaces_posts_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_tags" ADD CONSTRAINT "spaces_tags_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_tags" ADD CONSTRAINT "spaces_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "states_cities" ADD CONSTRAINT "states_cities_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "states_cities" ADD CONSTRAINT "states_cities_states_id_foreign" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "streams" ADD CONSTRAINT "streams_stream_id_foreign" FOREIGN KEY ("stream_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "streams_ratings" ADD CONSTRAINT "streams_ratings_ratings_id_foreign" FOREIGN KEY ("ratings_id") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "streams_ratings" ADD CONSTRAINT "streams_ratings_streams_id_foreign" FOREIGN KEY ("streams_id") REFERENCES "streams"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions_directus_users" ADD CONSTRAINT "subscriptions_directus_users_subscriptions_id_foreign" FOREIGN KEY ("subscriptions_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions_products" ADD CONSTRAINT "subscriptions_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions_products" ADD CONSTRAINT "subscriptions_products_subscriptions_id_foreign" FOREIGN KEY ("subscriptions_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_articles" ADD CONSTRAINT "tags_articles_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_articles" ADD CONSTRAINT "tags_articles_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_categories" ADD CONSTRAINT "tags_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_categories" ADD CONSTRAINT "tags_categories_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_departments" ADD CONSTRAINT "tags_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_departments" ADD CONSTRAINT "tags_departments_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_products" ADD CONSTRAINT "tags_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_products" ADD CONSTRAINT "tags_products_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_shorts" ADD CONSTRAINT "tags_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_shorts" ADD CONSTRAINT "tags_shorts_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_countries" ADD CONSTRAINT "taxes_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_countries" ADD CONSTRAINT "taxes_countries_taxes_id_foreign" FOREIGN KEY ("taxes_id") REFERENCES "taxes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_states" ADD CONSTRAINT "taxes_states_states_id_foreign" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_states" ADD CONSTRAINT "taxes_states_taxes_id_foreign" FOREIGN KEY ("taxes_id") REFERENCES "taxes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_foreign" FOREIGN KEY ("order") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "translations_postgresstores" ADD CONSTRAINT "translations_postgresstores_postgresstores_id_foreign" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "translations_postgresstores" ADD CONSTRAINT "translations_postgresstores_translations_id_foreign" FOREIGN KEY ("translations_id") REFERENCES "translations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_friend_foreign" FOREIGN KEY ("friend") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_avatar_foreign" FOREIGN KEY ("avatar") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_distributor_foreign" FOREIGN KEY ("distributor") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_media_foreign" FOREIGN KEY ("media") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_ratings_foreign" FOREIGN KEY ("ratings") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_thumbnail_foreign" FOREIGN KEY ("thumbnail") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "videos_manufacturer" ADD CONSTRAINT "videos_manufacturer_manufacturer_id_foreign" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_manufacturer" ADD CONSTRAINT "videos_manufacturer_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_products" ADD CONSTRAINT "videos_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_products" ADD CONSTRAINT "videos_products_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_creator_foreign" FOREIGN KEY ("creator") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "storage"."objects" ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads" ADD CONSTRAINT "s3_multipart_uploads_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" ADD CONSTRAINT "s3_multipart_uploads_parts_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" ADD CONSTRAINT "s3_multipart_uploads_parts_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "storage"."s3_multipart_uploads"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "platform" ADD CONSTRAINT "platform_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_products" ADD CONSTRAINT "platform_products_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_products" ADD CONSTRAINT "platform_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_navigation" ADD CONSTRAINT "platform_navigation_navigation_id_foreign" FOREIGN KEY ("navigation_id") REFERENCES "navigation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_navigation" ADD CONSTRAINT "platform_navigation_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_pages" ADD CONSTRAINT "platform_pages_pages_id_foreign" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_pages" ADD CONSTRAINT "platform_pages_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_categories" ADD CONSTRAINT "platform_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_categories" ADD CONSTRAINT "platform_categories_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_lists" ADD CONSTRAINT "platform_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_lists" ADD CONSTRAINT "platform_lists_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_articles" ADD CONSTRAINT "platform_articles_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_articles" ADD CONSTRAINT "platform_articles_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_page_blocks" ADD CONSTRAINT "platform_page_blocks_page_blocks_id_foreign" FOREIGN KEY ("page_blocks_id") REFERENCES "page_blocks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_page_blocks" ADD CONSTRAINT "platform_page_blocks_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_cart_items" ADD CONSTRAINT "cart_cart_items_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_cart_items" ADD CONSTRAINT "cart_cart_items_cart_items_id_foreign" FOREIGN KEY ("cart_items_id") REFERENCES "cart_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_timezones" ADD CONSTRAINT "countries_timezones_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_timezones" ADD CONSTRAINT "countries_timezones_timezones_id_foreign" FOREIGN KEY ("timezones_id") REFERENCES "timezones"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_currency" ADD CONSTRAINT "countries_currency_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_currency" ADD CONSTRAINT "countries_currency_currency_id_foreign" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "about_departments_pages" ADD CONSTRAINT "about_departments_pages_pages_id_foreign" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "about_departments_articles" ADD CONSTRAINT "about_departments_articles_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "about_departments_platform" ADD CONSTRAINT "about_departments_platform_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_posts" ADD CONSTRAINT "tags_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_posts" ADD CONSTRAINT "tags_posts_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles_cities" ADD CONSTRAINT "profiles_cities_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_cities" ADD CONSTRAINT "profiles_cities_profiles_id_foreign" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_states" ADD CONSTRAINT "profiles_states_profiles_id_foreign" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_states" ADD CONSTRAINT "profiles_states_states_id_foreign" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_countries" ADD CONSTRAINT "profiles_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_countries" ADD CONSTRAINT "profiles_countries_profiles_id_foreign" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_posts" ADD CONSTRAINT "events_posts_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_posts" ADD CONSTRAINT "events_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_lists" ADD CONSTRAINT "spaces_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_lists" ADD CONSTRAINT "spaces_lists_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_author_foreign" FOREIGN KEY ("author") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "polls_spaces" ADD CONSTRAINT "polls_spaces_polls_id_foreign" FOREIGN KEY ("polls_id") REFERENCES "polls"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls_spaces" ADD CONSTRAINT "polls_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_posts" ADD CONSTRAINT "member_groups_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_polls" ADD CONSTRAINT "member_groups_polls_polls_id_foreign" FOREIGN KEY ("polls_id") REFERENCES "polls"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_events" ADD CONSTRAINT "member_groups_events_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_products" ADD CONSTRAINT "member_groups_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_spaces" ADD CONSTRAINT "collections_spaces_collections_id_foreign" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_spaces" ADD CONSTRAINT "collections_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_live_rooms" ADD CONSTRAINT "spaces_live_rooms_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "seasons_videos" ADD CONSTRAINT "seasons_videos_seasons_id_foreign" FOREIGN KEY ("seasons_id") REFERENCES "seasons"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "seasons_videos" ADD CONSTRAINT "seasons_videos_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_polls" ADD CONSTRAINT "posts_polls_polls_id_foreign" FOREIGN KEY ("polls_id") REFERENCES "polls"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_polls" ADD CONSTRAINT "posts_polls_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moments_spaces" ADD CONSTRAINT "moments_spaces_moments_id_foreign" FOREIGN KEY ("moments_id") REFERENCES "moments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moments_spaces" ADD CONSTRAINT "moments_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moments_products" ADD CONSTRAINT "moments_products_moments_id_foreign" FOREIGN KEY ("moments_id") REFERENCES "moments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moments_products" ADD CONSTRAINT "moments_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_shops" ADD CONSTRAINT "showcases_shops_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_shops" ADD CONSTRAINT "showcases_shops_showcases_id_foreign" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_products" ADD CONSTRAINT "showcases_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_products" ADD CONSTRAINT "showcases_products_showcases_id_foreign" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_spaces" ADD CONSTRAINT "report_spaces_report_id_foreign" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_spaces" ADD CONSTRAINT "report_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_posts" ADD CONSTRAINT "report_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_posts" ADD CONSTRAINT "report_posts_report_id_foreign" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends_posts" ADD CONSTRAINT "user_friends_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends_posts" ADD CONSTRAINT "user_friends_posts_user_friends_id_foreign" FOREIGN KEY ("user_friends_id") REFERENCES "user_friends"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "templates_space_types" ADD CONSTRAINT "templates_space_types_space_types_id_foreign" FOREIGN KEY ("space_types_id") REFERENCES "space_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "templates_space_types" ADD CONSTRAINT "templates_space_types_templates_id_foreign" FOREIGN KEY ("templates_id") REFERENCES "templates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "space_types" ADD CONSTRAINT "space_types_icon_foreign" FOREIGN KEY ("icon") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_space_types" ADD CONSTRAINT "spaces_space_types_space_types_id_foreign" FOREIGN KEY ("space_types_id") REFERENCES "space_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_space_types" ADD CONSTRAINT "spaces_space_types_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_templates" ADD CONSTRAINT "spaces_templates_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_templates" ADD CONSTRAINT "spaces_templates_templates_id_foreign" FOREIGN KEY ("templates_id") REFERENCES "templates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_region" ADD CONSTRAINT "finance_index_region_finance_index_id_foreign" FOREIGN KEY ("finance_index_id") REFERENCES "finance_index"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_region" ADD CONSTRAINT "finance_index_region_region_id_foreign" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_currency" ADD CONSTRAINT "finance_index_currency_currency_id_foreign" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_currency" ADD CONSTRAINT "finance_index_currency_finance_index_id_foreign" FOREIGN KEY ("finance_index_id") REFERENCES "finance_index"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_articles" ADD CONSTRAINT "finance_index_articles_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_articles" ADD CONSTRAINT "finance_index_articles_finance_index_id_foreign" FOREIGN KEY ("finance_index_id") REFERENCES "finance_index"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_countries" ADD CONSTRAINT "region_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_countries" ADD CONSTRAINT "region_countries_region_id_foreign" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" ADD CONSTRAINT "federated_spaces_spaces_federated_spaces_id_foreign" FOREIGN KEY ("federated_spaces_id") REFERENCES "federated_spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" ADD CONSTRAINT "federated_spaces_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_templates" ADD CONSTRAINT "lists_templates_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_templates" ADD CONSTRAINT "lists_templates_templates_id_foreign" FOREIGN KEY ("templates_id") REFERENCES "templates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_files" ADD CONSTRAINT "lists_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_files" ADD CONSTRAINT "lists_files_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items_directus_users" ADD CONSTRAINT "list_items_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items_directus_users" ADD CONSTRAINT "list_items_directus_users_list_items_id_foreign" FOREIGN KEY ("list_items_id") REFERENCES "list_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template" ADD CONSTRAINT "lists_template_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_template" ADD CONSTRAINT "lists_template_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_template_tags" ADD CONSTRAINT "lists_template_tags_lists_template_id_foreign" FOREIGN KEY ("lists_template_id") REFERENCES "lists_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_tags" ADD CONSTRAINT "lists_template_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" ADD CONSTRAINT "lists_template_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" ADD CONSTRAINT "lists_template_directus_users_lists_template_id_foreign" FOREIGN KEY ("lists_template_id") REFERENCES "lists_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_list_items" ADD CONSTRAINT "lists_template_list_items_list_items_id_foreign" FOREIGN KEY ("list_items_id") REFERENCES "list_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_list_items" ADD CONSTRAINT "lists_template_list_items_lists_template_id_foreign" FOREIGN KEY ("lists_template_id") REFERENCES "lists_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_icon_foreign" FOREIGN KEY ("icon") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "projects_directus_users" ADD CONSTRAINT "projects_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_directus_users" ADD CONSTRAINT "projects_directus_users_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_region" ADD CONSTRAINT "projects_region_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_region" ADD CONSTRAINT "projects_region_region_id_foreign" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_lists" ADD CONSTRAINT "projects_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_lists" ADD CONSTRAINT "projects_lists_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_integrations" ADD CONSTRAINT "projects_integrations_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_integrations" ADD CONSTRAINT "projects_integrations_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_products" ADD CONSTRAINT "projects_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_products" ADD CONSTRAINT "projects_products_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board" ADD CONSTRAINT "project_board_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "project_board" ADD CONSTRAINT "project_board_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "project_board_comments" ADD CONSTRAINT "project_board_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_comments" ADD CONSTRAINT "project_board_comments_project_board_id_foreign" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_directus_users" ADD CONSTRAINT "project_board_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_directus_users" ADD CONSTRAINT "project_board_directus_users_project_board_id_foreign" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_files" ADD CONSTRAINT "project_board_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_files" ADD CONSTRAINT "project_board_files_project_board_id_foreign" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_projects" ADD CONSTRAINT "project_board_projects_project_board_id_foreign" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_projects" ADD CONSTRAINT "project_board_projects_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_project_timeline" ADD CONSTRAINT "projects_project_timeline_project_timeline_id_foreign" FOREIGN KEY ("project_timeline_id") REFERENCES "project_timeline"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_project_timeline" ADD CONSTRAINT "projects_project_timeline_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_comments" ADD CONSTRAINT "projects_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_comments" ADD CONSTRAINT "projects_comments_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_calendar" ADD CONSTRAINT "projects_calendar_calendar_id_foreign" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_calendar" ADD CONSTRAINT "projects_calendar_projects_id_foreign" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar" ADD CONSTRAINT "calendar_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_lists" ADD CONSTRAINT "calendar_lists_calendar_id_foreign" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_lists" ADD CONSTRAINT "calendar_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_calendar_id_foreign" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_calendar_id_foreign" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_events_id_foreign" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_directus_users" ADD CONSTRAINT "calendar_directus_users_calendar_id_foreign" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_directus_users" ADD CONSTRAINT "calendar_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_comments" ADD CONSTRAINT "calendar_comments_calendar_id_foreign" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_comments" ADD CONSTRAINT "calendar_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_tags" ADD CONSTRAINT "videos_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_tags" ADD CONSTRAINT "videos_tags_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_comments" ADD CONSTRAINT "videos_comments_comments_id_foreign" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_comments" ADD CONSTRAINT "videos_comments_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "emoji_reactions" ADD CONSTRAINT "emoji_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "departments_showcases" ADD CONSTRAINT "departments_showcases_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_showcases" ADD CONSTRAINT "departments_showcases_showcases_id_foreign" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_spaces" ADD CONSTRAINT "showcases_spaces_showcases_id_foreign" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_spaces" ADD CONSTRAINT "showcases_spaces_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_product_types" ADD CONSTRAINT "attributes_product_types_attributes_id_foreign" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_product_types" ADD CONSTRAINT "attributes_product_types_product_types_id_foreign" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_foreign" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type" ADD CONSTRAINT "lists_type_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_type" ADD CONSTRAINT "lists_type_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_type_categories" ADD CONSTRAINT "lists_type_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type_categories" ADD CONSTRAINT "lists_type_categories_lists_type_id_foreign" FOREIGN KEY ("lists_type_id") REFERENCES "lists_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type_lists" ADD CONSTRAINT "lists_type_lists_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type_lists" ADD CONSTRAINT "lists_type_lists_lists_type_id_foreign" FOREIGN KEY ("lists_type_id") REFERENCES "lists_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts" ADD CONSTRAINT "charts_icon_foreign" FOREIGN KEY ("icon") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_products" ADD CONSTRAINT "charts_products_charts_id_foreign" FOREIGN KEY ("charts_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_products" ADD CONSTRAINT "charts_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "chart_entries" ADD CONSTRAINT "chart_entries_chart_id_foreign" FOREIGN KEY ("chart_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "chart_entries" ADD CONSTRAINT "chart_entries_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_departments" ADD CONSTRAINT "charts_departments_charts_id_foreign" FOREIGN KEY ("charts_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_departments" ADD CONSTRAINT "charts_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_radios" ADD CONSTRAINT "charts_radios_charts_id_foreign" FOREIGN KEY ("charts_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_radios" ADD CONSTRAINT "charts_radios_radios_id_foreign" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_shorts" ADD CONSTRAINT "lists_shorts_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_shorts" ADD CONSTRAINT "lists_shorts_shorts_id_foreign" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_categories" ADD CONSTRAINT "lists_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_categories" ADD CONSTRAINT "lists_categories_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_departments" ADD CONSTRAINT "lists_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_departments" ADD CONSTRAINT "lists_departments_lists_id_foreign" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_directus_users" ADD CONSTRAINT "spaces_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_directus_users" ADD CONSTRAINT "spaces_directus_users_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_categories" ADD CONSTRAINT "videos_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_categories" ADD CONSTRAINT "videos_categories_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_departments" ADD CONSTRAINT "videos_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_departments" ADD CONSTRAINT "videos_departments_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_product_types" ADD CONSTRAINT "videos_product_types_product_types_id_foreign" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_product_types" ADD CONSTRAINT "videos_product_types_videos_id_foreign" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "incentives" ADD CONSTRAINT "incentives_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_currency" ADD CONSTRAINT "incentives_currency_currency_id_foreign" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_currency" ADD CONSTRAINT "incentives_currency_incentives_id_foreign" FOREIGN KEY ("incentives_id") REFERENCES "incentives"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_orders" ADD CONSTRAINT "incentives_orders_incentives_id_foreign" FOREIGN KEY ("incentives_id") REFERENCES "incentives"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_orders" ADD CONSTRAINT "incentives_orders_orders_id_foreign" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_products" ADD CONSTRAINT "incentives_products_incentives_id_foreign" FOREIGN KEY ("incentives_id") REFERENCES "incentives"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_products" ADD CONSTRAINT "incentives_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions_currency" ADD CONSTRAINT "transactions_currency_currency_id_foreign" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions_currency" ADD CONSTRAINT "transactions_currency_transactions_id_foreign" FOREIGN KEY ("transactions_id") REFERENCES "transactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "circles_posts" ADD CONSTRAINT "circles_posts_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "circles_products" ADD CONSTRAINT "circles_products_products_id_foreign" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "storage"."vector_indexes" ADD CONSTRAINT "vector_indexes_bucket_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets_vectors"("id");--> statement-breakpoint
ALTER TABLE "integrations_platform" ADD CONSTRAINT "integrations_platform_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_platform" ADD CONSTRAINT "integrations_platform_platform_id_foreign" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_tags" ADD CONSTRAINT "integrations_tags_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_tags" ADD CONSTRAINT "integrations_tags_tags_id_foreign" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_categories" ADD CONSTRAINT "integrations_categories_categories_id_foreign" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_categories" ADD CONSTRAINT "integrations_categories_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_product_types" ADD CONSTRAINT "integrations_product_types_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_product_types" ADD CONSTRAINT "integrations_product_types_product_types_id_foreign" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_attributes" ADD CONSTRAINT "integrations_attributes_attributes_id_foreign" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_attributes" ADD CONSTRAINT "integrations_attributes_integrations_id_foreign" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shop_type_shops" ADD CONSTRAINT "shop_type_shops_shop_type_id_foreign" FOREIGN KEY ("shop_type_id") REFERENCES "shop_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shop_type_shops" ADD CONSTRAINT "shop_type_shops_shops_id_foreign" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auction_lots" ADD CONSTRAINT "auction_lots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vibez_product_map" ADD CONSTRAINT "vibez_product_map_clip_id_fkey" FOREIGN KEY ("clip_id") REFERENCES "vibez_clips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vibez_product_map" ADD CONSTRAINT "vibez_product_map_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "auction_lots"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spaces_shop_type" ADD CONSTRAINT "spaces_shop_type_shop_type_id_foreign" FOREIGN KEY ("shop_type_id") REFERENCES "shop_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_shop_type" ADD CONSTRAINT "spaces_shop_type_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_articles" ADD CONSTRAINT "spaces_articles_articles_id_foreign" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_articles" ADD CONSTRAINT "spaces_articles_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_cities" ADD CONSTRAINT "spaces_cities_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_cities" ADD CONSTRAINT "spaces_cities_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_states" ADD CONSTRAINT "spaces_states_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_states" ADD CONSTRAINT "spaces_states_states_id_foreign" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_countries" ADD CONSTRAINT "spaces_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_countries" ADD CONSTRAINT "spaces_countries_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_cities" ADD CONSTRAINT "geo_regions_cities_cities_id_foreign" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_cities" ADD CONSTRAINT "geo_regions_cities_geo_regions_id_foreign" FOREIGN KEY ("geo_regions_id") REFERENCES "geo_regions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_states" ADD CONSTRAINT "geo_regions_states_geo_regions_id_foreign" FOREIGN KEY ("geo_regions_id") REFERENCES "geo_regions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_states" ADD CONSTRAINT "geo_regions_states_states_id_foreign" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_countries" ADD CONSTRAINT "geo_regions_countries_countries_id_foreign" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_countries" ADD CONSTRAINT "geo_regions_countries_geo_regions_id_foreign" FOREIGN KEY ("geo_regions_id") REFERENCES "geo_regions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_profile_id_foreign" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_media_id_foreign" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_folder_foreign" FOREIGN KEY ("parent_folder") REFERENCES "media"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media_folders_directus_users" ADD CONSTRAINT "media_folders_directus_users_directus_users_id_foreign" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders_directus_users" ADD CONSTRAINT "media_folders_directus_users_media_folders_id_foreign" FOREIGN KEY ("media_folders_id") REFERENCES "media_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth"."webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."webauthn_challenges" ADD CONSTRAINT "webauthn_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_deployments" ADD CONSTRAINT "directus_deployments_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_deployment_projects" ADD CONSTRAINT "directus_deployment_projects_deployment_foreign" FOREIGN KEY ("deployment") REFERENCES "directus_deployments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_deployment_projects" ADD CONSTRAINT "directus_deployment_projects_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_deployment_runs" ADD CONSTRAINT "directus_deployment_runs_project_foreign" FOREIGN KEY ("project") REFERENCES "directus_deployment_projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_deployment_runs" ADD CONSTRAINT "directus_deployment_runs_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_departments" ADD CONSTRAINT "spaces_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_departments" ADD CONSTRAINT "spaces_departments_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_departments" ADD CONSTRAINT "posts_departments_departments_id_foreign" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_departments" ADD CONSTRAINT "posts_departments_posts_id_foreign" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_pages" ADD CONSTRAINT "spaces_pages_pages_id_foreign" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_pages" ADD CONSTRAINT "spaces_pages_spaces_id_foreign" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" ADD CONSTRAINT "friend_requests_profiles_friend_requests_id_foreign" FOREIGN KEY ("friend_requests_id") REFERENCES "friend_requests"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" ADD CONSTRAINT "friend_requests_profiles_profiles_id_foreign" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_requests_address" ADD CONSTRAINT "friend_requests_address_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_requests_address" ADD CONSTRAINT "friend_requests_address_friend_requests_id_foreign" FOREIGN KEY ("friend_requests_id") REFERENCES "friend_requests"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" ADD CONSTRAINT "friend_suggestions_profiles_friend_suggestions_id_foreign" FOREIGN KEY ("friend_suggestions_id") REFERENCES "friend_suggestions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" ADD CONSTRAINT "friend_suggestions_profiles_profiles_id_foreign" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_oauth_consents" ADD CONSTRAINT "directus_oauth_consents_client_foreign" FOREIGN KEY ("client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_consents" ADD CONSTRAINT "directus_oauth_consents_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_codes" ADD CONSTRAINT "directus_oauth_codes_client_foreign" FOREIGN KEY ("client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_codes" ADD CONSTRAINT "directus_oauth_codes_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_tokens" ADD CONSTRAINT "directus_oauth_tokens_client_foreign" FOREIGN KEY ("client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_tokens" ADD CONSTRAINT "directus_oauth_tokens_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "block_button" ADD CONSTRAINT "block_button_button_group_foreign" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_button" ADD CONSTRAINT "block_button_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_button" ADD CONSTRAINT "block_button_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_button_group" ADD CONSTRAINT "block_button_group_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_button_group" ADD CONSTRAINT "block_button_group_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_block_columns_foreign" FOREIGN KEY ("block_columns") REFERENCES "block_columns"("id");--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_button_group_foreign" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_cta" ADD CONSTRAINT "block_cta_button_group_foreign" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_form" ADD CONSTRAINT "block_form_form_foreign" FOREIGN KEY ("form") REFERENCES "forms"("id");--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_block_gallery_id_foreign" FOREIGN KEY ("block_gallery_id") REFERENCES "block_gallery"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_hero" ADD CONSTRAINT "block_hero_button_group_foreign" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_hero" ADD CONSTRAINT "block_hero_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_logocloud_logos" ADD CONSTRAINT "block_logocloud_logos_block_logocloud_id_foreign" FOREIGN KEY ("block_logocloud_id") REFERENCES "block_logocloud"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_logocloud_logos" ADD CONSTRAINT "block_logocloud_logos_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_step_items" ADD CONSTRAINT "block_step_items_block_steps_foreign" FOREIGN KEY ("block_steps") REFERENCES "block_steps"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_step_items" ADD CONSTRAINT "block_step_items_button_group_foreign" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_step_items" ADD CONSTRAINT "block_step_items_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_block_testi__4af36ccf_foreign" FOREIGN KEY ("block_testimonial_slider_id") REFERENCES "block_testimonials"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_testimonials_id_foreign" FOREIGN KEY ("testimonials_id") REFERENCES "testimonials"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_video" ADD CONSTRAINT "block_video_video_file_foreign" FOREIGN KEY ("video_file") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_foreign" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "globals" ADD CONSTRAINT "globals_logo_on_dark_bg_foreign" FOREIGN KEY ("logo_on_dark_bg") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "globals" ADD CONSTRAINT "globals_logo_on_light_bg_foreign" FOREIGN KEY ("logo_on_light_bg") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "globals" ADD CONSTRAINT "globals_og_image_foreign" FOREIGN KEY ("og_image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_help_collection_foreign" FOREIGN KEY ("help_collection") REFERENCES "help_collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_owner_foreign" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "help_feedback" ADD CONSTRAINT "help_feedback_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "help_feedback" ADD CONSTRAINT "help_feedback_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_form_foreign" FOREIGN KEY ("form") REFERENCES "forms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_project_foreign" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_task_foreign" FOREIGN KEY ("task") REFERENCES "os_tasks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organization_addresses" ADD CONSTRAINT "organization_addresses_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_addresses" ADD CONSTRAINT "organization_addresses_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organization_addresses" ADD CONSTRAINT "organization_addresses_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_folder_foreign" FOREIGN KEY ("folder") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_foreign" FOREIGN KEY ("logo") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_foreign" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_payment_terms_foreign" FOREIGN KEY ("payment_terms") REFERENCES "os_payment_terms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organizations_contacts" ADD CONSTRAINT "organizations_contacts_contacts_id_foreign" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organizations_contacts" ADD CONSTRAINT "organizations_contacts_organizations_id_foreign" FOREIGN KEY ("organizations_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_assigned_to_foreign" FOREIGN KEY ("assigned_to") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_deal_foreign" FOREIGN KEY ("deal") REFERENCES "os_deals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_activity_contacts" ADD CONSTRAINT "os_activity_contacts_contacts_id_foreign" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_activity_contacts" ADD CONSTRAINT "os_activity_contacts_os_activities_id_foreign" FOREIGN KEY ("os_activities_id") REFERENCES "os_activities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_deal_contacts" ADD CONSTRAINT "os_deal_contacts_contacts_id_foreign" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_deal_contacts" ADD CONSTRAINT "os_deal_contacts_os_deals_id_foreign" FOREIGN KEY ("os_deals_id") REFERENCES "os_deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_deal_stage_foreign" FOREIGN KEY ("deal_stage") REFERENCES "os_deal_stages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_owner_foreign" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_deal_stages" ADD CONSTRAINT "os_deal_stages_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_deal_stages" ADD CONSTRAINT "os_deal_stages_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_email_templates" ADD CONSTRAINT "os_email_templates_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_email_templates" ADD CONSTRAINT "os_email_templates_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_file_foreign" FOREIGN KEY ("file") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_invoice_item_foreign" FOREIGN KEY ("invoice_item") REFERENCES "os_invoice_items"("id");--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_project_foreign" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_user_submitted_foreign" FOREIGN KEY ("user_submitted") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_billable_expense_foreign" FOREIGN KEY ("billable_expense") REFERENCES "os_expenses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_invoice_foreign" FOREIGN KEY ("invoice") REFERENCES "os_invoices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_item_foreign" FOREIGN KEY ("item") REFERENCES "os_items"("id");--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_tax_rate_foreign" FOREIGN KEY ("tax_rate") REFERENCES "os_tax_rates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_contact_foreign" FOREIGN KEY ("contact") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_project_foreign" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_items" ADD CONSTRAINT "os_items_default_tax_rate_foreign" FOREIGN KEY ("default_tax_rate") REFERENCES "os_tax_rates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_items" ADD CONSTRAINT "os_items_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_items" ADD CONSTRAINT "os_items_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_contact_foreign" FOREIGN KEY ("contact") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_invoice_foreign" FOREIGN KEY ("invoice") REFERENCES "os_invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payment_terms" ADD CONSTRAINT "os_payment_terms_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payment_terms" ADD CONSTRAINT "os_payment_terms_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_contacts" ADD CONSTRAINT "os_project_contacts_contacts_id_foreign" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_project_contacts" ADD CONSTRAINT "os_project_contacts_os_projects_id_foreign" FOREIGN KEY ("os_projects_id") REFERENCES "os_projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_owner_foreign" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_templates" ADD CONSTRAINT "os_project_templates_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_templates" ADD CONSTRAINT "os_project_templates_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_updates" ADD CONSTRAINT "os_project_updates_project_foreign" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_project_updates" ADD CONSTRAINT "os_project_updates_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_updates" ADD CONSTRAINT "os_project_updates_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_contact_foreign" FOREIGN KEY ("contact") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_proposal_foreign" FOREIGN KEY ("proposal") REFERENCES "os_proposals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_signature_image_foreign" FOREIGN KEY ("signature_image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" ADD CONSTRAINT "os_proposal_blocks_os_proposals_id_foreign" FOREIGN KEY ("os_proposals_id") REFERENCES "os_proposals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" ADD CONSTRAINT "os_proposal_blocks_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" ADD CONSTRAINT "os_proposal_blocks_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" ADD CONSTRAINT "os_proposal_contacts_contacts_id_foreign" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" ADD CONSTRAINT "os_proposal_contacts_os_proposals_id_foreign" FOREIGN KEY ("os_proposals_id") REFERENCES "os_proposals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_deal_foreign" FOREIGN KEY ("deal") REFERENCES "os_deals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_organization_foreign" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_settings" ADD CONSTRAINT "os_settings_organization_folder_root_foreign" FOREIGN KEY ("organization_folder_root") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_task_files" ADD CONSTRAINT "os_task_files_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_task_files" ADD CONSTRAINT "os_task_files_os_tasks_id_foreign" FOREIGN KEY ("os_tasks_id") REFERENCES "os_tasks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_assigned_to_foreign" FOREIGN KEY ("assigned_to") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_form_foreign" FOREIGN KEY ("form") REFERENCES "forms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_project_foreign" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_tax_rates" ADD CONSTRAINT "os_tax_rates_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_tax_rates" ADD CONSTRAINT "os_tax_rates_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "pages_blog" ADD CONSTRAINT "pages_blog_seo_foreign" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pages_projects" ADD CONSTRAINT "pages_projects_seo_foreign" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "post_gallery_items" ADD CONSTRAINT "post_gallery_items_directus_files_id_foreign" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_company_logo_foreign" FOREIGN KEY ("company_logo") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_image_foreign" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_created_foreign" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_updated_foreign" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
CREATE VIEW "extensions"."pg_stat_statements" AS (SELECT pg_stat_statements.userid, pg_stat_statements.dbid, pg_stat_statements.toplevel, pg_stat_statements.queryid, pg_stat_statements.query, pg_stat_statements.plans, pg_stat_statements.total_plan_time, pg_stat_statements.min_plan_time, pg_stat_statements.max_plan_time, pg_stat_statements.mean_plan_time, pg_stat_statements.stddev_plan_time, pg_stat_statements.calls, pg_stat_statements.total_exec_time, pg_stat_statements.min_exec_time, pg_stat_statements.max_exec_time, pg_stat_statements.mean_exec_time, pg_stat_statements.stddev_exec_time, pg_stat_statements.rows, pg_stat_statements.shared_blks_hit, pg_stat_statements.shared_blks_read, pg_stat_statements.shared_blks_dirtied, pg_stat_statements.shared_blks_written, pg_stat_statements.local_blks_hit, pg_stat_statements.local_blks_read, pg_stat_statements.local_blks_dirtied, pg_stat_statements.local_blks_written, pg_stat_statements.temp_blks_read, pg_stat_statements.temp_blks_written, pg_stat_statements.blk_read_time, pg_stat_statements.blk_write_time, pg_stat_statements.temp_blk_read_time, pg_stat_statements.temp_blk_write_time, pg_stat_statements.wal_records, pg_stat_statements.wal_fpi, pg_stat_statements.wal_bytes, pg_stat_statements.jit_functions, pg_stat_statements.jit_generation_time, pg_stat_statements.jit_inlining_count, pg_stat_statements.jit_inlining_time, pg_stat_statements.jit_optimization_count, pg_stat_statements.jit_optimization_time, pg_stat_statements.jit_emission_count, pg_stat_statements.jit_emission_time FROM extensions.pg_stat_statements(true) pg_stat_statements(userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, blk_read_time, blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time));--> statement-breakpoint
CREATE VIEW "extensions"."pg_stat_statements_info" AS (SELECT pg_stat_statements_info.dealloc, pg_stat_statements_info.stats_reset FROM extensions.pg_stat_statements_info() pg_stat_statements_info(dealloc, stats_reset));--> statement-breakpoint
CREATE VIEW "pgsodium"."decrypted_key" AS (SELECT key.id, key.status, key.created, key.expires, key.key_type, key.key_id, key.key_context, key.name, key.associated_data, key.raw_key, CASE WHEN key.raw_key IS NULL THEN NULL::bytea ELSE CASE WHEN key.parent_key IS NULL THEN NULL::bytea ELSE pgsodium.crypto_aead_det_decrypt(key.raw_key, convert_to(key.id::text || key.associated_data, 'utf8'::name), key.parent_key, key.raw_key_nonce) END END AS decrypted_raw_key, key.raw_key_nonce, key.parent_key, key.comment FROM pgsodium.key);--> statement-breakpoint
CREATE VIEW "pgsodium"."mask_columns" AS (SELECT a.attname, a.attrelid, m.key_id, m.key_id_column, m.associated_columns, m.nonce_column, m.format_type FROM pg_attribute a LEFT JOIN pgsodium.masking_rule m ON m.attrelid = a.attrelid AND m.attname = a.attname WHERE a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum);--> statement-breakpoint
CREATE VIEW "pgsodium"."masking_rule" AS (WITH const AS ( SELECT 'encrypt +with +key +id +([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'::text AS pattern_key_id, 'encrypt +with +key +column +([\w\"\-$]+)'::text AS pattern_key_id_column, '(?<=associated) +\(([\w\"\-$, ]+)\)'::text AS pattern_associated_columns, '(?<=nonce) +([\w\"\-$]+)'::text AS pattern_nonce_column, '(?<=decrypt with view) +([\w\"\-$]+\.[\w\"\-$]+)'::text AS pattern_view_name, '(?<=security invoker)'::text AS pattern_security_invoker ), rules_from_seclabels AS ( SELECT sl.objoid AS attrelid, sl.objsubid AS attnum, c.relnamespace::regnamespace AS relnamespace, c.relname, a.attname, format_type(a.atttypid, a.atttypmod) AS format_type, sl.label AS col_description, (regexp_match(sl.label, k.pattern_key_id_column, 'i'::text))[1] AS key_id_column, (regexp_match(sl.label, k.pattern_key_id, 'i'::text))[1] AS key_id, (regexp_match(sl.label, k.pattern_associated_columns, 'i'::text))[1] AS associated_columns, (regexp_match(sl.label, k.pattern_nonce_column, 'i'::text))[1] AS nonce_column, COALESCE((regexp_match(sl2.label, k.pattern_view_name, 'i'::text))[1], (c.relnamespace::regnamespace || '.'::text) || quote_ident('decrypted_'::text || c.relname::text)) AS view_name, 100 AS priority, (regexp_match(sl.label, k.pattern_security_invoker, 'i'::text))[1] IS NOT NULL AS security_invoker FROM const k, pg_seclabel sl JOIN pg_class c ON sl.classoid = c.tableoid AND sl.objoid = c.oid JOIN pg_attribute a ON a.attrelid = c.oid AND sl.objsubid = a.attnum LEFT JOIN pg_seclabel sl2 ON sl2.objoid = c.oid AND sl2.objsubid = 0 WHERE a.attnum > 0 AND c.relnamespace::regnamespace::oid <> 'pg_catalog'::regnamespace::oid AND NOT a.attisdropped AND sl.label ~~* 'ENCRYPT%'::text AND sl.provider = 'pgsodium'::text ) SELECT DISTINCT ON (rules_from_seclabels.attrelid, rules_from_seclabels.attnum) rules_from_seclabels.attrelid, rules_from_seclabels.attnum, rules_from_seclabels.relnamespace, rules_from_seclabels.relname, rules_from_seclabels.attname, rules_from_seclabels.format_type, rules_from_seclabels.col_description, rules_from_seclabels.key_id_column, rules_from_seclabels.key_id, rules_from_seclabels.associated_columns, rules_from_seclabels.nonce_column, rules_from_seclabels.view_name, rules_from_seclabels.priority, rules_from_seclabels.security_invoker FROM rules_from_seclabels ORDER BY rules_from_seclabels.attrelid, rules_from_seclabels.attnum, rules_from_seclabels.priority DESC);--> statement-breakpoint
CREATE VIEW "pgsodium"."valid_key" AS (SELECT key.id, key.name, key.status, key.key_type, key.key_id, key.key_context, key.created, key.expires, key.associated_data FROM pgsodium.key WHERE (key.status = ANY (ARRAY['valid'::pgsodium.key_status, 'default'::pgsodium.key_status])) AND CASE WHEN key.expires IS NULL THEN true ELSE key.expires > now() END);--> statement-breakpoint
CREATE VIEW "vault"."decrypted_secrets" AS (SELECT s.id, s.name, s.description, s.secret, convert_from(vault._crypto_aead_det_decrypt(message => decode(s.secret, 'base64'::text), additional => convert_to(s.id::text, 'utf8'::name), key_id => 0::bigint, context => '\x7067736f6469756d'::bytea, nonce => s.nonce), 'utf8'::name) AS decrypted_secret, s.key_id, s.nonce, s.created_at, s.updated_at FROM vault.secrets s);--> statement-breakpoint
CREATE POLICY "Users can see their own newsfeed" ON "feeds" AS PERMISSIVE FOR SELECT TO public USING (("user" = auth.uid()));--> statement-breakpoint
CREATE POLICY "Allow listening for broadcasts for authenticated users only" ON "realtime"."messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((extension = 'broadcast'::text));--> statement-breakpoint
CREATE POLICY "Allow listening for broadcasts from a specific channel" ON "realtime"."messages" AS PERMISSIVE FOR SELECT TO public USING (((extension = 'broadcast'::text) AND (realtime.topic() = 'channel_name'::text)));--> statement-breakpoint
CREATE POLICY "Allow listening for presences from a specific channel" ON "realtime"."messages" AS PERMISSIVE FOR SELECT TO public USING (((extension = 'presence'::text) AND (realtime.topic() = 'channel_name'::text)));--> statement-breakpoint
CREATE POLICY "Allow listening for presences on all channels for authenticated" ON "realtime"."messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((extension = 'presence'::text));--> statement-breakpoint
CREATE POLICY "Allow pushing broadcasts for authenticated users only" ON "realtime"."messages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((extension = 'broadcast'::text));--> statement-breakpoint
CREATE POLICY "Allow pushing broadcasts to specific channel" ON "realtime"."messages" AS PERMISSIVE FOR INSERT TO public WITH CHECK (((extension = 'broadcast'::text) AND (realtime.topic() = 'channel_name'::text)));--> statement-breakpoint
CREATE POLICY "Publish presence to a specific channel" ON "realtime"."messages" AS PERMISSIVE FOR INSERT TO public WITH CHECK (((extension = 'presence'::text) AND (realtime.topic() = 'channel_name'::text)));
*/
-- organization_members: links users to organizations with a role (owner/admin/member).
-- Backs the Stripe plugin's authorizeReference check in server/utils/auth.ts.
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" varchar(255) DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE,
	CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
	CONSTRAINT "organization_members_user_org_unique" UNIQUE ("user_id", "organization_id")
);
--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members" USING btree ("organization_id");
--> statement-breakpoint
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
