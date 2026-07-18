import { pgSchema, pgEnum, pgTable, serial, uuid, bigserial, text, varchar, integer, bigint, json, boolean, timestamp, customType, numeric, jsonb, char, smallint, inet, date, real, time, index, uniqueIndex, foreignKey, type AnyPgColumn, primaryKey, unique, check, pgPolicy, doublePrecision } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const auth = pgSchema("auth");
export const collaborrate = pgSchema("collaborrate");
export const creativesuite = pgSchema("creativesuite");
export const enovels = pgSchema("enovels");
export const extensions = pgSchema("extensions");
export const graphql = pgSchema("graphql");
export const graphqlPublic = pgSchema("graphql_public");
export const hdbCatalog = pgSchema("hdb_catalog");
export const meeovi = pgSchema("meeovi");
export const meevendure = pgSchema("meevendure");
export const net = pgSchema("net");
export const pgbouncer = pgSchema("pgbouncer");
export const pgmq = pgSchema("pgmq");
export const pgsodium = pgSchema("pgsodium");
export const pgsodiumMasks = pgSchema("pgsodium_masks");
export const pixanomy = pgSchema("pixanomy");
export const realtime = pgSchema("realtime");
export const storage = pgSchema("storage");
export const supabaseFunctions = pgSchema("supabase_functions");
export const vault = pgSchema("vault");
export const requestStatusInNet = net.enum("request_status", ["PENDING", "SUCCESS", "ERROR"])
export const keyStatusInPgsodium = pgsodium.enum("key_status", ["default", "valid", "invalid", "expired"])
export const keyTypeInPgsodium = pgsodium.enum("key_type", ["aead-ietf", "aead-det", "hmacsha512", "hmacsha256", "auth", "shorthash", "generichash", "kdf", "secretbox", "secretstream", "stream_xchacha20"])
export const aalLevelInAuth = auth.enum("aal_level", ["aal1", "aal2", "aal3"])
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", ["s256", "plain"])
export const factorStatusInAuth = auth.enum("factor_status", ["unverified", "verified"])
export const factorTypeInAuth = auth.enum("factor_type", ["totp", "webauthn", "phone"])
export const oneTimeTokenTypeInAuth = auth.enum("one_time_token_type", ["confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token"])
export const colorSource = pgEnum("color_source", ["99COLORS_NET", "ART_PAINTS_YG07S", "BYRNE", "CRAYOLA", "CMYK_COLOR_MODEL", "COLORCODE_IS", "COLORHEXA", "COLORXS", "CORNELL_UNIVERSITY", "COLUMBIA_UNIVERSITY", "DUKE_UNIVERSITY", "ENCYCOLORPEDIA_COM", "ETON_COLLEGE", "FANTETTI_AND_PETRACCHI", "FINDTHEDATA_COM", "FERRARIO_1919", "FEDERAL_STANDARD_595", "FLAG_OF_INDIA", "FLAG_OF_SOUTH_AFRICA", "GLAZEBROOK_AND_BALDRY", "GOOGLE", "HEXCOLOR_CO", "ISCC_NBS", "KELLY_MOORE", "MATTEL", "MAERZ_AND_PAUL", "MILK_PAINT", "MUNSELL_COLOR_WHEEL", "NATURAL_COLOR_SYSTEM", "PANTONE", "PLOCHERE", "POURPRE_COM", "RAL", "RESENE", "RGB_COLOR_MODEL", "THOM_POOLE", "UNIVERSITY_OF_ALABAMA", "UNIVERSITY_OF_CALIFORNIA_DAVIS", "UNIVERSITY_OF_CAMBRIDGE", "UNIVERSITY_OF_NORTH_CAROLINA", "UNIVERSITY_OF_TEXAS_AT_AUSTIN", "X11_WEB", "XONA_COM"])
export const actionInRealtime = realtime.enum("action", ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR"])
export const equalityOpInRealtime = realtime.enum("equality_op", ["eq", "neq", "lt", "lte", "gt", "gte", "in"])
export const buckettypeInStorage = storage.enum("buckettype", ["STANDARD", "ANALYTICS", "VECTOR"])
export const oauthRegistrationTypeInAuth = auth.enum("oauth_registration_type", ["dynamic", "manual"])
export const oauthAuthorizationStatusInAuth = auth.enum("oauth_authorization_status", ["pending", "approved", "denied", "expired"])
export const oauthResponseTypeInAuth = auth.enum("oauth_response_type", ["code"])
export const oauthClientTypeInAuth = auth.enum("oauth_client_type", ["public", "confidential"])

export const directusSettingsIdSeqInEnovels = enovels.sequence("directus_settings_id_seq", { startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false, })
export const directusSettingsIdSeqInMeeovi = meeovi.sequence("directus_settings_id_seq", { startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false, })

export const auditLogEntriesInAuth = auth.table.withRLS("audit_log_entries", {
	instanceId: uuid("instance_id"),
	id: uuid().primaryKey(),
	payload: json(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	ipAddress: varchar("ip_address", { length: 64 }).default("").notNull(),
}, (table) => [
	index("audit_logs_instance_id_idx").using("btree", table.instanceId.asc().nullsLast()),
]);

export const customOauthProvidersInAuth = auth.table("custom_oauth_providers", {
	id: uuid().defaultRandom().primaryKey(),
	providerType: text("provider_type").notNull(),
	identifier: text().notNull(),
	name: text().notNull(),
	clientId: text("client_id").notNull(),
	clientSecret: text("client_secret").notNull(),
	acceptableClientIds: text("acceptable_client_ids").array().default([]).notNull(),
	scopes: text().array().default([]).notNull(),
	pkceEnabled: boolean("pkce_enabled").default(true).notNull(),
	attributeMapping: jsonb("attribute_mapping").default({}).notNull(),
	authorizationParams: jsonb("authorization_params").default({}).notNull(),
	enabled: boolean().default(true).notNull(),
	emailOptional: boolean("email_optional").default(false).notNull(),
	issuer: text(),
	discoveryUrl: text("discovery_url"),
	skipNonceCheck: boolean("skip_nonce_check").default(false).notNull(),
	cachedDiscovery: jsonb("cached_discovery"),
	discoveryCachedAt: timestamp("discovery_cached_at", { withTimezone: true }),
	authorizationUrl: text("authorization_url"),
	tokenUrl: text("token_url"),
	userinfoUrl: text("userinfo_url"),
	jwksUri: text("jwks_uri"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
	customClaimsAllowlist: text("custom_claims_allowlist").array().default([]).notNull(),
}, (table) => [
	index("custom_oauth_providers_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
	index("custom_oauth_providers_enabled_idx").using("btree", table.enabled.asc().nullsLast()),
	index("custom_oauth_providers_identifier_idx").using("btree", table.identifier.asc().nullsLast()),
	index("custom_oauth_providers_provider_type_idx").using("btree", table.providerType.asc().nullsLast()),
	unique("custom_oauth_providers_identifier_key").on(table.identifier),check("custom_oauth_providers_authorization_url_https", sql`((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))`),check("custom_oauth_providers_authorization_url_length", sql`((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))`),check("custom_oauth_providers_client_id_length", sql`((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))`),check("custom_oauth_providers_discovery_url_length", sql`((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))`),check("custom_oauth_providers_identifier_format", sql`(identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)`),check("custom_oauth_providers_issuer_length", sql`((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))`),check("custom_oauth_providers_jwks_uri_https", sql`((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))`),check("custom_oauth_providers_jwks_uri_length", sql`((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))`),check("custom_oauth_providers_name_length", sql`((char_length(name) >= 1) AND (char_length(name) <= 100))`),check("custom_oauth_providers_oauth2_requires_endpoints", sql`((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))`),check("custom_oauth_providers_oidc_discovery_url_https", sql`((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))`),check("custom_oauth_providers_oidc_issuer_https", sql`((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))`),check("custom_oauth_providers_oidc_requires_issuer", sql`((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))`),check("custom_oauth_providers_provider_type_check", sql`(provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))`),check("custom_oauth_providers_token_url_https", sql`((token_url IS NULL) OR (token_url ~~ 'https://%'::text))`),check("custom_oauth_providers_token_url_length", sql`((token_url IS NULL) OR (char_length(token_url) <= 2048))`),check("custom_oauth_providers_userinfo_url_https", sql`((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))`),check("custom_oauth_providers_userinfo_url_length", sql`((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048))`),]);

export const flowStateInAuth = auth.table.withRLS("flow_state", {
	id: uuid().primaryKey(),
	userId: uuid("user_id"),
	authCode: text("auth_code"),
	codeChallengeMethod: codeChallengeMethodInAuth("code_challenge_method"),
	codeChallenge: text("code_challenge"),
	providerType: text("provider_type").notNull(),
	providerAccessToken: text("provider_access_token"),
	providerRefreshToken: text("provider_refresh_token"),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	authenticationMethod: text("authentication_method").notNull(),
	authCodeIssuedAt: timestamp("auth_code_issued_at", { withTimezone: true }),
	inviteToken: text("invite_token"),
	referrer: text(),
	oauthClientStateId: uuid("oauth_client_state_id"),
	linkingTargetId: uuid("linking_target_id"),
	emailOptional: boolean("email_optional").default(false).notNull(),
}, (table) => [
	index("flow_state_created_at_idx").using("btree", table.createdAt.desc().nullsFirst()),
	index("idx_auth_code").using("btree", table.authCode.asc().nullsLast()),
	index("idx_user_id_auth_method").using("btree", table.userId.asc().nullsLast(), table.authenticationMethod.asc().nullsLast()),
]);

export const identitiesInAuth = auth.table.withRLS("identities", {
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull().references(() => usersInAuth.id, { onDelete: "cascade" } ),
	identityData: jsonb("identity_data").notNull(),
	provider: text().notNull(),
	lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	email: text().generatedAlwaysAs(sql`lower((identity_data ->> 'email'::text))`),
	id: uuid().defaultRandom().primaryKey(),
}, (table) => [
	index("identities_email_idx").using("btree", table.email.asc().nullsLast().op("text_pattern_ops")),
	index("identities_user_id_idx").using("btree", table.userId.asc().nullsLast()),
	unique("identities_provider_id_provider_unique").on(table.providerId, table.provider),]);

export const instancesInAuth = auth.table.withRLS("instances", {
	id: uuid().primaryKey(),
	uuid: uuid(),
	rawBaseConfig: text("raw_base_config"),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const mfaAmrClaimsInAuth = auth.table.withRLS("mfa_amr_claims", {
	sessionId: uuid("session_id").notNull().references(() => sessionsInAuth.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
	authenticationMethod: text("authentication_method").notNull(),
	id: uuid().primaryKey(),
}, (table) => [
	unique("mfa_amr_claims_session_id_authentication_method_pkey").on(table.sessionId, table.authenticationMethod),]);

export const mfaChallengesInAuth = auth.table.withRLS("mfa_challenges", {
	id: uuid().primaryKey(),
	factorId: uuid("factor_id").notNull().references(() => mfaFactorsInAuth.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	verifiedAt: timestamp("verified_at", { withTimezone: true }),
	ipAddress: inet("ip_address").notNull(),
	otpCode: text("otp_code"),
	webAuthnSessionData: jsonb("web_authn_session_data"),
}, (table) => [
	index("mfa_challenge_created_at_idx").using("btree", table.createdAt.desc().nullsFirst()),
]);

export const mfaFactorsInAuth = auth.table.withRLS("mfa_factors", {
	id: uuid().primaryKey(),
	userId: uuid("user_id").notNull().references(() => usersInAuth.id, { onDelete: "cascade" } ),
	friendlyName: text("friendly_name"),
	factorType: factorTypeInAuth("factor_type").notNull(),
	status: factorStatusInAuth().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
	secret: text(),
	phone: text(),
	lastChallengedAt: timestamp("last_challenged_at", { withTimezone: true }),
	webAuthnCredential: jsonb("web_authn_credential"),
	webAuthnAaguid: uuid("web_authn_aaguid"),
	lastWebauthnChallengeData: jsonb("last_webauthn_challenge_data"),
}, (table) => [
	index("factor_id_created_at_idx").using("btree", table.userId.asc().nullsLast(), table.createdAt.asc().nullsLast()),
	uniqueIndex("mfa_factors_user_friendly_name_unique").using("btree", table.friendlyName.asc().nullsLast(), table.userId.asc().nullsLast()).where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
	index("mfa_factors_user_id_idx").using("btree", table.userId.asc().nullsLast()),
	uniqueIndex("unique_phone_factor_per_user").using("btree", table.userId.asc().nullsLast(), table.phone.asc().nullsLast()),
	unique("mfa_factors_last_challenged_at_key").on(table.lastChallengedAt),]);

export const oauthAuthorizationsInAuth = auth.table("oauth_authorizations", {
	id: uuid().primaryKey(),
	authorizationId: text("authorization_id").notNull(),
	clientId: uuid("client_id").notNull().references(() => oauthClientsInAuth.id, { onDelete: "cascade" } ),
	userId: uuid("user_id").references(() => usersInAuth.id, { onDelete: "cascade" } ),
	redirectUri: text("redirect_uri").notNull(),
	scope: text().notNull(),
	state: text(),
	resource: text(),
	codeChallenge: text("code_challenge"),
	codeChallengeMethod: codeChallengeMethodInAuth("code_challenge_method"),
	responseType: oauthResponseTypeInAuth("response_type").default("code").notNull(),
	status: oauthAuthorizationStatusInAuth().default("pending").notNull(),
	authorizationCode: text("authorization_code"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).default(sql`(now() + '00:03:00'::interval)`).notNull(),
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	nonce: text(),
}, (table) => [
	index("oauth_auth_pending_exp_idx").using("btree", table.expiresAt.asc().nullsLast()).where(sql`(status = 'pending'::auth.oauth_authorization_status)`),
	unique("oauth_authorizations_authorization_code_key").on(table.authorizationCode),	unique("oauth_authorizations_authorization_id_key").on(table.authorizationId),check("oauth_authorizations_authorization_code_length", sql`(char_length(authorization_code) <= 255)`),check("oauth_authorizations_code_challenge_length", sql`(char_length(code_challenge) <= 128)`),check("oauth_authorizations_expires_at_future", sql`(expires_at > created_at)`),check("oauth_authorizations_nonce_length", sql`(char_length(nonce) <= 255)`),check("oauth_authorizations_redirect_uri_length", sql`(char_length(redirect_uri) <= 2048)`),check("oauth_authorizations_resource_length", sql`(char_length(resource) <= 2048)`),check("oauth_authorizations_scope_length", sql`(char_length(scope) <= 4096)`),check("oauth_authorizations_state_length", sql`(char_length(state) <= 4096)`),]);

export const oauthClientStatesInAuth = auth.table("oauth_client_states", {
	id: uuid().primaryKey(),
	providerType: text("provider_type").notNull(),
	codeVerifier: text("code_verifier"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => [
	index("idx_oauth_client_states_created_at").using("btree", table.createdAt.asc().nullsLast()),
]);

export const oauthClientsInAuth = auth.table("oauth_clients", {
	id: uuid().primaryKey(),
	clientSecretHash: text("client_secret_hash"),
	registrationType: oauthRegistrationTypeInAuth("registration_type").notNull(),
	redirectUris: text("redirect_uris").notNull(),
	grantTypes: text("grant_types").notNull(),
	clientName: text("client_name"),
	clientUri: text("client_uri"),
	logoUri: text("logo_uri"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
	clientType: oauthClientTypeInAuth("client_type").default("confidential").notNull(),
	tokenEndpointAuthMethod: text("token_endpoint_auth_method").notNull(),
}, (table) => [
	index("oauth_clients_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast()),
check("oauth_clients_client_name_length", sql`(char_length(client_name) <= 1024)`),check("oauth_clients_client_uri_length", sql`(char_length(client_uri) <= 2048)`),check("oauth_clients_logo_uri_length", sql`(char_length(logo_uri) <= 2048)`),check("oauth_clients_token_endpoint_auth_method_check", sql`(token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text]))`),]);

export const oauthConsentsInAuth = auth.table("oauth_consents", {
	id: uuid().primaryKey(),
	userId: uuid("user_id").notNull().references(() => usersInAuth.id, { onDelete: "cascade" } ),
	clientId: uuid("client_id").notNull().references(() => oauthClientsInAuth.id, { onDelete: "cascade" } ),
	scopes: text().notNull(),
	grantedAt: timestamp("granted_at", { withTimezone: true }).default(sql`now()`).notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
	index("oauth_consents_active_client_idx").using("btree", table.clientId.asc().nullsLast()).where(sql`(revoked_at IS NULL)`),
	index("oauth_consents_active_user_client_idx").using("btree", table.userId.asc().nullsLast(), table.clientId.asc().nullsLast()).where(sql`(revoked_at IS NULL)`),
	index("oauth_consents_user_order_idx").using("btree", table.userId.asc().nullsLast(), table.grantedAt.desc().nullsFirst()),
	unique("oauth_consents_user_client_unique").on(table.userId, table.clientId),check("oauth_consents_revoked_after_granted", sql`((revoked_at IS NULL) OR (revoked_at >= granted_at))`),check("oauth_consents_scopes_length", sql`(char_length(scopes) <= 2048)`),check("oauth_consents_scopes_not_empty", sql`(char_length(TRIM(BOTH FROM scopes)) > 0)`),]);

export const oneTimeTokensInAuth = auth.table.withRLS("one_time_tokens", {
	id: uuid().primaryKey(),
	userId: uuid("user_id").notNull().references(() => usersInAuth.id, { onDelete: "cascade" } ),
	tokenType: oneTimeTokenTypeInAuth("token_type").notNull(),
	tokenHash: text("token_hash").notNull(),
	relatesTo: text("relates_to").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
	index("one_time_tokens_relates_to_hash_idx").using("hash", table.relatesTo.asc().nullsLast()),
	index("one_time_tokens_token_hash_hash_idx").using("hash", table.tokenHash.asc().nullsLast()),
	uniqueIndex("one_time_tokens_user_id_token_type_key").using("btree", table.userId.asc().nullsLast(), table.tokenType.asc().nullsLast()),
check("one_time_tokens_token_hash_check", sql`(char_length(token_hash) > 0)`),]);

export const refreshTokensInAuth = auth.table.withRLS("refresh_tokens", {
	instanceId: uuid("instance_id"),
	id: bigserial({ mode: 'number' }).primaryKey(),
	token: varchar({ length: 255 }),
	userId: varchar("user_id", { length: 255 }),
	revoked: boolean(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	parent: varchar({ length: 255 }),
	sessionId: uuid("session_id").references(() => sessionsInAuth.id, { onDelete: "cascade" } ),
}, (table) => [
	index("refresh_tokens_instance_id_idx").using("btree", table.instanceId.asc().nullsLast()),
	index("refresh_tokens_instance_id_user_id_idx").using("btree", table.instanceId.asc().nullsLast(), table.userId.asc().nullsLast()),
	index("refresh_tokens_parent_idx").using("btree", table.parent.asc().nullsLast()),
	index("refresh_tokens_session_id_revoked_idx").using("btree", table.sessionId.asc().nullsLast(), table.revoked.asc().nullsLast()),
	index("refresh_tokens_updated_at_idx").using("btree", table.updatedAt.desc().nullsFirst()),
	unique("refresh_tokens_token_unique").on(table.token),]);

export const samlProvidersInAuth = auth.table.withRLS("saml_providers", {
	id: uuid().primaryKey(),
	ssoProviderId: uuid("sso_provider_id").notNull().references(() => ssoProvidersInAuth.id, { onDelete: "cascade" } ),
	entityId: text("entity_id").notNull(),
	metadataXml: text("metadata_xml").notNull(),
	metadataUrl: text("metadata_url"),
	attributeMapping: jsonb("attribute_mapping"),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	nameIdFormat: text("name_id_format"),
}, (table) => [
	index("saml_providers_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast()),
	unique("saml_providers_entity_id_key").on(table.entityId),check("entity_id not empty", sql`(char_length(entity_id) > 0)`),check("metadata_url not empty", sql`((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))`),check("metadata_xml not empty", sql`(char_length(metadata_xml) > 0)`),]);

export const samlRelayStatesInAuth = auth.table.withRLS("saml_relay_states", {
	id: uuid().primaryKey(),
	ssoProviderId: uuid("sso_provider_id").notNull().references(() => ssoProvidersInAuth.id, { onDelete: "cascade" } ),
	requestId: text("request_id").notNull(),
	forEmail: text("for_email"),
	redirectTo: text("redirect_to"),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	flowStateId: uuid("flow_state_id").references(() => flowStateInAuth.id, { onDelete: "cascade" } ),
}, (table) => [
	index("saml_relay_states_created_at_idx").using("btree", table.createdAt.desc().nullsFirst()),
	index("saml_relay_states_for_email_idx").using("btree", table.forEmail.asc().nullsLast()),
	index("saml_relay_states_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast()),
check("request_id not empty", sql`(char_length(request_id) > 0)`),]);

export const schemaMigrationsInAuth = auth.table.withRLS("schema_migrations", {
	version: varchar({ length: 255 }).primaryKey(),
});

export const sessionsInAuth = auth.table.withRLS("sessions", {
	id: uuid().primaryKey(),
	userId: uuid("user_id").notNull().references(() => usersInAuth.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	factorId: uuid("factor_id"),
	aal: aalLevelInAuth(),
	notAfter: timestamp("not_after", { withTimezone: true }),
	refreshedAt: timestamp("refreshed_at"),
	userAgent: text("user_agent"),
	ip: inet(),
	tag: text(),
	oauthClientId: uuid("oauth_client_id").references(() => oauthClientsInAuth.id, { onDelete: "cascade" } ),
	refreshTokenHmacKey: text("refresh_token_hmac_key"),
	refreshTokenCounter: bigint("refresh_token_counter", { mode: 'number' }),
	scopes: text(),
}, (table) => [
	index("sessions_not_after_idx").using("btree", table.notAfter.desc().nullsFirst()),
	index("sessions_oauth_client_id_idx").using("btree", table.oauthClientId.asc().nullsLast()),
	index("sessions_user_id_idx").using("btree", table.userId.asc().nullsLast()),
	index("user_id_created_at_idx").using("btree", table.userId.asc().nullsLast(), table.createdAt.asc().nullsLast()),
check("sessions_scopes_length", sql`(char_length(scopes) <= 4096)`),]);

export const ssoDomainsInAuth = auth.table.withRLS("sso_domains", {
	id: uuid().primaryKey(),
	ssoProviderId: uuid("sso_provider_id").notNull().references(() => ssoProvidersInAuth.id, { onDelete: "cascade" } ),
	domain: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
	uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
	index("sso_domains_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast()),
check("domain not empty", sql`(char_length(domain) > 0)`),]);

export const ssoProvidersInAuth = auth.table.withRLS("sso_providers", {
	id: uuid().primaryKey(),
	resourceId: text("resource_id"),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	disabled: boolean(),
}, (table) => [
	uniqueIndex("sso_providers_resource_id_idx").using("btree", sql`lower(resource_id)`),
	index("sso_providers_resource_id_pattern_idx").using("btree", table.resourceId.asc().nullsLast().op("text_pattern_ops")),
check("resource_id not empty", sql`((resource_id = NULL::text) OR (char_length(resource_id) > 0))`),]);

export const usersInAuth = auth.table.withRLS("users", {
	instanceId: uuid("instance_id"),
	id: uuid().primaryKey(),
	aud: varchar({ length: 255 }),
	role: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	encryptedPassword: varchar("encrypted_password", { length: 255 }),
	emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true }),
	invitedAt: timestamp("invited_at", { withTimezone: true }),
	confirmationToken: varchar("confirmation_token", { length: 255 }),
	confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true }),
	recoveryToken: varchar("recovery_token", { length: 255 }),
	recoverySentAt: timestamp("recovery_sent_at", { withTimezone: true }),
	emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
	emailChange: varchar("email_change", { length: 255 }),
	emailChangeSentAt: timestamp("email_change_sent_at", { withTimezone: true }),
	lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
	rawAppMetaData: jsonb("raw_app_meta_data"),
	rawUserMetaData: jsonb("raw_user_meta_data"),
	isSuperAdmin: boolean("is_super_admin"),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	phone: text().default(sql`NULL`),
	phoneConfirmedAt: timestamp("phone_confirmed_at", { withTimezone: true }),
	phoneChange: text("phone_change").default(""),
	phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(""),
	phoneChangeSentAt: timestamp("phone_change_sent_at", { withTimezone: true }),
	confirmedAt: timestamp("confirmed_at", { withTimezone: true }).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
	emailChangeTokenCurrent: varchar("email_change_token_current", { length: 255 }).default(""),
	emailChangeConfirmStatus: smallint("email_change_confirm_status").default(0),
	bannedUntil: timestamp("banned_until", { withTimezone: true }),
	reauthenticationToken: varchar("reauthentication_token", { length: 255 }).default(""),
	reauthenticationSentAt: timestamp("reauthentication_sent_at", { withTimezone: true }),
	isSsoUser: boolean("is_sso_user").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
	isAnonymous: boolean("is_anonymous").default(false).notNull(),
}, (table) => [
	uniqueIndex("confirmation_token_idx").using("btree", table.confirmationToken.asc().nullsLast()).where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("email_change_token_current_idx").using("btree", table.emailChangeTokenCurrent.asc().nullsLast()).where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("email_change_token_new_idx").using("btree", table.emailChangeTokenNew.asc().nullsLast()).where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("reauthentication_token_idx").using("btree", table.reauthenticationToken.asc().nullsLast()).where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("recovery_token_idx").using("btree", table.recoveryToken.asc().nullsLast()).where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
	uniqueIndex("users_email_partial_key").using("btree", table.email.asc().nullsLast()).where(sql`(is_sso_user = false)`),
	index("users_instance_id_email_idx").using("btree", table.instanceId.asc().nullsLast(), sql`lower((email)::text)`),
	index("users_instance_id_idx").using("btree", table.instanceId.asc().nullsLast()),
	index("users_is_anonymous_idx").using("btree", table.isAnonymous.asc().nullsLast()),
	unique("users_phone_key").on(table.phone),check("users_email_change_confirm_status_check", sql`((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2))`),]);

export const webauthnChallengesInAuth = auth.table("webauthn_challenges", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => usersInAuth.id, { onDelete: "cascade" } ),
	challengeType: text("challenge_type").notNull(),
	sessionData: jsonb("session_data").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
	index("webauthn_challenges_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast()),
	index("webauthn_challenges_user_id_idx").using("btree", table.userId.asc().nullsLast()),
check("webauthn_challenges_challenge_type_check", sql`(challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text]))`),]);

export const webauthnCredentialsInAuth = auth.table("webauthn_credentials", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => usersInAuth.id, { onDelete: "cascade" } ),
	credentialId: customType({ dataType: () => 'bytea' })("credential_id").notNull(),
	publicKey: customType({ dataType: () => 'bytea' })("public_key").notNull(),
	attestationType: text("attestation_type").default("").notNull(),
	aaguid: uuid(),
	signCount: bigint("sign_count", { mode: 'number' }).default(0).notNull(),
	transports: jsonb().default([]).notNull(),
	backupEligible: boolean("backup_eligible").default(false).notNull(),
	backedUp: boolean("backed_up").default(false).notNull(),
	friendlyName: text("friendly_name").default("").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
	lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
}, (table) => [
	uniqueIndex("webauthn_credentials_credential_id_key").using("btree", table.credentialId.asc().nullsLast()),
	index("webauthn_credentials_user_id_idx").using("btree", table.userId.asc().nullsLast()),
]);

export const abilitiesInEnovels = enovels.table("abilities", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	type: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
});

export const blogInEnovels = enovels.table("blog", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	name: text().notNull(),
	excerpt: text().notNull(),
	categories: text().notNull(),
	characters: text(),
	description: text(),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	file: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
});

export const categoriesInEnovels = enovels.table("categories", {
	id: serial().primaryKey(),
	name: text().notNull(),
	description: text(),
	content: text(),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	visibility: varchar({ length: 255 }),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	slug: varchar({ length: 255 }),
});

export const categoriesTagsInEnovels = enovels.table("categories_tags", {
	id: serial().primaryKey(),
	categoriesId: integer("categories_id").references(() => categoriesInEnovels.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tagsInEnovels.id, { onDelete: "set null" } ),
});

export const charactersInEnovels = enovels.table("characters", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("published").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	age: integer(),
	alias: varchar({ length: 255 }),
	description: text(),
	type: varchar({ length: 255 }),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
});

export const charactersAbilitiesInEnovels = enovels.table("characters_abilities", {
	id: serial().primaryKey(),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
	abilitiesId: integer("abilities_id").references(() => abilitiesInEnovels.id, { onDelete: "set null" } ),
});

export const charactersCharactersInEnovels = enovels.table("characters_characters", {
	id: serial().primaryKey(),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
	relatedCharactersId: integer("related_characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
});

export const charactersTagsInEnovels = enovels.table("characters_tags", {
	id: serial().primaryKey(),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tagsInEnovels.id, { onDelete: "set null" } ),
});

export const charactersVideosInEnovels = enovels.table("characters_videos", {
	id: serial().primaryKey(),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
	videosId: bigint("videos_id", { mode: 'number' }).references(() => videosInEnovels.id, { onDelete: "set null" } ),
});

export const dictionaryInEnovels = enovels.table("dictionary", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("published").notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	excerpt: text(),
	description: text(),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	pronunction: varchar({ length: 255 }),
});

export const directusAccessInEnovels = enovels.table("directus_access", {
	id: uuid().primaryKey(),
	role: uuid().references(() => directusRolesInEnovels.id, { onDelete: "cascade" } ),
	user: uuid().references(() => directusUsersInEnovels.id, { onDelete: "cascade" } ),
	policy: uuid().notNull().references(() => directusPoliciesInEnovels.id, { onDelete: "cascade" } ),
	sort: integer(),
});

export const directusActivityInEnovels = enovels.table("directus_activity", {
	id: serial().primaryKey(),
	action: varchar({ length: 45 }).notNull(),
	user: uuid(),
	timestamp: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	ip: varchar({ length: 50 }),
	userAgent: text("user_agent"),
	collection: varchar({ length: 64 }).notNull(),
	item: varchar({ length: 255 }).notNull(),
	origin: varchar({ length: 255 }),
});

export const directusCollectionsInEnovels = enovels.table("directus_collections", {
	collection: varchar({ length: 64 }).primaryKey(),
	icon: varchar({ length: 64 }),
	note: text(),
	displayTemplate: varchar("display_template", { length: 255 }),
	hidden: boolean().default(false).notNull(),
	singleton: boolean().default(false).notNull(),
	translations: json(),
	archiveField: varchar("archive_field", { length: 64 }),
	archiveAppFilter: boolean("archive_app_filter").default(true).notNull(),
	archiveValue: varchar("archive_value", { length: 255 }),
	unarchiveValue: varchar("unarchive_value", { length: 255 }),
	sortField: varchar("sort_field", { length: 64 }),
	accountability: varchar({ length: 255 }).default("all"),
	color: varchar({ length: 255 }),
	itemDuplicationFields: json("item_duplication_fields"),
	sort: integer(),
	group: varchar({ length: 64 }),
	collapse: varchar({ length: 255 }).default("open").notNull(),
	previewUrl: varchar("preview_url", { length: 255 }),
	versioning: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.group],
		foreignColumns: [table.collection],
		name: "directus_collections_group_foreign"
	}),
]);

export const directusCommentsInEnovels = enovels.table("directus_comments", {
	id: uuid().primaryKey(),
	collection: varchar({ length: 64 }).notNull(),
	item: varchar({ length: 255 }).notNull(),
	comment: text().notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	dateUpdated: timestamp("date_updated", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id, { onDelete: "set null" } ),
	userUpdated: uuid("user_updated").references(() => directusUsersInEnovels.id),
});

export const directusDashboardsInEnovels = enovels.table("directus_dashboards", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 64 }).default("dashboard").notNull(),
	note: text(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id, { onDelete: "set null" } ),
	color: varchar({ length: 255 }),
});

export const directusExtensionsInEnovels = enovels.table("directus_extensions", {
	enabled: boolean().default(true).notNull(),
	id: uuid().primaryKey(),
	folder: varchar({ length: 255 }).notNull(),
	source: varchar({ length: 255 }).notNull(),
	bundle: uuid(),
});

export const directusFieldsInEnovels = enovels.table("directus_fields", {
	id: serial().primaryKey(),
	collection: varchar({ length: 64 }).notNull(),
	field: varchar({ length: 64 }).notNull(),
	special: varchar({ length: 64 }),
	interface: varchar({ length: 64 }),
	options: json(),
	display: varchar({ length: 64 }),
	displayOptions: json("display_options"),
	readonly: boolean().default(false).notNull(),
	hidden: boolean().default(false).notNull(),
	sort: integer(),
	width: varchar({ length: 30 }).default("full"),
	translations: json(),
	note: text(),
	conditions: json(),
	required: boolean().default(false),
	group: varchar({ length: 64 }),
	validation: json(),
	validationMessage: text("validation_message"),
});

export const directusFilesInEnovels = enovels.table("directus_files", {
	id: uuid().primaryKey(),
	storage: varchar({ length: 255 }).notNull(),
	filenameDisk: varchar("filename_disk", { length: 255 }),
	filenameDownload: varchar("filename_download", { length: 255 }).notNull(),
	title: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	folder: uuid().references(() => directusFoldersInEnovels.id, { onDelete: "set null" } ),
	uploadedBy: uuid("uploaded_by").references(() => directusUsersInEnovels.id),
	createdOn: timestamp("created_on", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	modifiedBy: uuid("modified_by").references(() => directusUsersInEnovels.id),
	modifiedOn: timestamp("modified_on", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	charset: varchar({ length: 50 }),
	filesize: bigint({ mode: 'number' }),
	width: integer(),
	height: integer(),
	duration: integer(),
	embed: varchar({ length: 200 }),
	description: text(),
	location: text(),
	tags: text(),
	metadata: json(),
	focalPointX: integer("focal_point_x"),
	focalPointY: integer("focal_point_y"),
	tusId: varchar("tus_id", { length: 64 }),
	tusData: json("tus_data"),
	uploadedOn: timestamp("uploaded_on", { withTimezone: true }),
});

export const directusFlowsInEnovels = enovels.table("directus_flows", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 64 }),
	color: varchar({ length: 255 }),
	description: text(),
	status: varchar({ length: 255 }).default("active").notNull(),
	trigger: varchar({ length: 255 }),
	accountability: varchar({ length: 255 }).default("all"),
	options: json(),
	operation: uuid(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id, { onDelete: "set null" } ),
}, (table) => [
	unique("directus_flows_operation_unique").on(table.operation),]);

export const directusFoldersInEnovels = enovels.table("directus_folders", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	parent: uuid(),
}, (table) => [
	foreignKey({
		columns: [table.parent],
		foreignColumns: [table.id],
		name: "directus_folders_parent_foreign"
	}),
]);

export const directusMigrationsInEnovels = enovels.table("directus_migrations", {
	version: varchar({ length: 255 }).primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	timestamp: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

export const directusNotificationsInEnovels = enovels.table("directus_notifications", {
	id: serial().primaryKey(),
	timestamp: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	status: varchar({ length: 255 }).default("inbox"),
	recipient: uuid().notNull().references(() => directusUsersInEnovels.id, { onDelete: "cascade" } ),
	sender: uuid().references(() => directusUsersInEnovels.id),
	subject: varchar({ length: 255 }).notNull(),
	message: text(),
	collection: varchar({ length: 64 }),
	item: varchar({ length: 255 }),
});

export const directusOperationsInEnovels = enovels.table("directus_operations", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }),
	key: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 255 }).notNull(),
	positionX: integer("position_x").notNull(),
	positionY: integer("position_y").notNull(),
	options: json(),
	resolve: uuid(),
	reject: uuid(),
	flow: uuid().notNull().references(() => directusFlowsInEnovels.id, { onDelete: "cascade" } ),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id, { onDelete: "set null" } ),
}, (table) => [
	foreignKey({
		columns: [table.reject],
		foreignColumns: [table.id],
		name: "directus_operations_reject_foreign"
	}),
	foreignKey({
		columns: [table.resolve],
		foreignColumns: [table.id],
		name: "directus_operations_resolve_foreign"
	}),
	unique("directus_operations_reject_unique").on(table.reject),	unique("directus_operations_resolve_unique").on(table.resolve),]);

export const directusPanelsInEnovels = enovels.table("directus_panels", {
	id: uuid().primaryKey(),
	dashboard: uuid().notNull().references(() => directusDashboardsInEnovels.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }),
	icon: varchar({ length: 64 }).default(sql`NULL`),
	color: varchar({ length: 10 }),
	showHeader: boolean("show_header").default(false).notNull(),
	note: text(),
	type: varchar({ length: 255 }).notNull(),
	positionX: integer("position_x").notNull(),
	positionY: integer("position_y").notNull(),
	width: integer().notNull(),
	height: integer().notNull(),
	options: json(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id, { onDelete: "set null" } ),
});

export const directusPermissionsInEnovels = enovels.table("directus_permissions", {
	id: serial().primaryKey(),
	collection: varchar({ length: 64 }).notNull(),
	action: varchar({ length: 10 }).notNull(),
	permissions: json(),
	validation: json(),
	presets: json(),
	fields: text(),
	policy: uuid().notNull().references(() => directusPoliciesInEnovels.id, { onDelete: "cascade" } ),
});

export const directusPoliciesInEnovels = enovels.table("directus_policies", {
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	icon: varchar({ length: 64 }).default("badge").notNull(),
	description: text(),
	ipAccess: text("ip_access"),
	enforceTfa: boolean("enforce_tfa").default(false).notNull(),
	adminAccess: boolean("admin_access").default(false).notNull(),
	appAccess: boolean("app_access").default(false).notNull(),
});

export const directusPresetsInEnovels = enovels.table("directus_presets", {
	id: serial().primaryKey(),
	bookmark: varchar({ length: 255 }),
	user: uuid().references(() => directusUsersInEnovels.id, { onDelete: "cascade" } ),
	role: uuid().references(() => directusRolesInEnovels.id, { onDelete: "cascade" } ),
	collection: varchar({ length: 64 }),
	search: varchar({ length: 100 }),
	layout: varchar({ length: 100 }).default("tabular"),
	layoutQuery: json("layout_query"),
	layoutOptions: json("layout_options"),
	refreshInterval: integer("refresh_interval"),
	filter: json(),
	icon: varchar({ length: 64 }).default("bookmark"),
	color: varchar({ length: 255 }),
});

export const directusRelationsInEnovels = enovels.table("directus_relations", {
	id: serial().primaryKey(),
	manyCollection: varchar("many_collection", { length: 64 }).notNull(),
	manyField: varchar("many_field", { length: 64 }).notNull(),
	oneCollection: varchar("one_collection", { length: 64 }),
	oneField: varchar("one_field", { length: 64 }),
	oneCollectionField: varchar("one_collection_field", { length: 64 }),
	oneAllowedCollections: text("one_allowed_collections"),
	junctionField: varchar("junction_field", { length: 64 }),
	sortField: varchar("sort_field", { length: 64 }),
	oneDeselectAction: varchar("one_deselect_action", { length: 255 }).default("nullify").notNull(),
});

export const directusRevisionsInEnovels = enovels.table("directus_revisions", {
	id: serial().primaryKey(),
	activity: integer().notNull().references(() => directusActivityInEnovels.id, { onDelete: "cascade" } ),
	collection: varchar({ length: 64 }).notNull(),
	item: varchar({ length: 255 }).notNull(),
	data: json(),
	delta: json(),
	parent: integer(),
	version: uuid().references(() => directusVersionsInEnovels.id, { onDelete: "cascade" } ),
}, (table) => [
	foreignKey({
		columns: [table.parent],
		foreignColumns: [table.id],
		name: "directus_revisions_parent_foreign"
	}),
]);

export const directusRolesInEnovels = enovels.table("directus_roles", {
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	icon: varchar({ length: 64 }).default("supervised_user_circle").notNull(),
	description: text(),
	parent: uuid(),
}, (table) => [
	foreignKey({
		columns: [table.parent],
		foreignColumns: [table.id],
		name: "directus_roles_parent_foreign"
	}),
]);

export const directusSessionsInEnovels = enovels.table("directus_sessions", {
	token: varchar({ length: 64 }).primaryKey(),
	user: uuid().references(() => directusUsersInEnovels.id, { onDelete: "cascade" } ),
	expires: timestamp({ withTimezone: true }).notNull(),
	ip: varchar({ length: 255 }),
	userAgent: text("user_agent"),
	share: uuid().references(() => directusSharesInEnovels.id, { onDelete: "cascade" } ),
	origin: varchar({ length: 255 }),
	nextToken: varchar("next_token", { length: 64 }),
});

export const directusSharesInEnovels = enovels.table("directus_shares", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }),
	collection: varchar({ length: 64 }).notNull().references(() => directusCollectionsInEnovels.collection, { onDelete: "cascade" } ),
	item: varchar({ length: 255 }).notNull(),
	role: uuid().references(() => directusRolesInEnovels.id, { onDelete: "cascade" } ),
	password: varchar({ length: 255 }),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id, { onDelete: "set null" } ),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	dateStart: timestamp("date_start", { withTimezone: true }),
	dateEnd: timestamp("date_end", { withTimezone: true }),
	timesUsed: integer("times_used").default(0),
	maxUses: integer("max_uses"),
});

export const directusTranslationsInEnovels = enovels.table("directus_translations", {
	id: uuid().primaryKey(),
	language: varchar({ length: 255 }).notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
});

export const directusUsersInEnovels = enovels.table("directus_users", {
	id: uuid().primaryKey(),
	firstName: varchar("first_name", { length: 50 }),
	lastName: varchar("last_name", { length: 50 }),
	email: varchar({ length: 128 }),
	password: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
	title: varchar({ length: 50 }),
	description: text(),
	tags: json(),
	avatar: uuid(),
	language: varchar({ length: 255 }).default(sql`NULL`),
	tfaSecret: varchar("tfa_secret", { length: 255 }),
	status: varchar({ length: 16 }).default("active").notNull(),
	role: uuid().references(() => directusRolesInEnovels.id, { onDelete: "set null" } ),
	token: varchar({ length: 255 }),
	lastAccess: timestamp("last_access", { withTimezone: true }),
	lastPage: varchar("last_page", { length: 255 }),
	provider: varchar({ length: 128 }).default("default").notNull(),
	externalIdentifier: varchar("external_identifier", { length: 255 }),
	authData: json("auth_data"),
	emailNotifications: boolean("email_notifications").default(true),
	appearance: varchar({ length: 255 }),
	themeDark: varchar("theme_dark", { length: 255 }),
	themeLight: varchar("theme_light", { length: 255 }),
	themeLightOverrides: json("theme_light_overrides"),
	themeDarkOverrides: json("theme_dark_overrides"),
}, (table) => [
	unique("directus_users_email_unique").on(table.email),	unique("directus_users_external_identifier_unique").on(table.externalIdentifier),	unique("directus_users_token_unique").on(table.token),]);

export const directusVersionsInEnovels = enovels.table("directus_versions", {
	id: uuid().primaryKey(),
	key: varchar({ length: 64 }).notNull(),
	name: varchar({ length: 255 }),
	collection: varchar({ length: 64 }).notNull().references(() => directusCollectionsInEnovels.collection, { onDelete: "cascade" } ),
	item: varchar({ length: 255 }).notNull(),
	hash: varchar({ length: 255 }),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	dateUpdated: timestamp("date_updated", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id, { onDelete: "set null" } ),
	userUpdated: uuid("user_updated").references(() => directusUsersInEnovels.id),
	delta: json(),
});

export const directusWebhooksInEnovels = enovels.table("directus_webhooks", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	method: varchar({ length: 10 }).default("POST").notNull(),
	url: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 10 }).default("active").notNull(),
	data: boolean().default(true).notNull(),
	actions: varchar({ length: 100 }).notNull(),
	collections: varchar({ length: 255 }).notNull(),
	headers: json(),
	wasActiveBeforeDeprecation: boolean("was_active_before_deprecation").default(false).notNull(),
	migratedFlow: uuid("migrated_flow").references(() => directusFlowsInEnovels.id, { onDelete: "set null" } ),
});

export const itemsInEnovels = enovels.table("items", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	type: varchar({ length: 255 }),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
});

export const itemsAbilitiesInEnovels = enovels.table("items_abilities", {
	id: serial().primaryKey(),
	itemsId: integer("items_id").references(() => itemsInEnovels.id, { onDelete: "set null" } ),
	abilitiesId: integer("abilities_id").references(() => abilitiesInEnovels.id, { onDelete: "set null" } ),
});

export const itemsCharactersInEnovels = enovels.table("items_characters", {
	id: serial().primaryKey(),
	itemsId: integer("items_id").references(() => itemsInEnovels.id, { onDelete: "set null" } ),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
});

export const itemsVideosInEnovels = enovels.table("items_videos", {
	id: serial().primaryKey(),
	itemsId: integer("items_id").references(() => itemsInEnovels.id, { onDelete: "set null" } ),
	videosId: integer("videos_id").references(() => videosInEnovels.id, { onDelete: "set null" } ),
});

export const levelsInEnovels = enovels.table("levels", {
	id: serial().primaryKey(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
	description: text(),
});

export const levelsCharactersInEnovels = enovels.table("levels_characters", {
	id: serial().primaryKey(),
	levelsId: integer("levels_id").references(() => levelsInEnovels.id, { onDelete: "set null" } ),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
});

export const navigationInEnovels = enovels.table("navigation", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	type: varchar({ length: 255 }),
	name: varchar({ length: 255 }),
	url: varchar({ length: 255 }),
	icon: varchar({ length: 255 }),
	description: text(),
	menus: json(),
});

export const pagesInEnovels = enovels.table("pages", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	content: text(),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	information: json(),
	slug: varchar({ length: 255 }),
});

export const placesInEnovels = enovels.table("places", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
});

export const placesCharactersInEnovels = enovels.table("places_characters", {
	id: serial().primaryKey(),
	placesId: integer("places_id").references(() => placesInEnovels.id, { onDelete: "set null" } ),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
});

export const placesItemsInEnovels = enovels.table("places_items", {
	id: serial().primaryKey(),
	placesId: integer("places_id").references(() => placesInEnovels.id, { onDelete: "set null" } ),
	itemsId: integer("items_id").references(() => itemsInEnovels.id, { onDelete: "set null" } ),
});

export const storiesInEnovels = enovels.table("stories", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsersInEnovels.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsersInEnovels.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
});

export const storiesCharactersInEnovels = enovels.table("stories_characters", {
	id: serial().primaryKey(),
	storiesId: integer("stories_id").references(() => storiesInEnovels.id, { onDelete: "set null" } ),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
});

export const storiesTagsInEnovels = enovels.table("stories_tags", {
	id: serial().primaryKey(),
	storiesId: integer("stories_id").references(() => storiesInEnovels.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tagsInEnovels.id, { onDelete: "set null" } ),
});

export const tagsInEnovels = enovels.table("tags", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
});

export const tagsVideosInEnovels = enovels.table("tags_videos", {
	id: serial().primaryKey(),
	tagsId: integer("tags_id").references(() => tagsInEnovels.id, { onDelete: "set null" } ),
	videosId: bigint("videos_id", { mode: 'number' }).references(() => videosInEnovels.id, { onDelete: "set null" } ),
});

export const typesInEnovels = enovels.table("types", {
	id: serial().primaryKey(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
});

export const typesCharactersInEnovels = enovels.table("types_characters", {
	id: serial().primaryKey(),
	typesId: integer("types_id").references(() => typesInEnovels.id, { onDelete: "set null" } ),
	charactersId: integer("characters_id").references(() => charactersInEnovels.id, { onDelete: "set null" } ),
});

export const videosInEnovels = enovels.table("videos", {
	id: serial().primaryKey(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	file: uuid().references(() => directusFilesInEnovels.id, { onDelete: "set null" } ),
	status: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
});

export const wrappersFdwStatsInExtensions = extensions.table("wrappers_fdw_stats", {
	fdwName: text("fdw_name").primaryKey(),
	createTimes: bigint("create_times", { mode: 'number' }),
	rowsIn: bigint("rows_in", { mode: 'number' }),
	rowsOut: bigint("rows_out", { mode: 'number' }),
	bytesIn: bigint("bytes_in", { mode: 'number' }),
	bytesOut: bigint("bytes_out", { mode: 'number' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
});

export const hdbActionLogInHdbCatalog = hdbCatalog.table("hdb_action_log", {
	id: uuid().default(sql`hdb_catalog.gen_hasura_uuid()`).primaryKey(),
	actionName: text("action_name"),
	inputPayload: jsonb("input_payload").notNull(),
	requestHeaders: jsonb("request_headers").notNull(),
	sessionVariables: jsonb("session_variables").notNull(),
	responsePayload: jsonb("response_payload"),
	errors: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	responseReceivedAt: timestamp("response_received_at", { withTimezone: true }),
	status: text().notNull(),
}, (table) => [
check("hdb_action_log_status_check", sql`(status = ANY (ARRAY['created'::text, 'processing'::text, 'completed'::text, 'error'::text]))`),]);

export const hdbCronEventInvocationLogsInHdbCatalog = hdbCatalog.table("hdb_cron_event_invocation_logs", {
	id: text().default(sql`hdb_catalog.gen_hasura_uuid()`).primaryKey(),
	eventId: text("event_id").references(() => hdbCronEventsInHdbCatalog.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	status: integer(),
	request: json(),
	response: json(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
	index("hdb_cron_event_invocation_event_id").using("btree", table.eventId.asc().nullsLast()),
]);

export const hdbCronEventsInHdbCatalog = hdbCatalog.table("hdb_cron_events", {
	id: text().default(sql`hdb_catalog.gen_hasura_uuid()`).primaryKey(),
	triggerName: text("trigger_name").notNull(),
	scheduledTime: timestamp("scheduled_time", { withTimezone: true }).notNull(),
	status: text().default("scheduled").notNull(),
	tries: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
}, (table) => [
	index("hdb_cron_event_status").using("btree", table.status.asc().nullsLast()),
	uniqueIndex("hdb_cron_events_unique_scheduled").using("btree", table.triggerName.asc().nullsLast(), table.scheduledTime.asc().nullsLast()).where(sql`(status = 'scheduled'::text)`),
check("valid_status", sql`(status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text]))`),]);

export const hdbMetadataInHdbCatalog = hdbCatalog.table("hdb_metadata", {
	id: integer().primaryKey(),
	metadata: json().notNull(),
	resourceVersion: integer("resource_version").default(1).notNull(),
}, (table) => [
	unique("hdb_metadata_resource_version_key").on(table.resourceVersion),]);

export const hdbScheduledEventInvocationLogsInHdbCatalog = hdbCatalog.table("hdb_scheduled_event_invocation_logs", {
	id: text().default(sql`hdb_catalog.gen_hasura_uuid()`).primaryKey(),
	eventId: text("event_id").references(() => hdbScheduledEventsInHdbCatalog.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	status: integer(),
	request: json(),
	response: json(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const hdbScheduledEventsInHdbCatalog = hdbCatalog.table("hdb_scheduled_events", {
	id: text().default(sql`hdb_catalog.gen_hasura_uuid()`).primaryKey(),
	webhookConf: json("webhook_conf").notNull(),
	scheduledTime: timestamp("scheduled_time", { withTimezone: true }).notNull(),
	retryConf: json("retry_conf"),
	payload: json(),
	headerConf: json("header_conf"),
	status: text().default("scheduled").notNull(),
	tries: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
	comment: text(),
}, (table) => [
	index("hdb_scheduled_event_status").using("btree", table.status.asc().nullsLast()),
check("valid_status", sql`(status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text]))`),]);

export const hdbSchemaNotificationsInHdbCatalog = hdbCatalog.table("hdb_schema_notifications", {
	id: integer().primaryKey(),
	notification: json().notNull(),
	resourceVersion: integer("resource_version").default(1).notNull(),
	instanceId: uuid("instance_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
}, (table) => [
check("hdb_schema_notifications_id_check", sql`(id = 1)`),]);

export const hdbVersionInHdbCatalog = hdbCatalog.table("hdb_version", {
	hasuraUuid: uuid("hasura_uuid").default(sql`hdb_catalog.gen_hasura_uuid()`).primaryKey(),
	version: text().notNull(),
	upgradedOn: timestamp("upgraded_on", { withTimezone: true }).notNull(),
	cliState: jsonb("cli_state").default({}).notNull(),
	consoleState: jsonb("console_state").default({}).notNull(),
	eeClientId: text("ee_client_id"),
	eeClientSecret: text("ee_client_secret"),
}, (table) => [
	uniqueIndex("hdb_version_one_row").using("btree", sql`(version IS NOT NULL)`),
]);

export const migrationsInMeevendure = meevendure.table("migrations", {
	id: serial().primaryKey(),
	timestamp: bigint({ mode: 'number' }).notNull(),
	name: varchar().notNull(),
});

export const httpResponseInNet = net.table("_http_response", {
	id: bigint({ mode: 'number' }),
	statusCode: integer("status_code"),
	contentType: text("content_type"),
	headers: jsonb(),
	content: text(),
	timedOut: boolean("timed_out"),
	errorMsg: text("error_msg"),
	created: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => [
	index("_http_response_created_idx").using("btree", table.created.asc().nullsLast()),
]);

export const httpRequestQueueInNet = net.table("http_request_queue", {
	id: bigserial({ mode: 'number' }).notNull(),
	method: customType({ dataType: () => 'net.http_method' })().notNull(),
	url: text().notNull(),
	headers: jsonb().notNull(),
	body: customType({ dataType: () => 'bytea' })(),
	timeoutMilliseconds: integer("timeout_milliseconds").notNull(),
});

export const metaInPgmq = pgmq.table("meta", {
	queueName: varchar("queue_name").notNull(),
	isPartitioned: boolean("is_partitioned").notNull(),
	isUnlogged: boolean("is_unlogged").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => [
	unique("meta_queue_name_key").on(table.queueName),]);

export const keyInPgsodium = pgsodium.table("key", {
	id: uuid().defaultRandom().primaryKey(),
	status: keyStatusInPgsodium().default("valid"),
	created: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expires: timestamp({ withTimezone: true }),
	keyType: keyTypeInPgsodium("key_type"),
	keyId: bigserial("key_id", { mode: 'number' }),
	keyContext: customType({ dataType: () => 'bytea' })("key_context").default("'\\x7067736f6469756d'"),
	name: text(),
	associatedData: text("associated_data").default("associated"),
	rawKey: customType({ dataType: () => 'bytea' })("raw_key"),
	rawKeyNonce: customType({ dataType: () => 'bytea' })("raw_key_nonce"),
	parentKey: uuid("parent_key"),
	comment: text(),
	userData: text("user_data"),
}, (table) => [
	foreignKey({
		columns: [table.parentKey],
		foreignColumns: [table.id],
		name: "key_parent_key_fkey"
	}),
	uniqueIndex("key_key_id_key_context_key_type_idx").using("btree", table.keyId.asc().nullsLast(), table.keyContext.asc().nullsLast(), table.keyType.asc().nullsLast()),
	index("key_status_idx").using("btree", table.status.asc().nullsLast()).where(sql`(status = ANY (ARRAY['valid'::pgsodium.key_status, 'default'::pgsodium.key_status]))`),
	uniqueIndex("key_status_idx1").using("btree", table.status.asc().nullsLast()).where(sql`(status = 'default'::pgsodium.key_status)`),
	unique("pgsodium_key_unique_name").on(table.name),check("key_key_context_check", sql`(length(key_context) = 8)`),check("pgsodium_raw", sql`
CASE
    WHEN (raw_key IS NOT NULL) THEN ((key_id IS NULL) AND (key_context IS NULL) AND (parent_key IS NOT NULL))
    ELSE ((key_id IS NOT NULL) AND (key_context IS NOT NULL) AND (parent_key IS NULL))
END`),]);

export const aboutDepartmentsArticles = pgTable.withRLS("about_departments_articles", {
	id: serial().primaryKey(),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
});

export const aboutDepartmentsPages = pgTable.withRLS("about_departments_pages", {
	id: serial().primaryKey(),
	pagesId: integer("pages_id").references(() => pages.id, { onDelete: "set null" } ),
});

export const aboutDepartmentsPlatform = pgTable.withRLS("about_departments_platform", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
});

export const address = pgTable.withRLS("address", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	type: json(),
	address: text(),
	address2: varchar({ length: 255 }),
	postalcode: varchar({ length: 255 }),
	firstName: varchar({ length: 255 }),
	lastName: varchar({ length: 255 }),
	company: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	telephone: varchar({ length: 255 }),
	format: varchar({ length: 255 }),
	user: varchar({ length: 255 }),
});

export const addressCart = pgTable.withRLS("address_cart", {
	id: serial().primaryKey(),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
	cartId: integer("cart_id").references(() => cart.id, { onDelete: "set null" } ),
});

export const addressCities = pgTable.withRLS("address_cities", {
	id: serial().primaryKey(),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const addressCountries = pgTable.withRLS("address_countries", {
	id: serial().primaryKey(),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const addressDirectusUsers = pgTable.withRLS("address_directus_users", {
	id: serial().primaryKey(),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id"),
});

export const advertising = pgTable.withRLS("advertising", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	link: varchar({ length: 255 }),
	startDate: timestamp("start_date"),
	endTime: timestamp("end_time"),
});

export const advertisingFiles = pgTable.withRLS("advertising_files", {
	id: serial().primaryKey(),
	directusFilesId: uuid("directus_files_id"),
});

export const agreements = pgTable.withRLS("agreements", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	created: timestamp({ precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	content: text(),
	name: text(),
	excerpt: text(),
	type: json(),
	referenceId: bigint("reference_id", { mode: 'number' }),
	status: varchar({ length: 255 }),
	updated: timestamp({ withTimezone: true }),
});

export const agreementsDirectusUsers = pgTable.withRLS("agreements_directus_users", {
	id: serial().primaryKey(),
	userId: uuid("user_id"),
});

export const agreementsProducts = pgTable.withRLS("agreements_products", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const aiPrompts = pgTable.withRLS("ai_prompts", {
	id: uuid().primaryKey(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	name: varchar({ length: 255 }),
	status: varchar({ length: 255 }).default("draft"),
	description: text(),
	systemPrompt: text("system_prompt"),
	messages: json(),
}, (table) => [
	index("ai_prompts_name_index").using("btree", table.name.asc().nullsLast()),
	unique("ai_prompts_name_unique").on(table.name),]);

export const announcements = pgTable.withRLS("announcements", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	subject: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	location: json(),
	icon: varchar({ length: 255 }),
	color: varchar({ length: 255 }),
	borderColor: varchar("border_color", { length: 255 }),
});

export const applications = pgTable.withRLS("applications", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	name: varchar({ length: 255 }),
	description: text(),
	url: varchar({ length: 255 }),
	image: uuid(),
	operatingSystems: json("operating_systems"),
	slug: varchar({ length: 255 }),
});

export const articles = pgTable.withRLS("articles", {
	id: serial().primaryKey(),
	name: text(),
	excerpt: text(),
	content: text(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	image: uuid(),
	type: json(),
	isPublic: boolean(),
	stamp: integer(),
	slug: varchar({ length: 255 }),
	author: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const articlesCategories = pgTable.withRLS("articles_categories", {
	id: serial().primaryKey(),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const articlesComments = pgTable.withRLS("articles_comments", {
	id: serial().primaryKey(),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const articlesDepartments = pgTable.withRLS("articles_departments", {
	id: serial().primaryKey(),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const attributes = pgTable.withRLS("attributes", {
	id: serial().primaryKey(),
	defaultLabel: text("default_label"),
	isPublic: boolean(),
	options: json(),
	attributeCode: varchar("attribute_code", { length: 255 }),
});

export const attributesProductTypes = pgTable.withRLS("attributes_product_types", {
	id: serial().primaryKey(),
	attributesId: integer("attributes_id").references(() => attributes.id, { onDelete: "set null" } ),
	productTypesId: integer("product_types_id").references(() => productTypes.id, { onDelete: "set null" } ),
});

export const attributesProducts = pgTable.withRLS("attributes_products", {
	id: serial().primaryKey(),
	attributesId: integer("attributes_id").references(() => attributes.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const auctionLots = pgTable.withRLS("auction_lots", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	productId: bigint("product_id", { mode: 'number' }).references(() => products.id),
	reservePrice: numeric("reserve_price"),
	startAt: timestamp("start_at", { withTimezone: true }),
	endAt: timestamp("end_at", { withTimezone: true }),
	antiSnipeSec: integer("anti_snipe_sec"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	uuid: uuid().defaultRandom(),
});

export const bids = pgTable.withRLS("bids", {
	id: serial().primaryKey(),
	lotId: integer("lot_id").references(() => auctionLots.id, { onDelete: "cascade" } ),
	bidderId: integer("bidder_id"),
	amount: numeric(),
	ts: timestamp({ withTimezone: true }).default(sql`now()`),
	status: text(),
});

export const blockButton = pgTable("block_button", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	type: varchar({ length: 255 }).default(sql`NULL`),
	page: uuid(),
	post: uuid(),
	externalUrl: varchar("external_url", { length: 255 }).default(sql`NULL`),
	label: varchar({ length: 255 }).default(sql`NULL`),
	color: varchar({ length: 255 }).default("primary"),
	variant: varchar({ length: 255 }).default("solid"),
	buttonGroup: uuid("button_group").references(() => blockButtonGroup.id, { onDelete: "set null" } ),
});

export const blockButtonGroup = pgTable("block_button_group", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	alignment: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockColumns = pgTable("block_columns", {
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockColumnsRows = pgTable("block_columns_rows", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	blockColumns: uuid("block_columns").references(() => blockColumns.id),
	title: varchar({ length: 255 }).default(sql`NULL`),
	headline: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	imagePosition: varchar("image_position", { length: 255 }).default(sql`NULL`),
	content: text(),
	buttonGroup: uuid("button_group").references(() => blockButtonGroup.id, { onDelete: "set null" } ),
});

export const blockCta = pgTable("block_cta", {
	content: text(),
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	buttonGroup: uuid("button_group").references(() => blockButtonGroup.id, { onDelete: "set null" } ),
});

export const blockDivider = pgTable("block_divider", {
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockFaqs = pgTable("block_faqs", {
	faqs: json(),
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	alignment: varchar({ length: 255 }).default("center"),
});

export const blockForm = pgTable("block_form", {
	form: uuid().references(() => forms.id),
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockGallery = pgTable("block_gallery", {
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockGalleryFiles = pgTable("block_gallery_files", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	blockGalleryId: uuid("block_gallery_id").references(() => blockGallery.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const blockHero = pgTable("block_hero", {
	content: text(),
	headline: text(),
	id: uuid().primaryKey(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	title: varchar({ length: 255 }).default(sql`NULL`),
	imagePosition: varchar("image_position", { length: 255 }).default(sql`NULL`),
	buttonGroup: uuid("button_group").references(() => blockButtonGroup.id, { onDelete: "set null" } ),
});

export const blockHtml = pgTable("block_html", {
	id: uuid().primaryKey(),
	rawHtml: text("raw_html").default("null"),
});

export const blockLogocloud = pgTable("block_logocloud", {
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockLogocloudLogos = pgTable("block_logocloud_logos", {
	id: uuid().primaryKey(),
	sort: integer(),
	blockLogocloudId: uuid("block_logocloud_id").references(() => blockLogocloud.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const blockQuote = pgTable("block_quote", {
	content: text(),
	id: uuid().primaryKey(),
	subtitle: varchar({ length: 255 }).default(sql`NULL`),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockRichtext = pgTable("block_richtext", {
	content: text(),
	headline: varchar({ length: 255 }).default(sql`NULL`),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	alignment: varchar({ length: 255 }).default("center"),
});

export const blockStepItems = pgTable("block_step_items", {
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	content: text(),
	blockSteps: uuid("block_steps").references(() => blockSteps.id, { onDelete: "set null" } ),
	sort: integer(),
	buttonGroup: uuid("button_group").references(() => blockButtonGroup.id, { onDelete: "set null" } ),
});

export const blockSteps = pgTable("block_steps", {
	alternateImagePosition: boolean("alternate_image_position").default(false).notNull(),
	headline: text(),
	id: uuid().primaryKey(),
	showStepNumbers: boolean("show_step_numbers").default(true),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockTeam = pgTable("block_team", {
	content: text(),
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockTestimonialSliderItems = pgTable("block_testimonial_slider_items", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	blockTestimonialSliderId: uuid("block_testimonial_slider_id").references(() => blockTestimonials.id, { onDelete: "set null" } ),
	testimonialsId: uuid("testimonials_id").references(() => testimonials.id, { onDelete: "set null" } ),
});

export const blockTestimonials = pgTable("block_testimonials", {
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const blockVideo = pgTable("block_video", {
	headline: text(),
	id: uuid().primaryKey(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	type: varchar({ length: 255 }).default(sql`NULL`),
	videoFile: uuid("video_file").references(() => directusFiles.id, { onDelete: "set null" } ),
	videoUrl: varchar("video_url", { length: 255 }).default(sql`NULL`),
});

export const brands = pgTable.withRLS("brands", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	code: text(),
	name: text(),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const brandsCategories = pgTable.withRLS("brands_categories", {
	id: serial().primaryKey(),
	brandsId: bigint("brands_id", { mode: 'number' }).references(() => brands.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const brandsDepartments = pgTable.withRLS("brands_departments", {
	id: serial().primaryKey(),
	brandsId: bigint("brands_id", { mode: 'number' }).references(() => brands.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const brandsManufacturer = pgTable.withRLS("brands_manufacturer", {
	id: serial().primaryKey(),
	brandsId: bigint("brands_id", { mode: 'number' }).references(() => brands.id, { onDelete: "set null" } ),
	manufacturerId: bigint("manufacturer_id", { mode: 'number' }).references(() => manufacturer.id, { onDelete: "set null" } ),
});

export const brandsProducts = pgTable.withRLS("brands_products", {
	id: serial().primaryKey(),
	brandsId: bigint("brands_id", { mode: 'number' }).references(() => brands.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const brandsShorts = pgTable.withRLS("brands_shorts", {
	id: serial().primaryKey(),
	brandsId: bigint("brands_id", { mode: 'number' }).references(() => brands.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const buyagain = pgTable.withRLS("buyagain", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
});

export const calendar = pgTable.withRLS("calendar", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }),
	day: integer(),
	month: json(),
	year: integer(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	status: boolean(),
	description: text(),
	favorite: boolean(),
	facebookId: varchar("facebook_id", { length: 255 }),
	googleId: varchar("google_id", { length: 255 }),
	appointment: json(),
});

export const calendarComments = pgTable.withRLS("calendar_comments", {
	id: serial().primaryKey(),
	calendarId: integer("calendar_id").references(() => calendar.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const calendarDirectusUsers = pgTable.withRLS("calendar_directus_users", {
	id: serial().primaryKey(),
	calendarId: integer("calendar_id").references(() => calendar.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const calendarEvents = pgTable.withRLS("calendar_events", {
	id: serial().primaryKey(),
	calendarId: integer("calendar_id").references(() => calendar.id, { onDelete: "set null" } ),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
});

export const calendarIntegrations = pgTable.withRLS("calendar_integrations", {
	id: serial().primaryKey(),
	calendarId: integer("calendar_id").references(() => calendar.id, { onDelete: "set null" } ),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
});

export const calendarLists = pgTable.withRLS("calendar_lists", {
	id: serial().primaryKey(),
	calendarId: integer("calendar_id").references(() => calendar.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const careers = pgTable.withRLS("careers", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	url: varchar({ length: 255 }),
	description: text(),
	type: varchar({ length: 255 }),
	image: uuid(),
	degreeLevel: varchar("degree_level", { length: 255 }),
	experience: varchar({ length: 255 }),
});

export const cart = pgTable.withRLS("cart", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	sessionId: uuid("session_id"),
	totalPrice: real("total_price"),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	status: varchar({ length: 255 }),
	subtotal: integer(),
	taxAmount: integer("tax_amount"),
	shippingAmount: integer("shipping_amount"),
	discountAmount: integer("discount_amount"),
	total: integer(),
	currency: varchar({ length: 255 }),
	couponCode: varchar("coupon_code", { length: 255 }),
});

export const cartCartItems = pgTable.withRLS("cart_cart_items", {
	id: serial().primaryKey(),
	cartId: integer("cart_id").references(() => cart.id, { onDelete: "set null" } ),
	cartItemsId: integer("cart_items_id").references(() => cartItems.id, { onDelete: "set null" } ),
});

export const cartItems = pgTable.withRLS("cart_items", {
	id: serial().primaryKey(),
	quantity: integer(),
	metadata: json(),
	products: bigint({ mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	cart: integer().references(() => cart.id, { onDelete: "set null" } ),
	productId: varchar("product_id", { length: 255 }),
	price: integer(),
	total: integer(),
	variantId: varchar("variant_id", { length: 255 }),
	variant: varchar({ length: 255 }),
});

export const cartProducts = pgTable.withRLS("cart_products", {
	id: serial().primaryKey(),
	cartId: integer("cart_id").references(() => cart.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const categories = pgTable.withRLS("categories", {
	id: serial().primaryKey(),
	name: text(),
	description: text(),
	content: text(),
	image: uuid(),
	menus: json(),
	uid: varchar({ length: 255 }),
	color: varchar({ length: 255 }),
	colortext: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
	headline: text(),
	seo: uuid().references(() => seo.id, { onDelete: "set null" } ),
	sort: integer(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const categoriesDepartments = pgTable.withRLS("categories_departments", {
	id: serial().primaryKey(),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const categoriesPostgresstores = pgTable.withRLS("categories_postgresstores", {
	id: serial().primaryKey(),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
	postgresstoresId: integer("postgresstores_id").references(() => postgresstores.id, { onDelete: "set null" } ),
});

export const categoriesShorts = pgTable.withRLS("categories_shorts", {
	id: serial().primaryKey(),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const chartEntries = pgTable.withRLS("chart_entries", {
	id: serial().primaryKey(),
	chartId: integer("chart_id").references(() => charts.id, { onDelete: "set null" } ),
	productId: bigint("product_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	position: integer(),
	lastPosition: integer("last_position"),
	streams: integer(),
	sales: integer(),
	score: real(),
	thisWeek: varchar("this_week", { length: 255 }),
	lastWeek: varchar("last_week", { length: 255 }),
	peakPosition: varchar("peak_position", { length: 255 }),
	weeksOnChart: varchar("weeks_on_chart", { length: 255 }),
	award: varchar({ length: 255 }),
	color: varchar({ length: 255 }),
	trend: varchar({ length: 255 }),
});

export const charts = pgTable.withRLS("charts", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	icon: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	date: date(),
});

export const chartsDepartments = pgTable.withRLS("charts_departments", {
	id: serial().primaryKey(),
	chartsId: integer("charts_id").references(() => charts.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const chartsProducts = pgTable.withRLS("charts_products", {
	id: serial().primaryKey(),
	chartsId: integer("charts_id").references(() => charts.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const chartsRadios = pgTable.withRLS("charts_radios", {
	id: serial().primaryKey(),
	chartsId: integer("charts_id").references(() => charts.id, { onDelete: "set null" } ),
	radiosId: integer("radios_id").references(() => radios.id, { onDelete: "set null" } ),
});

export const chat = pgTable.withRLS("chat", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	message: text(),
});

export const circlesDirectusUsers = pgTable.withRLS("circles_directus_users", {
	id: serial().primaryKey(),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const circlesPosts = pgTable.withRLS("circles_posts", {
	id: serial().primaryKey(),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const circlesProducts = pgTable.withRLS("circles_products", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const cities = pgTable.withRLS("cities", {
	id: serial().primaryKey(),
	name: text().notNull(),
	description: text(),
	postalCode: text(),
	image: uuid(),
	longitude: varchar({ length: 255 }),
	latitude: varchar({ length: 255 }),
	languagenames: text(),
});

export const citiesCountries = pgTable.withRLS("cities_countries", {
	id: serial().primaryKey(),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id"),
});

export const citiesStates = pgTable.withRLS("cities_states", {
	id: serial().primaryKey(),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const collections = pgTable.withRLS("collections", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	name: text(),
	description: text(),
	image: uuid(),
	type: json(),
});

export const collectionsBrands = pgTable.withRLS("collections_brands", {
	id: serial().primaryKey(),
	collectionsId: bigint("collections_id", { mode: 'number' }).references(() => collections.id, { onDelete: "set null" } ),
	brandsId: bigint("brands_id", { mode: 'number' }).references(() => brands.id, { onDelete: "set null" } ),
});

export const collectionsProducts = pgTable.withRLS("collections_products", {
	id: serial().primaryKey(),
	collectionsId: bigint("collections_id", { mode: 'number' }).references(() => collections.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const collectionsSpaces = pgTable.withRLS("collections_spaces", {
	id: serial().primaryKey(),
	collectionsId: bigint("collections_id", { mode: 'number' }).references(() => collections.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const colors = pgTable.withRLS("colors", {
	id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
	name: text(),
	hex: text().notNull(),
	red: smallint(),
	green: smallint(),
	blue: smallint(),
	hue: smallint(),
	satHsl: smallint("sat_hsl"),
	lightHsl: smallint("light_hsl"),
	satHsv: smallint("sat_hsv"),
	valHsv: smallint("val_hsv"),
	source: colorSource(),
});

export const comments = pgTable.withRLS("comments", {
	id: serial().primaryKey(),
	response: text(),
	media: uuid(),
	name: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	helpful: boolean(),
	type: varchar({ length: 255 }),
	ratingsBreakdown: varchar("ratings_breakdown", { length: 255 }),
	averageRating: varchar("average_rating", { length: 255 }),
	nickname: varchar({ length: 255 }),
	summary: text(),
	reviewCount: integer("review_count"),
	contextType: varchar("context_type", { length: 255 }),
	messageType: varchar("message_type", { length: 255 }),
	isLive: boolean("is_live"),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const commentsDirectusUsers = pgTable.withRLS("comments_directus_users", {
	id: serial().primaryKey(),
	commentId: integer("comment_id").references(() => comments.id, { onDelete: "set null" } ),
	userId: uuid("user_id"),
});

export const commentsProducts = pgTable.withRLS("comments_products", {
	id: serial().primaryKey(),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const commentsReactions = pgTable.withRLS("comments_reactions", {
	id: serial().primaryKey(),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
	reactionsId: integer("reactions_id").references(() => reactions.id, { onDelete: "set null" } ),
});

export const commentsShorts = pgTable.withRLS("comments_shorts", {
	id: serial().primaryKey(),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const connections = pgTable.withRLS("connections", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: varchar({ length: 255 }),
	connectionType: varchar("connection_type", { length: 255 }),
	userA: varchar("user_a", { length: 255 }),
	recipient: varchar({ length: 255 }),
});

export const connectionsDirectusUsers = pgTable.withRLS("connections_directus_users", {
	id: serial().primaryKey(),
	connectionsId: integer("connections_id").references(() => connections.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id"),
});

export const contacts = pgTable("contacts", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("active"),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	firstName: varchar("first_name", { length: 255 }).default(sql`NULL`),
	lastName: varchar("last_name", { length: 255 }).default(sql`NULL`),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	email: varchar({ length: 255 }).default(sql`NULL`),
	phone: varchar({ length: 255 }).default(sql`NULL`),
	jobTitle: varchar("job_title", { length: 255 }).default(sql`NULL`),
	contactNotes: text("contact_notes"),
}, (table) => [
	unique("contacts_user_unique").on(table.user),]);

export const conversations = pgTable("conversations", {
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	visitorId: varchar("visitor_id", { length: 36 }).default(sql`NULL`),
	item: varchar({ length: 255 }).default(sql`NULL`),
	collection: varchar({ length: 255 }).default(sql`NULL`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	userUpdated: uuid("user_updated").references(() => directusUsers.id, { onDelete: "set null" } ),
	organization: uuid().references(() => organizations.id, { onDelete: "set null" } ),
});

export const countries = pgTable.withRLS("countries", {
	id: integer().primaryKey(),
	name: varchar({ length: 100 }),
	iso3: char({ length: 3 }),
	iso2: char({ length: 2 }),
	phonecode: varchar({ length: 255 }),
	capital: varchar({ length: 255 }),
	tld: varchar({ length: 255 }),
	native: varchar({ length: 255 }),
	translations: text(),
	latitude: numeric({ precision: 10, scale: 8 }),
	longitude: numeric({ precision: 11, scale: 8 }),
	emoji: varchar({ length: 191 }),
	emojiU: varchar({ length: 191 }),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
	flag: integer().default(1).notNull(),
	wikiDataId: varchar({ length: 255 }),
	region: json(),
});

export const countriesCurrency = pgTable.withRLS("countries_currency", {
	id: serial().primaryKey(),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
	currencyId: integer("currency_id").references(() => currency.id, { onDelete: "set null" } ),
});

export const countriesTimezones = pgTable.withRLS("countries_timezones", {
	id: serial().primaryKey(),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
	timezonesId: integer("timezones_id").references(() => timezones.id, { onDelete: "set null" } ),
});

export const couponsProducts = pgTable.withRLS("coupons_products", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const creditMemos = pgTable.withRLS("credit_memos", {
	id: serial().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	adjustment: integer(),
	adjustmentNegative: integer("adjustment_negative"),
	adjustmentPositive: integer("adjustment_positive"),
	baseAdjustment: integer("base_adjustment"),
	baseAdjustmentNegative: integer("base_adjustment_negative"),
	baseAdjustmentPositive: integer("base_adjustment_positive"),
	baseCurrencyCode: text("base_currency_code"),
	baseDiscountAmount: integer("base_discount_amount"),
	baseGrandTotal: integer("base_grand_total"),
	baseDiscountTaxCompensationAmount: integer("base_discount_tax_compensation_amount"),
	baseShippingAmount: integer("base_shipping_amount"),
	baseShippingDiscountTaxCompensationAmnt: integer("base_shipping_discount_tax_compensation_amnt"),
	baseShippingInclTax: integer("base_shipping_incl_tax"),
	baseShippingTaxAmount: integer("base_shipping_tax_amount"),
	baseSubtotal: integer("base_subtotal"),
	baseSubtotalInclTax: integer("base_subtotal_incl_tax"),
	baseTaxAmount: integer("base_tax_amount"),
	baseToGlobalRate: integer("base_to_global_rate"),
	baseToOrderRate: integer("base_to_order_rate"),
	creditmemoStatus: integer("creditmemo_status"),
	discountAmount: integer("discount_amount"),
	discountDescription: text("discount_description"),
	emailSent: integer("email_sent"),
	entityId: integer("entity_id"),
	globalCurrencyCode: text("global_currency_code"),
	grandTotal: integer("grand_total"),
	discountTaxCompensationAmount: integer("discount_tax_compensation_amount"),
	incrementId: text("increment_id"),
	invoiceId: integer("invoice_id"),
	orderCurrencyCode: text("order_currency_code"),
	shippingAmount: integer("shipping_amount"),
	shippingDiscountTaxCompensationAmount: integer("shipping_discount_tax_compensation_amount"),
	shippingInclTax: integer("shipping_incl_tax"),
	shippingTaxAmount: integer("shipping_tax_amount"),
	state: integer(),
	storeCurrencyCode: text("store_currency_code"),
	storeId: integer("store_id"),
	storeToBaseRate: integer("store_to_base_rate"),
	storeToOrderRate: integer("store_to_order_rate"),
	subtotal: integer(),
	subtotalInclTax: integer("subtotal_incl_tax"),
	taxAmount: integer("tax_amount"),
	user: uuid(),
});

export const crossSellProducts = pgTable.withRLS("cross_sell_products", {
	id: serial().primaryKey(),
	sort: integer(),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const crossSellProductsProducts = pgTable.withRLS("cross_sell_products_products", {
	id: serial().primaryKey(),
	crossSellProductsId: integer("cross_sell_products_id").references(() => crossSellProducts.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const currenciesCountries = pgTable.withRLS("currencies_countries", {
	id: serial().primaryKey(),
	countriesId: integer("countries_id"),
});

export const currency = pgTable.withRLS("currency", {
	id: serial().primaryKey(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	code: varchar({ length: 255 }),
	symbol: varchar({ length: 255 }),
});

export const currencyDepartments = pgTable.withRLS("currency_departments", {
	id: serial().primaryKey(),
	currencyId: integer("currency_id").references(() => currency.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const departmentChannels = pgTable.withRLS("department_channels", {
	id: serial().primaryKey(),
	departmentId: integer("department_id"),
	rulesJson: jsonb("rules_json"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const departments = pgTable.withRLS("departments", {
	id: serial().primaryKey(),
	name: text().notNull(),
	description: text(),
	content: text(),
	color: varchar({ length: 255 }),
	image: uuid(),
	colortext: varchar({ length: 255 }),
	menus: json(),
	callouts: json(),
	slug: varchar({ length: 255 }),
	active: varchar({ length: 255 }),
	relativeId: varchar("relative_id", { length: 255 }),
	type: varchar({ length: 255 }),
	customDomain: varchar("custom_domain", { length: 255 }),
});

export const departmentsCategories = pgTable.withRLS("departments_categories", {
	id: serial().primaryKey(),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const departmentsCollections = pgTable.withRLS("departments_collections", {
	id: serial().primaryKey(),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
	collectionsId: bigint("collections_id", { mode: 'number' }).references(() => collections.id, { onDelete: "set null" } ),
});

export const departmentsProducts = pgTable.withRLS("departments_products", {
	id: serial().primaryKey(),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const departmentsShorts = pgTable.withRLS("departments_shorts", {
	id: serial().primaryKey(),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const departmentsShowcases = pgTable.withRLS("departments_showcases", {
	id: serial().primaryKey(),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
	showcasesId: integer("showcases_id").references(() => showcases.id, { onDelete: "set null" } ),
});

export const digiboard = pgTable.withRLS("digiboard", {
	id: serial().primaryKey(),
	name: text().notNull(),
	board: text(),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	image: uuid(),
});

export const digiboardDirectusUsers = pgTable.withRLS("digiboard_directus_users", {
	id: serial().primaryKey(),
	directusUsersId: uuid("directus_users_id"),
});

export const directusAccess = pgTable.withRLS("directus_access", {
	id: uuid().primaryKey(),
	role: uuid().references(() => directusRoles.id, { onDelete: "cascade" } ),
	user: uuid().references(() => directusUsers.id, { onDelete: "cascade" } ),
	policy: uuid().notNull().references(() => directusPolicies.id, { onDelete: "cascade" } ),
	sort: integer(),
});

export const directusActivity = pgTable.withRLS("directus_activity", {
	id: serial().primaryKey(),
	action: varchar({ length: 45 }).notNull(),
	user: uuid(),
	timestamp: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	ip: varchar({ length: 50 }),
	userAgent: text("user_agent"),
	collection: varchar({ length: 64 }).notNull(),
	item: varchar({ length: 255 }).notNull(),
	origin: varchar({ length: 255 }),
}, (table) => [
	index("directus_activity_timestamp_index").using("btree", table.timestamp.asc().nullsLast()),
]);

export const directusCollections = pgTable.withRLS("directus_collections", {
	collection: varchar({ length: 64 }).primaryKey(),
	icon: varchar({ length: 64 }),
	note: text(),
	displayTemplate: varchar("display_template", { length: 255 }),
	hidden: boolean().default(false).notNull(),
	singleton: boolean().default(false).notNull(),
	translations: json(),
	archiveField: varchar("archive_field", { length: 64 }),
	archiveAppFilter: boolean("archive_app_filter").default(true).notNull(),
	archiveValue: varchar("archive_value", { length: 255 }),
	unarchiveValue: varchar("unarchive_value", { length: 255 }),
	sortField: varchar("sort_field", { length: 64 }),
	accountability: varchar({ length: 255 }).default("all"),
	color: varchar({ length: 255 }),
	itemDuplicationFields: json("item_duplication_fields"),
	sort: integer(),
	group: varchar({ length: 64 }),
	collapse: varchar({ length: 255 }).default("open").notNull(),
	previewUrl: varchar("preview_url", { length: 255 }),
	versioning: boolean().default(false).notNull(),
	status: varchar({ length: 255 }).default("active").notNull(),
	autosaveRevisionInterval: real("autosave_revision_interval"),
}, (table) => [
	foreignKey({
		columns: [table.group],
		foreignColumns: [table.collection],
		name: "directus_collections_group_foreign"
	}),
]);

export const directusComments = pgTable.withRLS("directus_comments", {
	id: uuid().primaryKey(),
	collection: varchar({ length: 64 }).notNull(),
	item: varchar({ length: 255 }).notNull(),
	comment: text().notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	dateUpdated: timestamp("date_updated", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
});

export const directusDashboards = pgTable.withRLS("directus_dashboards", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 64 }).default("dashboard").notNull(),
	note: text(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	color: varchar({ length: 255 }),
});

export const directusDeploymentProjects = pgTable("directus_deployment_projects", {
	id: uuid().primaryKey(),
	deployment: uuid().notNull().references(() => directusDeployments.id, { onDelete: "cascade" } ),
	externalId: varchar("external_id", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	url: varchar({ length: 255 }),
	framework: varchar({ length: 255 }),
	deployable: boolean().default(true).notNull(),
}, (table) => [
	unique("directus_deployment_projects_deployment_external_id_unique").on(table.deployment, table.externalId),]);

export const directusDeploymentRuns = pgTable("directus_deployment_runs", {
	id: uuid().primaryKey(),
	project: uuid().notNull().references(() => directusDeploymentProjects.id, { onDelete: "cascade" } ),
	externalId: varchar("external_id", { length: 255 }).notNull(),
	target: varchar({ length: 255 }).notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	status: varchar({ length: 255 }),
	url: varchar({ length: 255 }),
	startedAt: timestamp("started_at", { withTimezone: true }),
	completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const directusDeployments = pgTable("directus_deployments", {
	id: uuid().primaryKey(),
	provider: varchar({ length: 255 }).notNull(),
	credentials: text(),
	options: text(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	webhookIds: json("webhook_ids"),
	webhookSecret: varchar("webhook_secret", { length: 255 }),
	lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
}, (table) => [
	unique("directus_deployments_provider_unique").on(table.provider),]);

export const directusExtensions = pgTable.withRLS("directus_extensions", {
	enabled: boolean().default(true).notNull(),
	id: uuid().primaryKey(),
	folder: varchar({ length: 255 }).notNull(),
	source: varchar({ length: 255 }).notNull(),
	bundle: uuid(),
});

export const directusFields = pgTable.withRLS("directus_fields", {
	id: serial().primaryKey(),
	collection: varchar({ length: 64 }).notNull(),
	field: varchar({ length: 64 }).notNull(),
	special: varchar({ length: 64 }),
	interface: varchar({ length: 64 }),
	options: json(),
	display: varchar({ length: 64 }),
	displayOptions: json("display_options"),
	readonly: boolean().default(false).notNull(),
	hidden: boolean().default(false).notNull(),
	sort: integer(),
	width: varchar({ length: 30 }).default("full"),
	translations: json(),
	note: text(),
	conditions: json(),
	required: boolean().default(false),
	group: varchar({ length: 64 }),
	validation: json(),
	validationMessage: text("validation_message"),
	searchable: boolean().default(true).notNull(),
});

export const directusFiles = pgTable.withRLS("directus_files", {
	id: uuid().primaryKey(),
	storage: varchar({ length: 255 }).notNull(),
	filenameDisk: varchar("filename_disk", { length: 255 }),
	filenameDownload: varchar("filename_download", { length: 255 }).notNull(),
	title: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	folder: uuid().references(() => directusFolders.id, { onDelete: "set null" } ),
	uploadedBy: uuid("uploaded_by").references(() => directusUsers.id),
	createdOn: timestamp("created_on", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	modifiedBy: uuid("modified_by").references(() => directusUsers.id),
	modifiedOn: timestamp("modified_on", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	charset: varchar({ length: 50 }),
	filesize: bigint({ mode: 'number' }),
	width: integer(),
	height: integer(),
	duration: integer(),
	embed: varchar({ length: 200 }),
	description: text(),
	location: text(),
	tags: text(),
	metadata: json(),
	focalPointX: integer("focal_point_x"),
	focalPointY: integer("focal_point_y"),
	tusId: varchar("tus_id", { length: 64 }),
	tusData: json("tus_data"),
	uploadedOn: timestamp("uploaded_on", { withTimezone: true }),
});

export const directusFlows = pgTable.withRLS("directus_flows", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 64 }),
	color: varchar({ length: 255 }),
	description: text(),
	status: varchar({ length: 255 }).default("active").notNull(),
	trigger: varchar({ length: 255 }),
	accountability: varchar({ length: 255 }).default("all"),
	options: json(),
	operation: uuid(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
}, (table) => [
	unique("directus_flows_operation_unique").on(table.operation),]);

export const directusFolders = pgTable.withRLS("directus_folders", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	parent: uuid(),
}, (table) => [
	foreignKey({
		columns: [table.parent],
		foreignColumns: [table.id],
		name: "directus_folders_parent_foreign"
	}),
]);

export const directusMigrations = pgTable.withRLS("directus_migrations", {
	version: varchar({ length: 255 }).primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	timestamp: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

export const directusNotifications = pgTable.withRLS("directus_notifications", {
	id: serial().primaryKey(),
	timestamp: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	status: varchar({ length: 255 }).default("inbox"),
	recipient: uuid().notNull().references(() => directusUsers.id, { onDelete: "cascade" } ),
	sender: uuid().references(() => directusUsers.id),
	subject: varchar({ length: 255 }).notNull(),
	message: text(),
	collection: varchar({ length: 64 }),
	item: varchar({ length: 255 }),
});

export const directusOauthClients = pgTable("directus_oauth_clients", {
	clientId: varchar("client_id", { length: 255 }).primaryKey(),
	clientName: varchar("client_name", { length: 200 }).notNull(),
	redirectUris: json("redirect_uris").notNull(),
	grantTypes: json("grant_types").notNull(),
	tokenEndpointAuthMethod: varchar("token_endpoint_auth_method", { length: 255 }).default("none").notNull(),
	clientSecretHash: varchar("client_secret_hash", { length: 64 }),
	registrationType: varchar("registration_type", { length: 10 }).default("dcr").notNull(),
	clientUri: text("client_uri"),
	logoUri: text("logo_uri"),
	tosUri: text("tos_uri"),
	policyUri: text("policy_uri"),
	metadataFetchedAt: timestamp("metadata_fetched_at", { withTimezone: true }),
	metadataExpiresAt: timestamp("metadata_expires_at", { withTimezone: true }),
	metadataEtag: varchar("metadata_etag", { length: 255 }),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("directus_oauth_clients_date_created_index").using("btree", table.dateCreated.asc().nullsLast()),
]);

export const directusOauthCodes = pgTable("directus_oauth_codes", {
	id: uuid().primaryKey(),
	codeHash: varchar("code_hash", { length: 64 }).notNull(),
	client: varchar({ length: 255 }).notNull().references(() => directusOauthClients.clientId, { onDelete: "cascade" } ),
	user: uuid().notNull().references(() => directusUsers.id, { onDelete: "cascade" } ),
	redirectUri: varchar("redirect_uri", { length: 255 }).notNull(),
	resource: varchar({ length: 255 }).notNull(),
	codeChallenge: varchar("code_challenge", { length: 128 }).notNull(),
	codeChallengeMethod: varchar("code_challenge_method", { length: 10 }).notNull(),
	scope: varchar({ length: 255 }),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	usedAt: timestamp("used_at", { withTimezone: true }),
}, (table) => [
	index("directus_oauth_codes_expires_at_index").using("btree", table.expiresAt.asc().nullsLast()),
	index("directus_oauth_codes_used_at_index").using("btree", table.usedAt.asc().nullsLast()),
	unique("directus_oauth_codes_code_hash_unique").on(table.codeHash),]);

export const directusOauthConsents = pgTable("directus_oauth_consents", {
	id: uuid().primaryKey(),
	user: uuid().notNull().references(() => directusUsers.id, { onDelete: "cascade" } ),
	client: varchar({ length: 255 }).notNull().references(() => directusOauthClients.clientId, { onDelete: "cascade" } ),
	redirectUri: varchar("redirect_uri", { length: 255 }).notNull(),
	scope: varchar({ length: 255 }),
	dateCreated: timestamp("date_created", { withTimezone: true }).notNull(),
	dateUpdated: timestamp("date_updated", { withTimezone: true }).notNull(),
}, (table) => [
	index("directus_oauth_consents_client_index").using("btree", table.client.asc().nullsLast()),
	unique("directus_oauth_consents_user_client_redirect_uri_unique").on(table.user, table.client, table.redirectUri),]);

export const directusOauthTokens = pgTable("directus_oauth_tokens", {
	id: uuid().primaryKey(),
	client: varchar({ length: 255 }).notNull().references(() => directusOauthClients.clientId, { onDelete: "cascade" } ),
	user: uuid().notNull().references(() => directusUsers.id, { onDelete: "cascade" } ),
	session: varchar({ length: 64 }).notNull(),
	previousSession: varchar("previous_session", { length: 64 }),
	resource: varchar({ length: 255 }).notNull(),
	codeHash: varchar("code_hash", { length: 64 }).notNull(),
	scope: varchar({ length: 255 }),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }).notNull(),
}, (table) => [
	index("directus_oauth_tokens_code_hash_index").using("btree", table.codeHash.asc().nullsLast()),
	index("directus_oauth_tokens_expires_at_index").using("btree", table.expiresAt.asc().nullsLast()),
	index("directus_oauth_tokens_previous_session_index").using("btree", table.previousSession.asc().nullsLast()),
	index("directus_oauth_tokens_session_index").using("btree", table.session.asc().nullsLast()),
	unique("directus_oauth_tokens_client_user_unique").on(table.client, table.user),]);

export const directusOperations = pgTable.withRLS("directus_operations", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }),
	key: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 255 }).notNull(),
	positionX: integer("position_x").notNull(),
	positionY: integer("position_y").notNull(),
	options: json(),
	resolve: uuid(),
	reject: uuid(),
	flow: uuid().notNull().references(() => directusFlows.id, { onDelete: "cascade" } ),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
}, (table) => [
	foreignKey({
		columns: [table.reject],
		foreignColumns: [table.id],
		name: "directus_operations_reject_foreign"
	}),
	foreignKey({
		columns: [table.resolve],
		foreignColumns: [table.id],
		name: "directus_operations_resolve_foreign"
	}),
	unique("directus_operations_reject_unique").on(table.reject),	unique("directus_operations_resolve_unique").on(table.resolve),]);

export const directusPanels = pgTable.withRLS("directus_panels", {
	id: uuid().primaryKey(),
	dashboard: uuid().notNull().references(() => directusDashboards.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }),
	icon: varchar({ length: 64 }).default(sql`NULL`),
	color: varchar({ length: 10 }),
	showHeader: boolean("show_header").default(false).notNull(),
	note: text(),
	type: varchar({ length: 255 }).notNull(),
	positionX: integer("position_x").notNull(),
	positionY: integer("position_y").notNull(),
	width: integer().notNull(),
	height: integer().notNull(),
	options: json(),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const directusPermissions = pgTable.withRLS("directus_permissions", {
	id: serial().primaryKey(),
	collection: varchar({ length: 64 }).notNull(),
	action: varchar({ length: 10 }).notNull(),
	permissions: json(),
	validation: json(),
	presets: json(),
	fields: text(),
	policy: uuid().notNull().references(() => directusPolicies.id, { onDelete: "cascade" } ),
});

export const directusPolicies = pgTable.withRLS("directus_policies", {
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	icon: varchar({ length: 64 }).default("badge").notNull(),
	description: text(),
	ipAccess: text("ip_access"),
	enforceTfa: boolean("enforce_tfa").default(false).notNull(),
	adminAccess: boolean("admin_access").default(false).notNull(),
	appAccess: boolean("app_access").default(false).notNull(),
});

export const directusPresets = pgTable.withRLS("directus_presets", {
	id: serial().primaryKey(),
	bookmark: varchar({ length: 255 }),
	user: uuid().references(() => directusUsers.id, { onDelete: "cascade" } ),
	role: uuid().references(() => directusRoles.id, { onDelete: "cascade" } ),
	collection: varchar({ length: 64 }),
	search: varchar({ length: 100 }),
	layout: varchar({ length: 100 }).default("tabular"),
	layoutQuery: json("layout_query"),
	layoutOptions: json("layout_options"),
	refreshInterval: integer("refresh_interval"),
	filter: json(),
	icon: varchar({ length: 64 }).default("bookmark"),
	color: varchar({ length: 255 }),
});

export const directusRelations = pgTable.withRLS("directus_relations", {
	id: serial().primaryKey(),
	manyCollection: varchar("many_collection", { length: 64 }).notNull(),
	manyField: varchar("many_field", { length: 64 }).notNull(),
	oneCollection: varchar("one_collection", { length: 64 }),
	oneField: varchar("one_field", { length: 64 }),
	oneCollectionField: varchar("one_collection_field", { length: 64 }),
	oneAllowedCollections: text("one_allowed_collections"),
	junctionField: varchar("junction_field", { length: 64 }),
	sortField: varchar("sort_field", { length: 64 }),
	oneDeselectAction: varchar("one_deselect_action", { length: 255 }).default("nullify").notNull(),
});

export const directusRevisions = pgTable.withRLS("directus_revisions", {
	id: serial().primaryKey(),
	activity: integer().notNull().references(() => directusActivity.id, { onDelete: "cascade" } ),
	collection: varchar({ length: 64 }).notNull(),
	item: varchar({ length: 255 }).notNull(),
	data: json(),
	delta: json(),
	parent: integer(),
	version: uuid().references(() => directusVersions.id, { onDelete: "cascade" } ),
}, (table) => [
	foreignKey({
		columns: [table.parent],
		foreignColumns: [table.id],
		name: "directus_revisions_parent_foreign"
	}),
	index("directus_revisions_activity_index").using("btree", table.activity.asc().nullsLast()),
	index("directus_revisions_parent_index").using("btree", table.parent.asc().nullsLast()),
]);

export const directusRoles = pgTable.withRLS("directus_roles", {
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	icon: varchar({ length: 64 }).default("supervised_user_circle").notNull(),
	description: text(),
	parent: uuid(),
}, (table) => [
	foreignKey({
		columns: [table.parent],
		foreignColumns: [table.id],
		name: "directus_roles_parent_foreign"
	}),
]);

export const directusSessions = pgTable.withRLS("directus_sessions", {
	token: varchar({ length: 64 }).primaryKey(),
	user: uuid().references(() => directusUsers.id, { onDelete: "cascade" } ),
	expires: timestamp({ withTimezone: true }).notNull(),
	ip: varchar({ length: 255 }),
	userAgent: text("user_agent"),
	share: uuid().references(() => directusShares.id, { onDelete: "cascade" } ),
	origin: varchar({ length: 255 }),
	nextToken: varchar("next_token", { length: 64 }),
	oauthClient: varchar("oauth_client", { length: 255 }).references(() => directusOauthClients.clientId, { onDelete: "cascade" } ),
}, (table) => [
	index("directus_sessions_oauth_client_index").using("btree", table.oauthClient.asc().nullsLast()),
]);

export const directusSettings = pgTable.withRLS("directus_settings", {
	id: serial().primaryKey(),
	projectName: varchar("project_name", { length: 100 }).default("Directus").notNull(),
	projectUrl: varchar("project_url", { length: 255 }),
	projectColor: varchar("project_color", { length: 255 }).default("#6644FF").notNull(),
	projectLogo: uuid("project_logo").references(() => directusFiles.id),
	publicForeground: uuid("public_foreground").references(() => directusFiles.id),
	publicBackground: uuid("public_background").references(() => directusFiles.id),
	publicNote: text("public_note"),
	authLoginAttempts: integer("auth_login_attempts").default(25),
	authPasswordPolicy: varchar("auth_password_policy", { length: 100 }),
	storageAssetTransform: varchar("storage_asset_transform", { length: 7 }).default("all"),
	storageAssetPresets: json("storage_asset_presets"),
	customCss: text("custom_css"),
	storageDefaultFolder: uuid("storage_default_folder").references(() => directusFolders.id, { onDelete: "set null" } ),
	basemaps: json(),
	mapboxKey: varchar("mapbox_key", { length: 255 }),
	moduleBar: json("module_bar"),
	projectDescriptor: varchar("project_descriptor", { length: 100 }),
	defaultLanguage: varchar("default_language", { length: 255 }).default("en-US").notNull(),
	customAspectRatios: json("custom_aspect_ratios"),
	publicFavicon: uuid("public_favicon").references(() => directusFiles.id),
	defaultAppearance: varchar("default_appearance", { length: 255 }).default("auto").notNull(),
	defaultThemeLight: varchar("default_theme_light", { length: 255 }),
	themeLightOverrides: json("theme_light_overrides"),
	defaultThemeDark: varchar("default_theme_dark", { length: 255 }),
	themeDarkOverrides: json("theme_dark_overrides"),
	reportErrorUrl: varchar("report_error_url", { length: 255 }),
	reportBugUrl: varchar("report_bug_url", { length: 255 }),
	reportFeatureUrl: varchar("report_feature_url", { length: 255 }),
	publicRegistration: boolean("public_registration").default(false).notNull(),
	publicRegistrationVerifyEmail: boolean("public_registration_verify_email").default(true).notNull(),
	publicRegistrationRole: uuid("public_registration_role").references(() => directusRoles.id, { onDelete: "set null" } ),
	publicRegistrationEmailFilter: json("public_registration_email_filter"),
	visualEditorUrls: json("visual_editor_urls"),
	projectId: uuid("project_id"),
	mcpEnabled: boolean("mcp_enabled").default(false).notNull(),
	mcpAllowDeletes: boolean("mcp_allow_deletes").default(false).notNull(),
	mcpPromptsCollection: varchar("mcp_prompts_collection", { length: 255 }).default(sql`NULL`),
	mcpSystemPromptEnabled: boolean("mcp_system_prompt_enabled").default(true).notNull(),
	mcpSystemPrompt: text("mcp_system_prompt"),
	projectOwner: varchar("project_owner", { length: 255 }),
	projectUsage: varchar("project_usage", { length: 255 }),
	orgName: varchar("org_name", { length: 255 }),
	productUpdates: boolean("product_updates"),
	projectStatus: varchar("project_status", { length: 255 }),
	aiOpenaiApiKey: text("ai_openai_api_key"),
	aiAnthropicApiKey: text("ai_anthropic_api_key"),
	aiSystemPrompt: text("ai_system_prompt"),
	aiGoogleApiKey: text("ai_google_api_key"),
	aiOpenaiCompatibleApiKey: text("ai_openai_compatible_api_key"),
	aiOpenaiCompatibleBaseUrl: text("ai_openai_compatible_base_url"),
	aiOpenaiCompatibleName: text("ai_openai_compatible_name"),
	aiOpenaiCompatibleModels: json("ai_openai_compatible_models"),
	aiOpenaiCompatibleHeaders: json("ai_openai_compatible_headers"),
	aiOpenaiAllowedModels: json("ai_openai_allowed_models"),
	aiAnthropicAllowedModels: json("ai_anthropic_allowed_models"),
	aiGoogleAllowedModels: json("ai_google_allowed_models"),
	collaborativeEditingEnabled: boolean("collaborative_editing_enabled").default(false).notNull(),
	aiTranslationDefaultModel: text("ai_translation_default_model"),
	aiTranslationGlossary: json("ai_translation_glossary"),
	aiTranslationStyleGuide: text("ai_translation_style_guide"),
	licenseKey: varchar("license_key", { length: 255 }).default(sql`NULL`),
	licenseToken: text("license_token"),
	mcpOauthEnabled: boolean("mcp_oauth_enabled").default(false).notNull(),
	mcpOauthDcrEnabled: boolean("mcp_oauth_dcr_enabled").default(false).notNull(),
	mcpOauthCimdEnabled: boolean("mcp_oauth_cimd_enabled").default(false).notNull(),
});

export const directusShares = pgTable.withRLS("directus_shares", {
	id: uuid().primaryKey(),
	name: varchar({ length: 255 }),
	collection: varchar({ length: 64 }).notNull().references(() => directusCollections.collection, { onDelete: "cascade" } ),
	item: varchar({ length: 255 }).notNull(),
	role: uuid().references(() => directusRoles.id, { onDelete: "cascade" } ),
	password: varchar({ length: 255 }),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	dateStart: timestamp("date_start", { withTimezone: true }),
	dateEnd: timestamp("date_end", { withTimezone: true }),
	timesUsed: integer("times_used").default(0),
	maxUses: integer("max_uses"),
});

export const directusTranslations = pgTable.withRLS("directus_translations", {
	id: uuid().primaryKey(),
	language: varchar({ length: 255 }).notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
});

export const directusUsers = pgTable.withRLS("directus_users", {
	id: uuid().primaryKey(),
	firstName: varchar("first_name", { length: 50 }),
	lastName: varchar("last_name", { length: 50 }),
	email: varchar({ length: 128 }),
	password: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
	title: varchar({ length: 50 }),
	description: text(),
	tags: json(),
	avatar: uuid(),
	language: varchar({ length: 255 }).default(sql`NULL`),
	tfaSecret: varchar("tfa_secret", { length: 255 }),
	status: varchar({ length: 16 }).default("active").notNull(),
	role: uuid().references(() => directusRoles.id, { onDelete: "set null" } ),
	token: varchar({ length: 255 }),
	lastAccess: timestamp("last_access", { withTimezone: true }),
	lastPage: varchar("last_page", { length: 255 }),
	provider: varchar({ length: 128 }).default("default").notNull(),
	externalIdentifier: varchar("external_identifier", { length: 255 }),
	authData: json("auth_data"),
	emailNotifications: boolean("email_notifications").default(true),
	appearance: varchar({ length: 255 }),
	themeDark: varchar("theme_dark", { length: 255 }),
	themeLight: varchar("theme_light", { length: 255 }),
	themeLightOverrides: json("theme_light_overrides"),
	themeDarkOverrides: json("theme_dark_overrides"),
	newsletter: boolean().default(true),
	textDirection: varchar("text_direction", { length: 255 }).default("auto").notNull(),
}, (table) => [
	unique("directus_users_email_unique").on(table.email),	unique("directus_users_external_identifier_unique").on(table.externalIdentifier),	unique("directus_users_token_unique").on(table.token),]);

export const directusVersions = pgTable.withRLS("directus_versions", {
	id: uuid().primaryKey(),
	key: varchar({ length: 64 }).notNull(),
	name: varchar({ length: 255 }),
	collection: varchar({ length: 64 }).notNull().references(() => directusCollections.collection, { onDelete: "cascade" } ),
	item: varchar({ length: 255 }),
	hash: varchar({ length: 255 }),
	dateCreated: timestamp("date_created", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	dateUpdated: timestamp("date_updated", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	userCreated: uuid("user_created").references(() => directusUsers.id, { onDelete: "set null" } ),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	delta: json(),
});

export const emojiReactions = pgTable.withRLS("emoji_reactions", {
	id: uuid().defaultRandom().primaryKey(),
	targetType: text("target_type"),
	targetId: uuid("target_id").notNull(),
	userId: uuid("user_id").references(() => usersInAuth.id, { onDelete: "cascade" } ),
	emoji: text().notNull(),
	createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
check("emoji_reactions_target_type_check", sql`(target_type = ANY (ARRAY['video'::text, 'comment'::text]))`),]);

export const engagementSignals = pgTable.withRLS("engagement_signals", {
	id: serial().primaryKey(),
	entityType: text("entity_type"),
	entityId: integer("entity_id"),
	signalType: text("signal_type"),
	weight: numeric(),
	ts: timestamp({ withTimezone: true }).default(sql`now()`),
});

export const events = pgTable.withRLS("events", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	eventCalendar: timestamp("event_calendar"),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	location: varchar({ length: 255 }),
	startTime: time("start_time"),
	endTime: time("end_time"),
	url: varchar({ length: 255 }),
	postalcode: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	qrCode: varchar("qr_code", { length: 255 }),
	checkIn: varchar("check_in", { length: 255 }),
	rsvpStatus: varchar("rsvp_status", { length: 255 }),
	rsvpPolicies: json("rsvp_policies"),
	date: timestamp(),
	slug: varchar({ length: 255 }),
	ticketsUrl: varchar("tickets_url", { length: 255 }),
	address: varchar({ length: 255 }),
});

export const eventsCities = pgTable.withRLS("events_cities", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const eventsCountries = pgTable.withRLS("events_countries", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const eventsCoupons = pgTable.withRLS("events_coupons", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
});

export const eventsDirectusUsers = pgTable.withRLS("events_directus_users", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const eventsFiles = pgTable.withRLS("events_files", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const eventsInvoices = pgTable.withRLS("events_invoices", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	invoicesId: bigint("invoices_id", { mode: 'number' }).references(() => invoices.id, { onDelete: "set null" } ),
});

export const eventsLists = pgTable.withRLS("events_lists", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const eventsPosts = pgTable.withRLS("events_posts", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const eventsProducts = pgTable.withRLS("events_products", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const eventsStates = pgTable.withRLS("events_states", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
	statesId: integer("states_id").references(() => states.id, { onDelete: "set null" } ),
});

export const faqs = pgTable.withRLS("faqs", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created"),
	userUpdated: uuid("user_updated"),
	question: varchar({ length: 255 }),
	answer: text(),
	creator: varchar({ length: 255 }),
});

export const faqsDirectusUsers = pgTable.withRLS("faqs_directus_users", {
	id: serial().primaryKey(),
	faqsId: integer("faqs_id").references(() => faqs.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const faqsFiles = pgTable.withRLS("faqs_files", {
	id: serial().primaryKey(),
	faqsId: integer("faqs_id").references(() => faqs.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id"),
});

export const faqsProducts = pgTable.withRLS("faqs_products", {
	id: serial().primaryKey(),
	faqsId: integer("faqs_id").references(() => faqs.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const federatedSpaces = pgTable.withRLS("federated_spaces", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	activitypubUrl: varchar("activitypub_url", { length: 255 }),
	syndicationType: varchar("syndication_type", { length: 255 }),
	lastSynced: timestamp("last_synced", { withTimezone: true }),
});

export const federatedSpacesSpaces = pgTable.withRLS("federated_spaces_spaces", {
	id: serial().primaryKey(),
	federatedSpacesId: integer("federated_spaces_id").references(() => federatedSpaces.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const feeds = pgTable.withRLS("feeds", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	user: uuid(),
	shop: integer().references(() => shops.id, { onDelete: "cascade" } ),
	contextId: uuid("context_id"),
	contextType: varchar("context_type", { length: 255 }),
}, (table) => [

	pgPolicy("Users can see their own newsfeed", { for: "select", using: sql`("user" = auth.uid())` }),
]);

export const feedsPosts = pgTable.withRLS("feeds_posts", {
	id: serial().primaryKey(),
	feedId: bigint("feed_id", { mode: 'number' }).references(() => feeds.id, { onDelete: "set null" } ),
	postId: integer("post_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const financeIndex = pgTable.withRLS("finance_index", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	previousClose: varchar("previous_close", { length: 255 }),
	dayRange: varchar("day_range", { length: 255 }),
	yearRange: varchar("year_range", { length: 255 }),
	todayPrice: varchar("today_price", { length: 255 }),
	stockUpDown: boolean("stock_up_down"),
	stockExchangeName: varchar("stock_exchange_name", { length: 255 }),
	slug: varchar({ length: 255 }),
});

export const financeIndexArticles = pgTable.withRLS("finance_index_articles", {
	id: serial().primaryKey(),
	financeIndexId: integer("finance_index_id").references(() => financeIndex.id, { onDelete: "set null" } ),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
});

export const financeIndexCurrency = pgTable.withRLS("finance_index_currency", {
	id: serial().primaryKey(),
	financeIndexId: integer("finance_index_id").references(() => financeIndex.id, { onDelete: "set null" } ),
	currencyId: integer("currency_id").references(() => currency.id, { onDelete: "set null" } ),
});

export const financeIndexRegion = pgTable.withRLS("finance_index_region", {
	id: serial().primaryKey(),
	financeIndexId: integer("finance_index_id").references(() => financeIndex.id, { onDelete: "set null" } ),
	regionId: integer("region_id").references(() => region.id, { onDelete: "set null" } ),
});

export const followers = pgTable.withRLS("followers", {
	id: serial().primaryKey(),
	followingId: uuid("following_id"),
	followerId: uuid("follower_id"),
	profileFollowing: uuid("profile_following").defaultRandom(),
	profileFollowers: uuid("profile_followers").defaultRandom(),
}, (table) => [
	unique("followers_profile_followers_key").on(table.profileFollowers),	unique("followers_profile_following_key").on(table.profileFollowing),]);

export const forms = pgTable("forms", {
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	id: uuid().primaryKey(),
	key: varchar({ length: 255 }).default(sql`NULL`),
	onSuccess: varchar("on_success", { length: 255 }).default(sql`NULL`),
	redirectUrl: varchar("redirect_url", { length: 255 }).default(sql`NULL`),
	schema: json(),
	sort: integer(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	submitLabel: varchar("submit_label", { length: 255 }).default(sql`NULL`),
	successMessage: text("success_message"),
	title: varchar({ length: 255 }).default(sql`NULL`),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
});

export const friendRequests = pgTable("friend_requests", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("pending").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	message: text(),
});

export const friendRequestsAddress = pgTable("friend_requests_address", {
	id: serial().primaryKey(),
	friendRequestsId: integer("friend_requests_id").references(() => friendRequests.id, { onDelete: "set null" } ),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
});

export const friendRequestsProfiles = pgTable("friend_requests_profiles", {
	id: serial().primaryKey(),
	friendRequestsId: integer("friend_requests_id").references(() => friendRequests.id, { onDelete: "set null" } ),
	profilesId: uuid("profiles_id").references(() => profiles.id, { onDelete: "set null" } ),
});

export const friendSuggestions = pgTable("friend_suggestions", {
	id: serial().primaryKey(),
	reason: text(),
	score: varchar({ length: 255 }),
	mutualFriends: text("mutual_friends"),
});

export const friendSuggestionsProfiles = pgTable("friend_suggestions_profiles", {
	id: serial().primaryKey(),
	friendSuggestionsId: integer("friend_suggestions_id").references(() => friendSuggestions.id, { onDelete: "set null" } ),
	profilesId: uuid("profiles_id").references(() => profiles.id, { onDelete: "set null" } ),
});

export const gamification = pgTable.withRLS("gamification", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	name: varchar({ length: 255 }),
	timeLimit: timestamp("time_limit"),
	userProfile: integer("user_profile").references(() => userProfile.id, { onDelete: "set null" } ),
	ranks: json(),
	achievementType: json("achievement_type"),
	pointsType: json("points_type"),
	openBadgeCompatible: varchar("open_badge_compatible", { length: 255 }),
	nominationUser: uuid("nomination_user").references(() => directusUsers.id, { onDelete: "set null" } ),
	birthdays: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	leaderboards: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	anniversaries: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	progress: varchar({ length: 255 }),
	dailyLoginRewards: timestamp("daily_login_rewards", { withTimezone: true }),
	timeBasedAwards: timestamp("time_based_awards"),
	referrals: varchar({ length: 255 }),
});

export const gamificationDirectusUsers = pgTable.withRLS("gamification_directus_users", {
	id: serial().primaryKey(),
	gamificationId: integer("gamification_id").references(() => gamification.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const gamificationEvents = pgTable.withRLS("gamification_events", {
	id: serial().primaryKey(),
	gamificationId: integer("gamification_id").references(() => gamification.id, { onDelete: "set null" } ),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
});

export const gamificationNotifications = pgTable.withRLS("gamification_notifications", {
	id: serial().primaryKey(),
	gamificationId: integer("gamification_id").references(() => gamification.id, { onDelete: "set null" } ),
	notificationsId: integer("notifications_id").references(() => notifications.id, { onDelete: "set null" } ),
});

export const gamificationProducts = pgTable.withRLS("gamification_products", {
	id: serial().primaryKey(),
	gamificationId: integer("gamification_id").references(() => gamification.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const gamificationVideos = pgTable.withRLS("gamification_videos", {
	id: serial().primaryKey(),
	gamificationId: integer("gamification_id").references(() => gamification.id, { onDelete: "set null" } ),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
});

export const geoRegions = pgTable.withRLS("geo_regions", {
	id: serial().primaryKey(),
	deliverySla: text("delivery_sla"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	name: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
});

export const geoRegionsCities = pgTable("geo_regions_cities", {
	id: serial().primaryKey(),
	geoRegionsId: integer("geo_regions_id").references(() => geoRegions.id, { onDelete: "set null" } ),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const geoRegionsCountries = pgTable("geo_regions_countries", {
	id: serial().primaryKey(),
	geoRegionsId: integer("geo_regions_id").references(() => geoRegions.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const geoRegionsStates = pgTable("geo_regions_states", {
	id: serial().primaryKey(),
	geoRegionsId: integer("geo_regions_id").references(() => geoRegions.id, { onDelete: "set null" } ),
	statesId: integer("states_id").references(() => states.id, { onDelete: "set null" } ),
});

export const globals = pgTable("globals", {
	addressCountry: varchar("address_country", { length: 255 }).default(sql`NULL`),
	addressLocality: varchar("address_locality", { length: 255 }).default(sql`NULL`),
	addressRegion: varchar("address_region", { length: 255 }).default(sql`NULL`),
	buildHookUrl: varchar("build_hook_url", { length: 255 }).default(sql`NULL`),
	description: text(),
	email: varchar({ length: 255 }).default(sql`NULL`),
	id: uuid().primaryKey(),
	ogImage: uuid("og_image").references(() => directusFiles.id, { onDelete: "set null" } ),
	phone: varchar({ length: 255 }).default(sql`NULL`),
	postalCode: varchar("postal_code", { length: 255 }).default(sql`NULL`),
	socialLinks: json("social_links").default([]),
	streetAddress: varchar("street_address", { length: 255 }).default(sql`NULL`),
	tagline: varchar({ length: 255 }).default(sql`NULL`),
	title: varchar({ length: 255 }).default(sql`NULL`),
	url: varchar({ length: 255 }).default(sql`NULL`),
	logoOnDarkBg: uuid("logo_on_dark_bg").references(() => directusFiles.id, { onDelete: "set null" } ),
	logoOnLightBg: uuid("logo_on_light_bg").references(() => directusFiles.id, { onDelete: "set null" } ),
	theme: json(),
});

export const helpArticles = pgTable("help_articles", {
	content: text(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	helpCollection: uuid("help_collection").references(() => helpCollections.id, { onDelete: "set null" } ),
	id: uuid().primaryKey(),
	owner: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }).default(sql`NULL`),
	sort: integer(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	summary: text(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
});

export const helpCollections = pgTable("help_collections", {
	description: text(),
	icon: varchar({ length: 255 }).default(sql`NULL`),
	id: uuid().primaryKey(),
	slug: varchar({ length: 255 }).default(sql`NULL`),
	sort: integer(),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const helpFeedback = pgTable("help_feedback", {
	comments: text(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	id: uuid().primaryKey(),
	rating: integer(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	url: varchar({ length: 255 }).default(sql`NULL`),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	visitorId: varchar("visitor_id", { length: 36 }).default(sql`NULL`),
});

export const inbox = pgTable("inbox", {
	data: json().default({}),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	form: uuid().references(() => forms.id, { onDelete: "set null" } ),
	id: uuid().primaryKey(),
	sort: integer(),
	status: varchar({ length: 255 }).default("new"),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	project: uuid().references(() => osProjects.id, { onDelete: "set null" } ),
	task: uuid().references(() => osTasks.id, { onDelete: "set null" } ),
});

export const incentives = pgTable.withRLS("incentives", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	incentiveType: varchar("incentive_type", { length: 255 }),
	amount: numeric({ precision: 10, scale: 5 }),
	userId: uuid("user_id").references(() => directusUsers.id, { onDelete: "set null" } ),
	expiresAt: timestamp("expires_at", { withTimezone: true }),
	metadata: json(),
});

export const incentivesCurrency = pgTable.withRLS("incentives_currency", {
	id: serial().primaryKey(),
	incentivesId: integer("incentives_id").references(() => incentives.id, { onDelete: "set null" } ),
	currencyId: integer("currency_id").references(() => currency.id, { onDelete: "set null" } ),
});

export const incentivesOrders = pgTable.withRLS("incentives_orders", {
	id: serial().primaryKey(),
	incentivesId: integer("incentives_id").references(() => incentives.id, { onDelete: "set null" } ),
	ordersId: integer("orders_id").references(() => orders.id, { onDelete: "set null" } ),
});

export const incentivesProducts = pgTable.withRLS("incentives_products", {
	id: serial().primaryKey(),
	incentivesId: integer("incentives_id").references(() => incentives.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const integrations = pgTable.withRLS("integrations", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	url: varchar({ length: 255 }),
	commands: varchar({ length: 255 }),
	description: text(),
	version: varchar({ length: 255 }),
	developer: varchar({ length: 255 }),
	isCost: varchar("is_cost", { length: 255 }),
	systemRequirements: json("system_requirements"),
	publisherInfo: text("publisher_info"),
	warnings: text(),
	disclaimers: text(),
	terms: text(),
	permissions: text(),
	type: varchar({ length: 255 }),
	ratings: varchar({ length: 255 }),
	price: real(),
	features: json(),
});

export const integrationsAttributes = pgTable.withRLS("integrations_attributes", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	attributesId: integer("attributes_id").references(() => attributes.id, { onDelete: "set null" } ),
});

export const integrationsCategories = pgTable.withRLS("integrations_categories", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const integrationsDepartments = pgTable.withRLS("integrations_departments", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const integrationsFiles = pgTable.withRLS("integrations_files", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const integrationsPlatform = pgTable.withRLS("integrations_platform", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
});

export const integrationsProductTypes = pgTable.withRLS("integrations_product_types", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	productTypesId: integer("product_types_id").references(() => productTypes.id, { onDelete: "set null" } ),
});

export const integrationsRatings = pgTable.withRLS("integrations_ratings", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	ratingsId: integer("ratings_id").references(() => ratings.id, { onDelete: "set null" } ),
});

export const integrationsReport = pgTable.withRLS("integrations_report", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	reportId: integer("report_id").references(() => report.id, { onDelete: "set null" } ),
});

export const integrationsSpaces = pgTable.withRLS("integrations_spaces", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const integrationsTags = pgTable.withRLS("integrations_tags", {
	id: serial().primaryKey(),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
});

export const inventoryLots = pgTable.withRLS("inventory_lots", {
	id: serial().primaryKey(),
	locationId: integer("location_id"),
	qty: integer(),
	batch: text(),
	expiresAt: timestamp("expires_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const invoices = pgTable.withRLS("invoices", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	baseCurrencyCode: text("base_currency_code"),
	baseDiscountAmount: integer("base_discount_amount"),
	baseGrandTotal: integer("base_grand_total"),
	baseDiscountTaxCompensationAmount: integer("base_discount_tax_compensation_amount"),
	baseShippingAmount: integer("base_shipping_amount"),
	baseShippingDiscountTaxCompensationAmnt: integer("base_shipping_discount_tax_compensation_amnt"),
	baseShippingInclTax: integer("base_shipping_incl_tax"),
	baseShippingTaxAmount: integer("base_shipping_tax_amount"),
	baseSubtotal: integer("base_subtotal"),
	baseSubtotalInclTax: integer("base_subtotal_incl_tax"),
	baseTaxAmount: integer("base_tax_amount"),
	baseTotalRefunded: integer("base_total_refunded"),
	baseToGlobalRate: integer("base_to_global_rate"),
	baseToOrderRate: integer("base_to_order_rate"),
	canVoidFlag: integer("can_void_flag"),
	discountAmount: integer("discount_amount"),
	discountDescription: text("discount_description"),
	emailSent: integer("email_sent"),
	entityId: integer("entity_id"),
	globalCurrencyCode: text("global_currency_code"),
	grandTotal: integer("grand_total"),
	discountTaxCompensationAmount: integer("discount_tax_compensation_amount"),
	incrementId: text("increment_id"),
	isUsedForRefund: integer("is_used_for_refund"),
	orderCurrencyCode: text("order_currency_code"),
	shippingAmount: integer("shipping_amount"),
	shippingDiscountTaxCompensationAmount: integer("shipping_discount_tax_compensation_amount"),
	shippingInclTax: integer("shipping_incl_tax"),
	shippingTaxAmount: integer("shipping_tax_amount"),
	state: integer(),
	storeCurrencyCode: text("store_currency_code"),
	storeId: integer("store_id"),
	storeToBaseRate: integer("store_to_base_rate"),
	storeToOrderRate: integer("store_to_order_rate"),
	subtotal: integer(),
	subtotalInclTax: integer("subtotal_incl_tax"),
	taxAmount: integer("tax_amount"),
	totalQty: integer("total_qty"),
	user: uuid(),
	plan: varchar({ length: 255 }),
	servicePeriod: varchar("service_period", { length: 255 }),
	paymentPeriod: varchar("payment_period", { length: 255 }),
});

export const invoicesAddress = pgTable.withRLS("invoices_address", {
	id: serial().primaryKey(),
	invoiceId: bigint("invoice_id", { mode: 'number' }).references(() => invoices.id, { onDelete: "set null" } ),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
});

export const invoicesOrders = pgTable.withRLS("invoices_orders", {
	id: serial().primaryKey(),
	invoiceId: bigint("invoice_id", { mode: 'number' }).references(() => invoices.id, { onDelete: "set null" } ),
	orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" } ),
});

export const invoicesShippingAddress = pgTable.withRLS("invoices_shipping_address", {
	id: serial().primaryKey(),
	invoiceId: bigint("invoice_id", { mode: 'number' }).references(() => invoices.id, { onDelete: "set null" } ),
	shippingAddressId: integer("shipping_address_id").references(() => shippingAddress.id, { onDelete: "set null" } ),
});

export const invoicesTransactions = pgTable.withRLS("invoices_transactions", {
	id: serial().primaryKey(),
	invoiceId: bigint("invoice_id", { mode: 'number' }),
	transactionId: bigint("transaction_id", { mode: 'number' }),
});

export const listItems = pgTable.withRLS("list_items", {
	id: serial().primaryKey(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	listId: integer("list_id").references(() => lists.id, { onDelete: "set null" } ),
	postId: integer("post_id").references(() => posts.id, { onDelete: "set null" } ),
	title: varchar({ length: 255 }),
	description: text(),
	status: varchar({ length: 255 }),
	dueDate: timestamp("due_date"),
	link: varchar({ length: 255 }),
	media: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	priority: varchar({ length: 255 }),
	position: integer(),
	isChecked: boolean("is_checked"),
	slug: varchar({ length: 255 }),
});

export const listItemsDirectusUsers = pgTable.withRLS("list_items_directus_users", {
	id: serial().primaryKey(),
	listItemsId: integer("list_items_id").references(() => listItems.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const listItemsProducts = pgTable.withRLS("list_items_products", {
	id: serial().primaryKey(),
	listItemsId: integer("list_items_id").references(() => listItems.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const listProducts = pgTable.withRLS("list_products", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	productSku: varchar("product_sku", { length: 255 }),
	quantity: integer(),
});

export const listProductsLists = pgTable.withRLS("list_products_lists", {
	id: serial().primaryKey(),
	listProductsId: integer("list_products_id").references(() => listProducts.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const lists = pgTable.withRLS("lists", {
	id: serial().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid(),
	type: varchar({ length: 255 }),
	status: varchar({ length: 255 }),
	favorite: varchar({ length: 255 }),
	productSku: json("product_sku"),
	slug: varchar({ length: 255 }),
	priority: varchar({ length: 255 }),
	progress: integer(),
});

export const listsCategories = pgTable.withRLS("lists_categories", {
	id: serial().primaryKey(),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const listsDepartments = pgTable.withRLS("lists_departments", {
	id: serial().primaryKey(),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const listsDirectusUsers = pgTable.withRLS("lists_directus_users", {
	id: serial().primaryKey(),
	listId: integer("list_id").references(() => lists.id, { onDelete: "set null" } ),
	userId: uuid("user_id"),
});

export const listsFiles = pgTable.withRLS("lists_files", {
	id: serial().primaryKey(),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const listsProducts = pgTable.withRLS("lists_products", {
	id: serial().primaryKey(),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const listsShorts = pgTable.withRLS("lists_shorts", {
	id: serial().primaryKey(),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const listsTemplate = pgTable.withRLS("lists_template", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	title: varchar({ length: 255 }),
	visibility: varchar({ length: 255 }),
	icon: varchar({ length: 255 }),
	theme: varchar({ length: 255 }),
	description: text(),
	type: varchar({ length: 255 }),
});

export const listsTemplateDirectusUsers = pgTable.withRLS("lists_template_directus_users", {
	id: serial().primaryKey(),
	listsTemplateId: integer("lists_template_id").references(() => listsTemplate.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const listsTemplateListItems = pgTable.withRLS("lists_template_list_items", {
	id: serial().primaryKey(),
	listsTemplateId: integer("lists_template_id").references(() => listsTemplate.id, { onDelete: "set null" } ),
	listItemsId: integer("list_items_id").references(() => listItems.id, { onDelete: "set null" } ),
});

export const listsTemplateTags = pgTable.withRLS("lists_template_tags", {
	id: serial().primaryKey(),
	listsTemplateId: integer("lists_template_id").references(() => listsTemplate.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
});

export const listsTemplates = pgTable.withRLS("lists_templates", {
	id: serial().primaryKey(),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
	templatesId: integer("templates_id").references(() => templates.id, { onDelete: "set null" } ),
});

export const listsType = pgTable.withRLS("lists_type", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	visibility: varchar({ length: 255 }),
	category: varchar({ length: 255 }),
});

export const listsTypeCategories = pgTable.withRLS("lists_type_categories", {
	id: serial().primaryKey(),
	listsTypeId: integer("lists_type_id").references(() => listsType.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const listsTypeLists = pgTable.withRLS("lists_type_lists", {
	id: serial().primaryKey(),
	listsTypeId: integer("lists_type_id").references(() => listsType.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const manufacturer = pgTable.withRLS("manufacturer", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	code: text(),
	name: text(),
	description: text(),
	isPublic: boolean(),
	image: uuid(),
});

export const manufacturerCountries = pgTable.withRLS("manufacturer_countries", {
	id: serial().primaryKey(),
	manufacturerId: bigint("manufacturer_id", { mode: 'number' }).references(() => manufacturer.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const media = pgTable("media", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" } ),
});

export const mediaFiles = pgTable("media_files", {
	id: serial().primaryKey(),
	mediaId: integer("media_id").references(() => media.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const mediaFolders = pgTable("media_folders", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	parentFolder: integer("parent_folder").references(() => media.id, { onDelete: "set null" } ),
});

export const mediaFoldersDirectusUsers = pgTable("media_folders_directus_users", {
	id: serial().primaryKey(),
	mediaFoldersId: integer("media_folders_id").references(() => mediaFolders.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const meeovistores = pgTable.withRLS("meeovistores", {
	id: serial().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	content: text(),
	color: varchar({ length: 255 }),
	colortext: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
});

export const meilisearchSettings = pgTable.withRLS("meilisearch_settings", {
	id: serial().primaryKey(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	host: varchar({ length: 255 }).default(sql`NULL`),
	apiKey: varchar("api_key", { length: 255 }).default(sql`NULL`),
	collectionsConfiguration: json("collections_configuration").default([]),
});

export const memberGroupsEvents = pgTable.withRLS("member_groups_events", {
	id: serial().primaryKey(),
	eventsId: integer("events_id").references(() => events.id, { onDelete: "set null" } ),
});

export const memberGroupsPolls = pgTable.withRLS("member_groups_polls", {
	id: serial().primaryKey(),
	pollsId: integer("polls_id").references(() => polls.id, { onDelete: "set null" } ),
});

export const memberGroupsPosts = pgTable.withRLS("member_groups_posts", {
	id: serial().primaryKey(),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const memberGroupsProducts = pgTable.withRLS("member_groups_products", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const memberGroupsSpaceMembers = pgTable.withRLS("member_groups_space_members", {
	id: serial().primaryKey(),
});

export const merchRecipes = pgTable.withRLS("merch_recipes", {
	id: serial().primaryKey(),
	departmentId: integer("department_id"),
	inputsJson: jsonb("inputs_json"),
	constraintsJson: jsonb("constraints_json"),
	outputSlots: jsonb("output_slots"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const messages = pgTable.withRLS("messages", {
	id: serial().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	title: varchar({ length: 255 }),
	content: text(),
	conversation: uuid().references(() => conversations.id, { onDelete: "cascade" } ),
	text: text(),
	visitorId: varchar("visitor_id", { length: 36 }).default(sql`NULL`),
	contactId: varchar("contact_id", { length: 36 }).default(sql`NULL`),
});

export const moments = pgTable.withRLS("moments", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	content: text(),
	type: varchar({ length: 255 }),
});

export const momentsProducts = pgTable.withRLS("moments_products", {
	id: serial().primaryKey(),
	momentsId: integer("moments_id").references(() => moments.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const momentsSpaces = pgTable.withRLS("moments_spaces", {
	id: serial().primaryKey(),
	momentsId: integer("moments_id").references(() => moments.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const musicchart = pgTable.withRLS("musicchart", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid(),
	thisWeek: varchar("this_week", { length: 255 }),
	lastWeek: varchar("last_week", { length: 255 }),
	peakPosition: varchar("peak_position", { length: 255 }),
	weeksOnChart: varchar("weeks_on_chart", { length: 255 }),
	award: varchar({ length: 255 }),
	color: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	creator: varchar({ length: 255 }),
	previousPosition: varchar("previous_position", { length: 255 }),
	firstAppearance: varchar("first_appearance", { length: 255 }),
	currentSales: varchar("current_sales", { length: 255 }),
	previousSales: varchar("previous_sales", { length: 255 }),
	trend: varchar({ length: 255 }),
	seller: varchar({ length: 255 }),
});

export const musicchartDepartments = pgTable.withRLS("musicchart_departments", {
	id: serial().primaryKey(),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const navigation = pgTable.withRLS("navigation", {
	id: serial().primaryKey(),
	type: varchar({ length: 255 }),
	name: varchar({ length: 255 }),
	url: varchar({ length: 255 }),
	image: uuid(),
	submenus: json(),
	menus: json(),
	description: text(),
	color: varchar({ length: 255 }),
	colortext: varchar({ length: 255 }),
	customTabs: json("custom_tabs"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	status: varchar({ length: 255 }).default("draft").notNull(),
	title: varchar({ length: 255 }).default(sql`NULL`),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	items: jsonb().default([]).notNull(),
});

export const navigationPages = pgTable.withRLS("navigation_pages", {
	id: serial().primaryKey(),
	navigationId: integer("navigation_id").references(() => navigation.id, { onDelete: "set null" } ),
	pagesId: integer("pages_id").references(() => pages.id, { onDelete: "set null" } ),
});

export const navigationWebsites = pgTable.withRLS("navigation_websites", {
	id: serial().primaryKey(),
	navigationId: integer("navigation_id").references(() => navigation.id, { onDelete: "set null" } ),
	websitesId: bigint("websites_id", { mode: 'number' }).references(() => websites.id, { onDelete: "set null" } ),
});

export const newsletters = pgTable.withRLS("newsletters", {
	id: serial().primaryKey(),
	email: text().notNull(),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	status: varchar({ length: 255 }),
});

export const notifications = pgTable.withRLS("notifications", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	content: text(),
	isRead: boolean("is_read"),
	image: uuid(),
	payload: json(),
	type: varchar({ length: 255 }),
	recipient: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const orderItems = pgTable.withRLS("order_items", {
	id: serial().primaryKey(),
	quantity: integer(),
	price: numeric({ precision: 10, scale: 5 }),
});

export const orderItemsOrders = pgTable.withRLS("order_items_orders", {
	id: serial().primaryKey(),
	orderItemsId: integer("order_items_id").references(() => orderItems.id, { onDelete: "set null" } ),
	ordersId: integer("orders_id").references(() => orders.id, { onDelete: "set null" } ),
});

export const orderItemsProducts = pgTable.withRLS("order_items_products", {
	id: serial().primaryKey(),
	orderItemsId: integer("order_items_id").references(() => orderItems.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const orders = pgTable.withRLS("orders", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	type: varchar({ length: 255 }),
	adjustmentNegative: integer("adjustment_negative"),
	adjustmentPositive: integer("adjustment_positive"),
	appliedRuleIds: text("applied_rule_ids"),
	baseAdjustmentNegative: integer("base_adjustment_negative"),
	baseAdjustmentPositive: integer("base_adjustment_positive"),
	baseCurrencyCode: text("base_currency_code"),
	baseDiscountAmount: integer("base_discount_amount"),
	baseDiscountCanceled: integer("base_discount_canceled"),
	baseDiscountInvoiced: integer("base_discount_invoiced"),
	baseDiscountRefunded: integer("base_discount_refunded"),
	baseGrandTotal: integer("base_grand_total"),
	baseDiscountTaxCompensationAmount: integer("base_discount_tax_compensation_amount"),
	baseDiscountTaxCompensationInvoiced: integer("base_discount_tax_compensation_invoiced"),
	baseDiscountTaxCompensationRefunded: integer("base_discount_tax_compensation_refunded"),
	baseShippingAmount: integer("base_shipping_amount"),
	baseShippingCanceled: integer("base_shipping_canceled"),
	baseShippingDiscountAmount: integer("base_shipping_discount_amount"),
	baseShippingDiscountTaxCompensationAmnt: integer("base_shipping_discount_tax_compensation_amnt"),
	baseShippingInclTax: integer("base_shipping_incl_tax"),
	baseShippingInvoiced: integer("base_shipping_invoiced"),
	baseShippingRefunded: integer("base_shipping_refunded"),
	baseShippingTaxAmount: integer("base_shipping_tax_amount"),
	baseShippingTaxRefunded: integer("base_shipping_tax_refunded"),
	baseSubtotal: integer("base_subtotal"),
	baseSubtotalCanceled: integer("base_subtotal_canceled"),
	baseSubtotalInclTax: integer("base_subtotal_incl_tax"),
	baseSubtotalInvoiced: integer("base_subtotal_invoiced"),
	baseSubtotalRefunded: integer("base_subtotal_refunded"),
	baseTaxAmount: integer("base_tax_amount"),
	baseTaxCanceled: integer("base_tax_canceled"),
	baseTaxInvoiced: integer("base_tax_invoiced"),
	baseTaxRefunded: integer("base_tax_refunded"),
	baseTotalCanceled: integer("base_total_canceled"),
	baseTotalDue: integer("base_total_due"),
	baseTotalInvoiced: integer("base_total_invoiced"),
	baseTotalInvoicedCost: integer("base_total_invoiced_cost"),
	baseTotalOfflineRefunded: integer("base_total_offline_refunded"),
	baseTotalOnlineRefunded: integer("base_total_online_refunded"),
	baseTotalPaid: integer("base_total_paid"),
	baseTotalQtyOrdered: integer("base_total_qty_ordered"),
	baseTotalRefunded: integer("base_total_refunded"),
	baseToGlobalRate: integer("base_to_global_rate"),
	baseToOrderRate: integer("base_to_order_rate"),
	billingAddressId: integer("billing_address_id"),
	canShipPartially: integer("can_ship_partially"),
	canShipPartiallyItem: integer("can_ship_partially_item"),
	couponCode: text("coupon_code"),
	customerDob: text("customer_dob"),
	customerEmail: text("customer_email"),
	customerFirstname: text("customer_firstname"),
	customerGender: integer("customer_gender"),
	customerGroupId: integer("customer_group_id"),
	customerId: integer("customer_id"),
	customerIsGuest: integer("customer_is_guest"),
	customerLastname: text("customer_lastname"),
	customerMiddlename: text("customer_middlename"),
	customerNote: text("customer_note"),
	customerNoteNotify: integer("customer_note_notify"),
	customerPrefix: text("customer_prefix"),
	customerSuffix: text("customer_suffix"),
	customerTaxvat: text("customer_taxvat"),
	discountAmount: integer("discount_amount"),
	discountCanceled: integer("discount_canceled"),
	discountDescription: text("discount_description"),
	discountInvoiced: integer("discount_invoiced"),
	discountRefunded: integer("discount_refunded"),
	editIncrement: integer("edit_increment"),
	emailSent: integer("email_sent"),
	entityId: integer("entity_id"),
	extCustomerId: text("ext_customer_id"),
	extOrderId: text("ext_order_id"),
	forcedShipmentWithInvoice: integer("forced_shipment_with_invoice"),
	globalCurrencyCode: text("global_currency_code"),
	grandTotal: integer("grand_total"),
	discountTaxCompensationAmount: integer("discount_tax_compensation_amount"),
	discountTaxCompensationInvoiced: integer("discount_tax_compensation_invoiced"),
	discountTaxCompensationRefunded: integer("discount_tax_compensation_refunded"),
	holdBeforeState: text("hold_before_state"),
	holdBeforeStatus: text("hold_before_status"),
	incrementId: text("increment_id"),
	isVirtual: integer("is_virtual"),
	orderCurrencyCode: text("order_currency_code"),
	originalIncrementId: text("original_increment_id"),
	paymentAuthorizationAmount: integer("payment_authorization_amount"),
	paymentAuthExpiration: integer("payment_auth_expiration"),
	protectCode: text("protect_code"),
	quoteAddressId: integer("quote_address_id"),
	quoteId: integer("quote_id"),
	relationChildId: text("relation_child_id"),
	relationChildRealId: text("relation_child_real_id"),
	relationParentId: text("relation_parent_id"),
	relationParentRealId: text("relation_parent_real_id"),
	remoteIp: text("remote_ip"),
	shippingAmount: integer("shipping_amount"),
	shippingCanceled: integer("shipping_canceled"),
	shippingDescription: text("shipping_description"),
	shippingDiscountAmount: integer("shipping_discount_amount"),
	shippingDiscountTaxCompensationAmount: integer("shipping_discount_tax_compensation_amount"),
	shippingInclTax: integer("shipping_incl_tax"),
	shippingInvoiced: integer("shipping_invoiced"),
	shippingRefunded: integer("shipping_refunded"),
	shippingTaxAmount: integer("shipping_tax_amount"),
	shippingTaxRefunded: integer("shipping_tax_refunded"),
	state: text(),
	storeCurrencyCode: text("store_currency_code"),
	storeId: integer("store_id"),
	storeName: text("store_name"),
	storeToBaseRate: integer("store_to_base_rate"),
	storeToOrderRate: integer("store_to_order_rate"),
	subtotal: integer(),
	subtotalCanceled: integer("subtotal_canceled"),
	subtotalInclTax: integer("subtotal_incl_tax"),
	subtotalInvoiced: integer("subtotal_invoiced"),
	subtotalRefunded: integer("subtotal_refunded"),
	taxAmount: integer("tax_amount"),
	taxCanceled: integer("tax_canceled"),
	taxInvoiced: integer("tax_invoiced"),
	taxRefunded: integer("tax_refunded"),
	totalCanceled: integer("total_canceled"),
	totalDue: integer("total_due"),
	totalInvoiced: integer("total_invoiced"),
	totalItemCount: integer("total_item_count"),
	totalOfflineRefunded: integer("total_offline_refunded"),
	totalOnlineRefunded: integer("total_online_refunded"),
	totalPaid: integer("total_paid"),
	totalQtyOrdered: integer("total_qty_ordered"),
	totalRefunded: integer("total_refunded"),
	weight: integer(),
	xForwardedFor: text("x_forwarded_for"),
	paymentStatus: varchar("payment_status", { length: 255 }),
	userId: uuid("user_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const ordersProducts = pgTable.withRLS("orders_products", {
	id: serial().primaryKey(),
	ordersId: integer("orders_id").references(() => orders.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const organizationAddresses = pgTable("organization_addresses", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	organization: uuid().references(() => organizations.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).default(sql`NULL`),
	streetAddress: varchar("street_address", { length: 255 }).default(sql`NULL`),
	postalCode: varchar("postal_code", { length: 255 }).default(sql`NULL`),
	addressRegion: varchar("address_region", { length: 255 }).default(sql`NULL`),
	addressCountry: varchar("address_country", { length: 255 }).default("US"),
	addressLocality: varchar("address_locality", { length: 255 }).default(sql`NULL`),
	isPrimaryBilling: boolean("is_primary_billing").default(false),
});

export const organizations = pgTable("organizations", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	website: varchar({ length: 255 }).default(sql`NULL`),
	logo: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	brandColor: varchar("brand_color", { length: 255 }).default(sql`NULL`),
	organizationNotes: text("organization_notes"),
	email: varchar({ length: 255 }).default(sql`NULL`),
	paymentTerms: uuid("payment_terms").references(() => osPaymentTerms.id, { onDelete: "set null" } ),
	owner: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	phone: varchar({ length: 255 }).default(sql`NULL`),
	folder: uuid().references(() => directusFolders.id, { onDelete: "set null" } ),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).default(sql`NULL`),
});

export const organizationMembers = pgTable.withRLS("organization_members", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => directusUsersInEnovels.id, { onDelete: "cascade" } ),
	organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" } ),
	role: varchar({ length: 255 }).default("member").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => [
	index("organization_members_user_id_idx").using("btree", table.userId.asc().nullsLast()),
	index("organization_members_organization_id_idx").using("btree", table.organizationId.asc().nullsLast()),
	unique("organization_members_user_org_unique").on(table.userId, table.organizationId),
]);

export const organizationsContacts = pgTable("organizations_contacts", {
	id: uuid().primaryKey(),
	contactsId: uuid("contacts_id").references(() => contacts.id, { onDelete: "cascade" } ),
	organizationsId: uuid("organizations_id").references(() => organizations.id, { onDelete: "cascade" } ),
	sort: integer(),
});

export const osActivities = pgTable("os_activities", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	deal: uuid().references(() => osDeals.id, { onDelete: "set null" } ),
	activityType: varchar("activity_type", { length: 255 }).default(sql`NULL`),
	activityNotes: text("activity_notes"),
	name: varchar({ length: 255 }).default(sql`NULL`),
	organization: uuid().references(() => organizations.id, { onDelete: "set null" } ),
	startTime: timestamp("start_time", { withTimezone: true }),
	endTime: timestamp("end_time", { withTimezone: true }),
	dueDate: timestamp("due_date", { withTimezone: true }),
	assignedTo: uuid("assigned_to").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const osActivityContacts = pgTable("os_activity_contacts", {
	id: uuid().primaryKey(),
	osActivitiesId: uuid("os_activities_id").references(() => osActivities.id, { onDelete: "cascade" } ),
	contactsId: uuid("contacts_id").references(() => contacts.id, { onDelete: "cascade" } ),
});

export const osDealContacts = pgTable("os_deal_contacts", {
	id: uuid().primaryKey(),
	primary: boolean(),
	osDealsId: uuid("os_deals_id").references(() => osDeals.id, { onDelete: "cascade" } ),
	contactsId: uuid("contacts_id").references(() => contacts.id, { onDelete: "cascade" } ),
	sort: integer(),
});

export const osDealStages = pgTable("os_deal_stages", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	color: varchar({ length: 255 }).default(sql`NULL`),
});

export const osDeals = pgTable("os_deals", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	owner: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	organization: uuid().references(() => organizations.id, { onDelete: "set null" } ),
	closeDate: date("close_date"),
	dealStage: uuid("deal_stage").references(() => osDealStages.id, { onDelete: "set null" } ),
	nextContactDate: timestamp("next_contact_date"),
	dealValue: integer("deal_value"),
	dealNotes: text("deal_notes"),
});

export const osEmailTemplates = pgTable("os_email_templates", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	subject: varchar({ length: 255 }).default(sql`NULL`),
	body: text(),
	name: varchar({ length: 255 }).default(sql`NULL`),
});

export const osExpenses = pgTable("os_expenses", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	category: varchar({ length: 255 }).default(sql`NULL`),
	name: varchar({ length: 255 }).default(sql`NULL`),
	cost: numeric({ mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
	description: text(),
	date: timestamp({ withTimezone: true }),
	file: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	project: uuid().references(() => osProjects.id, { onDelete: "set null" } ),
	isBillable: boolean("is_billable").default(false),
	invoiceItem: uuid("invoice_item").references((): AnyPgColumn => osInvoiceItems.id),
	status: varchar({ length: 255 }).default("draft").notNull(),
	isReimbursable: boolean("is_reimbursable").default(false),
	userSubmitted: uuid("user_submitted").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const osInvoiceItems = pgTable("os_invoice_items", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	invoice: uuid().references(() => osInvoices.id, { onDelete: "cascade" } ),
	lineItemNumber: integer("line_item_number"),
	description: text(),
	taxRate: uuid("tax_rate").references(() => osTaxRates.id, { onDelete: "set null" } ),
	taxAmount: numeric("tax_amount", { mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
	unitPrice: numeric("unit_price", { mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
	quantity: numeric({ mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
	lineAmount: numeric("line_amount", { mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
	billableExpense: uuid("billable_expense").references((): AnyPgColumn => osExpenses.id, { onDelete: "set null" } ),
	item: uuid().references(() => osItems.id),
	type: varchar({ length: 255 }).default("item"),
	itemName: varchar("item_name", { length: 255 }).default(sql`NULL`),
	overrideUnitPrice: boolean("override_unit_price").default(false),
});

export const osInvoices = pgTable("os_invoices", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	invoiceNumber: varchar("invoice_number", { length: 255 }).default(sql`NULL`),
	dueDate: timestamp("due_date", { withTimezone: true }),
	reference: varchar({ length: 255 }).default(sql`NULL`),
	organization: uuid().references(() => organizations.id, { onDelete: "set null" } ),
	contact: uuid().references(() => contacts.id, { onDelete: "set null" } ),
	issueDate: timestamp("issue_date", { withTimezone: true }),
	project: uuid().references(() => osProjects.id, { onDelete: "set null" } ),
	subtotal: numeric({ mode: 'number', precision: 10, scale: 5 }).default(sql`NULL`),
	totalTax: numeric("total_tax", { mode: 'number', precision: 10, scale: 5 }).default(sql`NULL`),
	total: numeric({ mode: 'number', precision: 10, scale: 5 }).default(sql`NULL`),
	amountPaid: numeric("amount_paid", { mode: 'number', precision: 10, scale: 5 }).default(sql`NULL`),
	amountDue: numeric("amount_due", { mode: 'number', precision: 10, scale: 5 }).default(sql`NULL`),
});

export const osItems = pgTable("os_items", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("active"),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	description: text(),
	unitPrice: numeric("unit_price", { mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
	defaultTaxRate: uuid("default_tax_rate").references(() => osTaxRates.id, { onDelete: "set null" } ),
	icon: varchar({ length: 255 }).default(sql`NULL`),
	unitCost: numeric("unit_cost", { mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
});

export const osPaymentTerms = pgTable("os_payment_terms", {
	id: uuid().primaryKey(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
});

export const osPayments = pgTable("os_payments", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("pending"),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	paymentDate: timestamp("payment_date", { withTimezone: true }),
	amount: numeric({ mode: 'number', precision: 10, scale: 2 }).default(sql`NULL`),
	stripePaymentId: varchar("stripe_payment_id", { length: 255 }).default(sql`NULL`),
	organization: uuid().references(() => organizations.id, { onDelete: "set null" } ),
	contact: uuid().references(() => contacts.id, { onDelete: "set null" } ),
	invoice: uuid().references(() => osInvoices.id, { onDelete: "set null" } ),
	metadata: json(),
	paymentMethodType: varchar("payment_method_type", { length: 255 }).default(sql`NULL`),
	receiptUrl: varchar("receipt_url", { length: 255 }).default(sql`NULL`),
});

export const osProjectContacts = pgTable("os_project_contacts", {
	id: uuid().primaryKey(),
	osProjectsId: uuid("os_projects_id").references(() => osProjects.id, { onDelete: "cascade" } ),
	contactsId: uuid("contacts_id").references(() => contacts.id, { onDelete: "cascade" } ),
	sort: integer(),
});

export const osProjectTemplates = pgTable("os_project_templates", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	tasks: json(),
	description: text(),
});

export const osProjectUpdates = pgTable("os_project_updates", {
	id: uuid().primaryKey(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	project: uuid().references(() => osProjects.id, { onDelete: "set null" } ),
	message: text(),
});

export const osProjects = pgTable("os_projects", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("new"),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	organization: uuid().references(() => organizations.id, { onDelete: "set null" } ),
	description: text(),
	owner: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	startDate: timestamp("start_date", { withTimezone: true }),
	dueDate: timestamp("due_date"),
});

export const osProposalApprovals = pgTable("os_proposal_approvals", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	signatureText: varchar("signature_text", { length: 255 }).default(sql`NULL`),
	signatureImage: uuid("signature_image").references(() => directusFiles.id, { onDelete: "set null" } ),
	signatureType: varchar("signature_type", { length: 255 }).default(sql`NULL`),
	firstName: varchar("first_name", { length: 255 }).default(sql`NULL`),
	lastName: varchar("last_name", { length: 255 }).default(sql`NULL`),
	organization: varchar({ length: 255 }).default(sql`NULL`),
	proposal: uuid().references(() => osProposals.id, { onDelete: "cascade" } ),
	email: varchar({ length: 255 }).default(sql`NULL`),
	metadata: json(),
	ipAddress: varchar("ip_address", { length: 255 }).default(sql`NULL`),
	esignatureAgreement: boolean("esignature_agreement").default(false),
	contact: uuid().references(() => contacts.id, { onDelete: "set null" } ),
});

export const osProposalBlocks = pgTable("os_proposal_blocks", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	osProposalsId: uuid("os_proposals_id").references(() => osProposals.id, { onDelete: "set null" } ),
	item: varchar({ length: 255 }).default(sql`NULL`),
	collection: varchar({ length: 255 }).default(sql`NULL`),
});

export const osProposalContacts = pgTable("os_proposal_contacts", {
	id: uuid().primaryKey(),
	osProposalsId: uuid("os_proposals_id").references(() => osProposals.id, { onDelete: "cascade" } ),
	contactsId: uuid("contacts_id").references(() => contacts.id, { onDelete: "cascade" } ),
	sort: integer(),
});

export const osProposals = pgTable("os_proposals", {
	id: uuid().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	organization: uuid().references(() => organizations.id, { onDelete: "set null" } ),
	deal: uuid().references(() => osDeals.id, { onDelete: "set null" } ),
	status: varchar({ length: 255 }).default("draft").notNull(),
	expirationDate: timestamp("expiration_date", { withTimezone: true }),
});

export const osSettings = pgTable("os_settings", {
	id: uuid().primaryKey(),
	nextInvoiceNumber: integer("next_invoice_number"),
	nextProposalNumber: integer("next_proposal_number"),
	organizationFolderRoot: uuid("organization_folder_root").references(() => directusFolders.id, { onDelete: "set null" } ),
});

export const osTaskFiles = pgTable("os_task_files", {
	id: uuid().primaryKey(),
	osTasksId: uuid("os_tasks_id").references(() => osTasks.id, { onDelete: "cascade" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "cascade" } ),
	sort: integer(),
});

export const osTasks = pgTable("os_tasks", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("pending"),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	project: uuid().references(() => osProjects.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).default(sql`NULL`),
	description: text(),
	assignedTo: uuid("assigned_to").references(() => directusUsers.id, { onDelete: "set null" } ),
	dueDate: timestamp("due_date", { withTimezone: true }),
	isVisibleToClient: boolean("is_visible_to_client").default(false).notNull(),
	type: varchar({ length: 255 }).default("tasks").notNull(),
	dateCompleted: timestamp("date_completed", { withTimezone: true }),
	responsibility: varchar({ length: 255 }).default(sql`NULL`),
	startDate: timestamp("start_date", { withTimezone: true }),
	embedUrl: varchar("embed_url", { length: 255 }).default(sql`NULL`),
	form: uuid().references(() => forms.id, { onDelete: "set null" } ),
});

export const osTaxRates = pgTable("os_tax_rates", {
	id: uuid().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }).default(sql`NULL`),
	rate: numeric({ mode: 'number', precision: 10, scale: 5 }).default(sql`NULL`),
});

export const outlets = pgTable.withRLS("outlets", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	color: varchar({ length: 255 }),
	colortext: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	callouts: json(),
	uid: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
});

export const outletsCategories = pgTable.withRLS("outlets_categories", {
	id: serial().primaryKey(),
	outletsId: integer("outlets_id").references(() => outlets.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const outletsShorts = pgTable.withRLS("outlets_shorts", {
	id: serial().primaryKey(),
	outletsId: integer("outlets_id").references(() => outlets.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const pageBlocks = pgTable.withRLS("page_blocks", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	content: json(),
	menus: json(),
	pagesId: uuid("pages_id"),
	item: varchar({ length: 255 }).default(sql`NULL`),
	collection: varchar({ length: 255 }).default(sql`NULL`),
	hideBlock: boolean("hide_block").default(false),
});

export const pageBlocksFiles = pgTable.withRLS("page_blocks_files", {
	id: serial().primaryKey(),
	pageBlocksId: integer("page_blocks_id").references(() => pageBlocks.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const pages = pgTable.withRLS("pages", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	content: text(),
	list: json(),
	type: varchar({ length: 255 }),
	link: varchar({ length: 255 }),
	image: uuid(),
	repeaterTextBox: json(),
	slug: varchar({ length: 255 }),
	seo: uuid().references(() => seo.id, { onDelete: "set null" } ),
	userCreated: varchar("user_created", { length: 36 }).default(sql`NULL`),
	userUpdated: varchar("user_updated", { length: 36 }).default(sql`NULL`),
});

export const pagesBlog = pgTable("pages_blog", {
	featuredPost: uuid("featured_post"),
	headline: text(),
	id: uuid().primaryKey(),
	seo: uuid().references(() => seo.id, { onDelete: "set null" } ),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const pagesProjects = pgTable("pages_projects", {
	headline: text(),
	id: uuid().primaryKey(),
	seo: uuid().references(() => seo.id, { onDelete: "set null" } ),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const payments = pgTable.withRLS("payments", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	description: text(),
	gateway: varchar({ length: 255 }),
	amount: numeric({ precision: 10, scale: 5 }),
	createdAt: timestamp("created_at"),
});

export const paymentsCountries = pgTable.withRLS("payments_countries", {
	id: serial().primaryKey(),
	paymentId: integer("payment_id").references(() => payments.id, { onDelete: "set null" } ),
	countryId: integer("country_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const paymentsCurrency = pgTable.withRLS("payments_currency", {
	id: serial().primaryKey(),
	paymentsId: integer("payments_id").references(() => payments.id, { onDelete: "set null" } ),
	currencyId: integer("currency_id").references(() => currency.id, { onDelete: "set null" } ),
});

export const paymentsDirectusUsers = pgTable.withRLS("payments_directus_users", {
	id: serial().primaryKey(),
	paymentsId: integer("payments_id").references(() => payments.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const paymentsOrders = pgTable.withRLS("payments_orders", {
	id: serial().primaryKey(),
	paymentsId: integer("payments_id").references(() => payments.id, { onDelete: "set null" } ),
	ordersId: integer("orders_id").references(() => orders.id, { onDelete: "set null" } ),
});

export const pickupLocations = pgTable.withRLS("pickup_locations", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	phone: bigint({ mode: 'number' }),
	address: varchar({ length: 255 }),
	postcode: varchar({ length: 255 }),
	pickupLocationCode: varchar("pickup_location_code", { length: 255 }),
	contactName: varchar("contact_name", { length: 255 }),
	email: varchar({ length: 255 }),
	fax: varchar({ length: 255 }),
	latitude: varchar({ length: 255 }),
	longitude: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
});

export const pickupLocationsCity = pgTable.withRLS("pickup_locations_city", {
	id: serial().primaryKey(),
	pickupLocationsId: integer("pickup_locations_id").references(() => pickupLocations.id, { onDelete: "set null" } ),
	item: varchar({ length: 255 }),
	collection: varchar({ length: 255 }),
});

export const pickupLocationsCountry = pgTable.withRLS("pickup_locations_country", {
	id: serial().primaryKey(),
	pickupLocationsId: integer("pickup_locations_id").references(() => pickupLocations.id, { onDelete: "set null" } ),
	item: varchar({ length: 255 }),
	collection: varchar({ length: 255 }),
});

export const pickupLocationsState = pgTable.withRLS("pickup_locations_state", {
	id: serial().primaryKey(),
	pickupLocationsId: integer("pickup_locations_id").references(() => pickupLocations.id, { onDelete: "set null" } ),
	item: varchar({ length: 255 }),
	collection: varchar({ length: 255 }),
});

export const platform = pgTable.withRLS("platform", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("active").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const platformArticles = pgTable.withRLS("platform_articles", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
});

export const platformCategories = pgTable.withRLS("platform_categories", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const platformLists = pgTable.withRLS("platform_lists", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const platformNavigation = pgTable.withRLS("platform_navigation", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
	navigationId: integer("navigation_id").references(() => navigation.id, { onDelete: "set null" } ),
});

export const platformPageBlocks = pgTable.withRLS("platform_page_blocks", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
	pageBlocksId: integer("page_blocks_id").references(() => pageBlocks.id, { onDelete: "set null" } ),
});

export const platformPages = pgTable.withRLS("platform_pages", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
	pagesId: integer("pages_id").references(() => pages.id, { onDelete: "set null" } ),
});

export const platformProducts = pgTable.withRLS("platform_products", {
	id: serial().primaryKey(),
	platformId: integer("platform_id").references(() => platform.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const polls = pgTable.withRLS("polls", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	slug: varchar({ length: 255 }),
	isPublic: boolean(),
	content: json(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	author: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const pollsSpaces = pgTable.withRLS("polls_spaces", {
	id: serial().primaryKey(),
	pollsId: integer("polls_id").references(() => polls.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const postGalleryItems = pgTable("post_gallery_items", {
	id: uuid().primaryKey(),
	postsId: uuid("posts_id"),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
	sort: integer(),
});

export const postgresstores = pgTable.withRLS("postgresstores", {
	id: serial().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	content: text(),
	image: uuid(),
	color: varchar({ length: 255 }),
	colortext: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
});

export const postgresstoresCollections = pgTable.withRLS("postgresstores_collections", {
	id: serial().primaryKey(),
	postgresstoresId: integer("postgresstores_id").references(() => postgresstores.id, { onDelete: "set null" } ),
	collectionsId: bigint("collections_id", { mode: 'number' }).references(() => collections.id, { onDelete: "set null" } ),
});

export const postgresstoresProducts = pgTable.withRLS("postgresstores_products", {
	id: serial().primaryKey(),
	postgresstoresId: integer("postgresstores_id").references(() => postgresstores.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const postgresstoresWebsites = pgTable.withRLS("postgresstores_websites", {
	id: serial().primaryKey(),
	postgresstoresId: integer("postgresstores_id").references(() => postgresstores.id, { onDelete: "set null" } ),
	websitesId: bigint("websites_id", { mode: 'number' }).references(() => websites.id, { onDelete: "set null" } ),
});

export const posts = pgTable.withRLS("posts", {
	id: serial().primaryKey(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	content: text(),
	file: uuid(),
	username: varchar({ length: 255 }),
	userAvatar: varchar("user_avatar", { length: 255 }),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	title: varchar({ length: 255 }),
	type: varchar({ length: 255 }).default("blog"),
	status: varchar({ length: 255 }).default("draft").notNull(),
	audio: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
	author: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	pinnedPost: boolean("pinned_post"),
	autoPublish: boolean("auto_publish"),
	mastodonId: varchar("mastodon_id", { length: 255 }),
	blskyId: varchar("blsky_id", { length: 255 }),
	targetAudience: varchar("target_audience", { length: 255 }),
	visibilityScope: varchar("visibility_scope", { length: 255 }),
	linkPreview: json("link_preview"),
	contentType: varchar("content_type", { length: 255 }),
	views: integer(),
	category: uuid(),
	datePublished: timestamp("date_published"),
	dateUpdated: timestamp("date_updated"),
	seo: uuid().references(() => seo.id, { onDelete: "set null" } ),
	sort: integer(),
	summary: text(),
	userUpdated: varchar("user_updated", { length: 36 }).default(sql`NULL`),
	client: varchar({ length: 255 }).default(sql`NULL`),
	cost: varchar({ length: 255 }).default(sql`NULL`),
	builtWith: json("built_with"),
	videoUrl: varchar("video_url", { length: 255 }).default(sql`NULL`),
	gallery: jsonb().default([]).notNull(),
});

export const postsDepartments = pgTable("posts_departments", {
	id: serial().primaryKey(),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const postsPolls = pgTable.withRLS("posts_polls", {
	id: serial().primaryKey(),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
	pollsId: integer("polls_id").references(() => polls.id, { onDelete: "set null" } ),
});

export const productAttributes = pgTable.withRLS("product_attributes", {
	id: serial().primaryKey(),
	productId: bigint("product_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	attributeId: integer("attribute_id").references(() => attributes.id, { onDelete: "set null" } ),
	value: json(),
});

export const productTypes = pgTable.withRLS("product_types", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }),
	isShippable: boolean(),
	options: json(),
});

export const productTypesProducts = pgTable.withRLS("product_types_products", {
	id: serial().primaryKey(),
	productTypesId: integer("product_types_id").references(() => productTypes.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const products = pgTable.withRLS("products", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	sku: bigint({ mode: 'number' }),
	name: text(),
	taxClass: text("tax_class"),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	content: text(),
	partNumber: text("part_number"),
	file: uuid(),
	image: uuid(),
	visibility: boolean(),
	stock: integer(),
	rating: integer(),
	salableQuantity: bigint("salable_quantity", { mode: 'number' }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	status: varchar({ length: 255 }),
	price: numeric({ precision: 10, scale: 5 }),
	ratings: varchar({ length: 255 }).default("0"),
	uuid: uuid().defaultRandom(),
});

export const productsAttributes = pgTable.withRLS("products_attributes", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	attributesId: integer("attributes_id").references(() => attributes.id, { onDelete: "set null" } ),
});

export const productsCategories = pgTable.withRLS("products_categories", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const productsCountries = pgTable.withRLS("products_countries", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id"),
});

export const productsCurrency = pgTable.withRLS("products_currency", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	currencyId: integer("currency_id").references(() => currency.id, { onDelete: "set null" } ),
});

export const productsDepartments = pgTable.withRLS("products_departments", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const productsDirectusUsers = pgTable.withRLS("products_directus_users", {
	id: serial().primaryKey(),
	productId: bigint("product_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	userId: uuid("user_id"),
});

export const productsManufacturer = pgTable.withRLS("products_manufacturer", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	manufacturerId: bigint("manufacturer_id", { mode: 'number' }).references(() => manufacturer.id, { onDelete: "set null" } ),
});

export const productsProductDesigner = pgTable.withRLS("products_product_designer", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	item: varchar({ length: 255 }),
	collection: varchar({ length: 255 }),
});

export const productsSpaces = pgTable.withRLS("products_spaces", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const productsTags = pgTable.withRLS("products_tags", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
});

export const productsWebsites = pgTable.withRLS("products_websites", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	websitesId: bigint("websites_id", { mode: 'number' }).references(() => websites.id, { onDelete: "set null" } ),
});

export const profiles = pgTable.withRLS("profiles", {
	id: uuid().primaryKey().references(() => usersInAuth.id, { onDelete: "cascade" } ),
	username: text(),
	birthDate: date("birth_date"),
	description: text(),
	slug: varchar({ length: 255 }).default(sql`NULL`),
	company: varchar({ length: 255 }),
	activitypubHandle: varchar("activitypub_handle", { length: 255 }),
	dropshippingPartnerId: varchar("dropshipping_partner_id", { length: 255 }),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	commerceAuthId: varchar("commerce_auth_id", { length: 255 }),
	cmsAuthId: varchar("cms_auth_id", { length: 255 }),
	keycloakId: varchar("keycloak_id", { length: 255 }),
	supabaseUserId: uuid("supabase_user_id"),
	role: uuid().references(() => directusRoles.id, { onDelete: "set null" } ),
	sellerRequested: boolean("seller_requested"),
	sellerApproved: boolean("seller_approved"),
	position: varchar({ length: 255 }),
	links: json(),
	magentoCustomerId: varchar("magento_customer_id", { length: 255 }),
	avatar: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
}, (table) => [
	index("profiles_supabase_user_id_index").using("btree", table.supabaseUserId.asc().nullsLast()),
	unique("profiles_slug_unique").on(table.slug),	unique("profiles_supabase_user_id_unique").on(table.supabaseUserId),	unique("profiles_user_unique").on(table.user),	unique("profiles_username_unique").on(table.username),]);

export const profilesCities = pgTable.withRLS("profiles_cities", {
	id: serial().primaryKey(),
	profilesId: uuid("profiles_id").references(() => profiles.id, { onDelete: "set null" } ),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const profilesCountries = pgTable.withRLS("profiles_countries", {
	id: serial().primaryKey(),
	profilesId: uuid("profiles_id").references(() => profiles.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const profilesFollowers = pgTable.withRLS("profiles_followers", {
	id: serial().primaryKey(),
	profilesId: uuid("profiles_id").references(() => profiles.id, { onDelete: "set null" } ),
	followersId: integer("followers_id").references(() => followers.id, { onDelete: "set null" } ),
});

export const profilesStates = pgTable.withRLS("profiles_states", {
	id: serial().primaryKey(),
	profilesId: uuid("profiles_id").references(() => profiles.id, { onDelete: "set null" } ),
	statesId: integer("states_id").references(() => states.id, { onDelete: "set null" } ),
});

export const projectBoard = pgTable.withRLS("project_board", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	cards: json(),
	progress: integer(),
	customFields: json("custom_fields"),
});

export const projectBoardComments = pgTable.withRLS("project_board_comments", {
	id: serial().primaryKey(),
	projectBoardId: integer("project_board_id").references(() => projectBoard.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const projectBoardDirectusUsers = pgTable.withRLS("project_board_directus_users", {
	id: serial().primaryKey(),
	projectBoardId: integer("project_board_id").references(() => projectBoard.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const projectBoardFiles = pgTable.withRLS("project_board_files", {
	id: serial().primaryKey(),
	projectBoardId: integer("project_board_id").references(() => projectBoard.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const projectBoardProjects = pgTable.withRLS("project_board_projects", {
	id: serial().primaryKey(),
	projectBoardId: integer("project_board_id").references(() => projectBoard.id, { onDelete: "set null" } ),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
});

export const projectTimeline = pgTable.withRLS("project_timeline", {
	id: serial().primaryKey(),
	stage: json(),
});

export const projects = pgTable.withRLS("projects", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	dueDate: timestamp("due_date"),
	priority: varchar({ length: 255 }),
	budget: integer(),
	spend: integer(),
	difference: integer(),
	estimatedTime: time("estimated_time"),
	icon: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	slug: varchar({ length: 255 }),
	customFields: json("custom_fields"),
	name: varchar({ length: 255 }),
	taskName: json("task_name"),
	gantt: json(),
});

export const projectsCalendar = pgTable.withRLS("projects_calendar", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	calendarId: integer("calendar_id").references(() => calendar.id, { onDelete: "set null" } ),
});

export const projectsComments = pgTable.withRLS("projects_comments", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const projectsDirectusUsers = pgTable.withRLS("projects_directus_users", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const projectsFiles = pgTable.withRLS("projects_files", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const projectsIntegrations = pgTable.withRLS("projects_integrations", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	integrationsId: integer("integrations_id").references(() => integrations.id, { onDelete: "set null" } ),
});

export const projectsLists = pgTable.withRLS("projects_lists", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const projectsProducts = pgTable.withRLS("projects_products", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const projectsProjectTimeline = pgTable.withRLS("projects_project_timeline", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	projectTimelineId: integer("project_timeline_id").references(() => projectTimeline.id, { onDelete: "set null" } ),
});

export const projectsRegion = pgTable.withRLS("projects_region", {
	id: serial().primaryKey(),
	projectsId: integer("projects_id").references(() => projects.id, { onDelete: "set null" } ),
	regionId: integer("region_id").references(() => region.id, { onDelete: "set null" } ),
});

export const radios = pgTable.withRLS("radios", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	format: varchar({ length: 255 }),
	satellite: varchar({ length: 255 }),
	internet: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	file: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	creator: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
});

export const radiosCategories = pgTable.withRLS("radios_categories", {
	id: serial().primaryKey(),
	radiosId: integer("radios_id").references(() => radios.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const radiosDepartments = pgTable.withRLS("radios_departments", {
	id: serial().primaryKey(),
	radiosId: integer("radios_id").references(() => radios.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const radiosMusicchart = pgTable.withRLS("radios_musicchart", {
	id: serial().primaryKey(),
	radiosId: integer("radios_id").references(() => radios.id, { onDelete: "set null" } ),
});

export const ratings = pgTable.withRLS("ratings", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const ratingsProducts = pgTable.withRLS("ratings_products", {
	id: serial().primaryKey(),
	ratingsId: integer("ratings_id").references(() => ratings.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const reactions = pgTable.withRLS("reactions", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	contentId: varchar("content_id", { length: 255 }),
	contentType: varchar("content_type", { length: 255 }),
	posts: integer().references(() => posts.id, { onDelete: "set null" } ),
	userId: uuid("user_id").references(() => directusUsers.id, { onDelete: "set null" } ),
	listId: integer("list_id").references(() => lists.id, { onDelete: "set null" } ),
	spaceId: integer("space_id").references(() => spaces.id, { onDelete: "set null" } ),
	videoId: integer("video_id").references(() => videos.id, { onDelete: "set null" } ),
	product: bigint({ mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	counter: integer(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	name: varchar({ length: 255 }),
	icon: varchar({ length: 255 }),
	targetType: varchar("target_type", { length: 255 }),
	interactionType: varchar("interaction_type", { length: 255 }),
	reactionType: varchar("reaction_type", { length: 255 }),
});

export const reactionsComments = pgTable.withRLS("reactions_comments", {
	id: serial().primaryKey(),
	reactionsId: integer("reactions_id").references(() => reactions.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const reactionsDirectusUsers = pgTable.withRLS("reactions_directus_users", {
	id: serial().primaryKey(),
	reactionId: integer("reaction_id").references(() => reactions.id, { onDelete: "set null" } ),
	userId: uuid("user_id"),
});

export const reactionsLists = pgTable.withRLS("reactions_lists", {
	id: serial().primaryKey(),
	reactionsId: integer("reactions_id").references(() => reactions.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const reactionsPosts = pgTable.withRLS("reactions_posts", {
	id: serial().primaryKey(),
	reactionsId: integer("reactions_id").references(() => reactions.id, { onDelete: "set null" } ),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const reactionsShorts = pgTable.withRLS("reactions_shorts", {
	id: serial().primaryKey(),
	reactionsId: integer("reactions_id").references(() => reactions.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const redirects = pgTable.withRLS("redirects", {
	id: serial().primaryKey(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	responseCode: integer("response_code"),
	urlNew: varchar("url_new", { length: 255 }),
	urlOld: varchar("url_old", { length: 255 }),
	noticeRedirects: varchar("notice_redirects", { length: 255 }),
});

export const region = pgTable.withRLS("region", {
	id: serial().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	regionId: integer("region_id"),
	name: varchar({ length: 255 }),
	code: varchar({ length: 255 }),
	description: text(),
	slug: varchar({ length: 255 }),
});

export const regionAddress = pgTable.withRLS("region_address", {
	id: serial().primaryKey(),
	regionId: integer("region_id").references(() => region.id, { onDelete: "set null" } ),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
});

export const regionCountries = pgTable.withRLS("region_countries", {
	id: serial().primaryKey(),
	regionId: integer("region_id").references(() => region.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const regionShippingAddress = pgTable.withRLS("region_shipping_address", {
	id: serial().primaryKey(),
	regionId: integer("region_id").references(() => region.id, { onDelete: "set null" } ),
	shippingAddressId: integer("shipping_address_id").references(() => shippingAddress.id, { onDelete: "set null" } ),
});

export const relatedProducts = pgTable.withRLS("related_products", {
	id: serial().primaryKey(),
	sort: integer(),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const relatedProductsProducts = pgTable.withRLS("related_products_products", {
	id: serial().primaryKey(),
	relatedProductsId: integer("related_products_id").references(() => relatedProducts.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const report = pgTable.withRLS("report", {
	id: serial().primaryKey(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	title: varchar({ length: 255 }),
	content: text(),
	url: varchar({ length: 255 }),
	rating: integer(),
});

export const reportComments = pgTable.withRLS("report_comments", {
	id: serial().primaryKey(),
	reportId: integer("report_id").references(() => report.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const reportDirectusUsers = pgTable.withRLS("report_directus_users", {
	id: serial().primaryKey(),
	reportId: integer("report_id").references(() => report.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id"),
});

export const reportFaqs = pgTable.withRLS("report_faqs", {
	id: serial().primaryKey(),
	reportId: integer("report_id").references(() => report.id, { onDelete: "set null" } ),
	faqsId: integer("faqs_id").references(() => faqs.id, { onDelete: "set null" } ),
});

export const reportPosts = pgTable.withRLS("report_posts", {
	id: serial().primaryKey(),
	reportId: integer("report_id").references(() => report.id, { onDelete: "set null" } ),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const reportProducts = pgTable.withRLS("report_products", {
	id: serial().primaryKey(),
	reportId: integer("report_id").references(() => report.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const reportSpaces = pgTable.withRLS("report_spaces", {
	id: serial().primaryKey(),
	reportId: integer("report_id").references(() => report.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const returns = pgTable.withRLS("returns", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	returnNumber: uuid("return_number"),
	reason: text(),
});

export const returnsOrders = pgTable.withRLS("returns_orders", {
	id: serial().primaryKey(),
	returnsId: integer("returns_id").references(() => returns.id, { onDelete: "set null" } ),
	ordersId: integer("orders_id").references(() => orders.id, { onDelete: "set null" } ),
});

export const returnsProducts = pgTable.withRLS("returns_products", {
	id: serial().primaryKey(),
	returnsId: integer("returns_id").references(() => returns.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const reviewsProducts = pgTable.withRLS("reviews_products", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const seasons = pgTable.withRLS("seasons", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	description: text(),
	releaseDate: timestamp("release_date"),
	number: integer(),
	name: integer().references(() => videos.id, { onDelete: "set null" } ),
});

export const seasonsVideos = pgTable.withRLS("seasons_videos", {
	id: serial().primaryKey(),
	seasonsId: integer("seasons_id").references(() => seasons.id, { onDelete: "set null" } ),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
});

export const seo = pgTable("seo", {
	canonicalUrl: varchar("canonical_url", { length: 255 }).default(sql`NULL`),
	id: uuid().primaryKey(),
	metaDescription: text("meta_description"),
	noFollow: boolean("no_follow").default(false),
	noIndex: boolean("no_index").default(false),
	sitemapChangeFrequency: varchar("sitemap_change_frequency", { length: 255 }).default("hourly"),
	sitemapPriority: real("sitemap_priority").default(0.5),
	title: varchar({ length: 255 }).default(sql`NULL`),
});

export const shipment = pgTable.withRLS("shipment", {
	id: serial().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	emailSent: integer("email_sent"),
	user: uuid(),
	order: integer().references(() => orders.id, { onDelete: "set null" } ),
	shipmentStatus: varchar("shipment_status", { length: 255 }),
	shippingLabel: varchar("shipping_label", { length: 255 }),
	storeId: integer("store_id"),
	totalQty: integer("total_qty"),
	totalWeight: integer("total_weight"),
	code: varchar({ length: 255 }),
	cost: integer(),
	deliveryTime: varchar("delivery_time", { length: 255 }),
	deliveryWindow: varchar("delivery_window", { length: 255 }),
	carrierMatrix: json("carrier_matrix"),
});

export const shipmentAddress = pgTable.withRLS("shipment_address", {
	id: serial().primaryKey(),
	shipmentId: integer("shipment_id").references(() => shipment.id, { onDelete: "set null" } ),
	addressId: integer("address_id").references(() => address.id, { onDelete: "set null" } ),
});

export const shipmentComments = pgTable.withRLS("shipment_comments", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	parentId: integer("parent_id").references(() => shipment.id, { onDelete: "set null" } ),
	comment: text(),
	entityId: integer("entity_id"),
	isCustomerNotified: varchar("is_customer_notified", { length: 255 }),
});

export const shipmentProducts = pgTable.withRLS("shipment_products", {
	id: serial().primaryKey(),
	shipmentId: integer("shipment_id").references(() => shipment.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const shipmentTracking = pgTable.withRLS("shipment_tracking", {
	id: serial().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	entityId: integer("entity_id"),
	weight: integer(),
	qty: integer(),
	description: text(),
	trackNumber: integer("track_number"),
	title: varchar({ length: 255 }),
	carrierCode: varchar("carrier_code", { length: 255 }),
	parentId: integer("parent_id").references(() => shipment.id, { onDelete: "set null" } ),
});

export const shippingAddress = pgTable.withRLS("shipping_address", {
	id: serial().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	customerId: integer("customer_id"),
	regionId: integer("region_id"),
	countryId: text("country_id"),
	street: text(),
	company: text(),
	telephone: text(),
	fax: text(),
	postcode: text(),
	city: text(),
	firstname: text(),
	lastname: text(),
	middlename: text(),
	prefix: text(),
	suffix: text(),
	vatId: text("vat_id"),
	defaultShipping: boolean("default_shipping"),
	defaultBilling: boolean("default_billing"),
});

export const shippingAddresses = pgTable.withRLS("shipping_addresses", {
	id: serial().primaryKey(),
	street: varchar({ length: 255 }),
	zipcode: varchar({ length: 255 }),
	phone: varchar({ length: 255 }),
});

export const shippingAddressesCities = pgTable.withRLS("shipping_addresses_cities", {
	id: serial().primaryKey(),
	shippingAddressesId: integer("shipping_addresses_id").references(() => shippingAddresses.id, { onDelete: "set null" } ),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const shippingAddressesCountries = pgTable.withRLS("shipping_addresses_countries", {
	id: serial().primaryKey(),
	shippingAddressesId: integer("shipping_addresses_id").references(() => shippingAddresses.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const shippingAddressesDirectusUsers = pgTable.withRLS("shipping_addresses_directus_users", {
	id: serial().primaryKey(),
	shippingAddressesId: integer("shipping_addresses_id").references(() => shippingAddresses.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const shippingAddressesOrders = pgTable.withRLS("shipping_addresses_orders", {
	id: serial().primaryKey(),
	shippingAddressesId: integer("shipping_addresses_id").references(() => shippingAddresses.id, { onDelete: "set null" } ),
	ordersId: integer("orders_id").references(() => orders.id, { onDelete: "set null" } ),
});

export const shippingAddressesStates = pgTable.withRLS("shipping_addresses_states", {
	id: serial().primaryKey(),
	shippingAddressesId: integer("shipping_addresses_id").references(() => shippingAddresses.id, { onDelete: "set null" } ),
	statesId: integer("states_id").references(() => states.id, { onDelete: "set null" } ),
});

export const shopType = pgTable.withRLS("shop_type", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
});

export const shopTypeShops = pgTable.withRLS("shop_type_shops", {
	id: serial().primaryKey(),
	shopTypeId: integer("shop_type_id").references(() => shopType.id, { onDelete: "set null" } ),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
});

export const shops = pgTable.withRLS("shops", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	content: text(),
	website: varchar({ length: 255 }),
	type: json(),
	address: text(),
	rating: integer(),
	image: uuid(),
	description: text(),
	slug: varchar({ length: 255 }),
	phone: varchar({ length: 255 }),
	shippingPolicy: text("shipping_policy"),
	policies: json(),
	foodOffered: varchar("food_offered", { length: 255 }),
	customDomain: varchar("custom_domain", { length: 255 }),
	theme: json(),
	trustedScore: json("trusted_score"),
});

export const shopsAgreements = pgTable.withRLS("shops_agreements", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
});

export const shopsCategories = pgTable.withRLS("shops_categories", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const shopsComments = pgTable.withRLS("shops_comments", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const shopsCountries = pgTable.withRLS("shops_countries", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const shopsDepartments = pgTable.withRLS("shops_departments", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const shopsDirectusUsers = pgTable.withRLS("shops_directus_users", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id"),
});

export const shopsFiles = pgTable.withRLS("shops_files", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id"),
});

export const shopsProducts = pgTable.withRLS("shops_products", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const shopsShowcases = pgTable.withRLS("shops_showcases", {
	id: serial().primaryKey(),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
	showcasesId: integer("showcases_id").references(() => showcases.id, { onDelete: "set null" } ),
});

export const shorts = pgTable.withRLS("shorts", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	videoUrl: varchar("video_url", { length: 255 }),
	duration: varchar({ length: 255 }),
	host: varchar({ length: 255 }),
	thumbnail: uuid(),
	dateTime: timestamp(),
	type: varchar({ length: 255 }),
	ageRequirement: varchar("age_requirement", { length: 255 }),
	creator: varchar({ length: 255 }),
	video: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	watchTime: varchar("watch_time", { length: 255 }),
	clickThroughRate: varchar("click_through_rate", { length: 255 }),
	conversion: varchar({ length: 255 }),
	saves: varchar({ length: 255 }),
	favorite: boolean(),
	ageGate: varchar("age_gate", { length: 255 }),
	region: varchar({ length: 255 }),
});

export const shortsDirectusUsers = pgTable.withRLS("shorts_directus_users", {
	id: serial().primaryKey(),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id"),
});

export const shortsFiles = pgTable.withRLS("shorts_files", {
	id: serial().primaryKey(),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const shortsProducts = pgTable.withRLS("shorts_products", {
	id: serial().primaryKey(),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const shortsSpaces = pgTable.withRLS("shorts_spaces", {
	id: serial().primaryKey(),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const showcases = pgTable.withRLS("showcases", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("published"),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	color: varchar({ length: 255 }),
	colortext: varchar({ length: 255 }),
	image: uuid(),
	thumbnail: uuid(),
	rating: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
	owner: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	type: varchar({ length: 255 }),
});

export const showcasesProducts = pgTable.withRLS("showcases_products", {
	id: serial().primaryKey(),
	showcasesId: integer("showcases_id").references(() => showcases.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const showcasesShops = pgTable.withRLS("showcases_shops", {
	id: serial().primaryKey(),
	showcasesId: integer("showcases_id").references(() => showcases.id, { onDelete: "set null" } ),
	shopsId: integer("shops_id").references(() => shops.id, { onDelete: "set null" } ),
});

export const showcasesSpaces = pgTable.withRLS("showcases_spaces", {
	id: serial().primaryKey(),
	showcasesId: integer("showcases_id").references(() => showcases.id, { onDelete: "set null" } ),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const sitePreferenceCategories = pgTable.withRLS("site_preference_categories", {
	id: serial().primaryKey(),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const sitePreferenceCountries = pgTable.withRLS("site_preference_countries", {
	id: serial().primaryKey(),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const sitePreferenceDepartments = pgTable.withRLS("site_preference_departments", {
	id: serial().primaryKey(),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const sitePreferenceProducts = pgTable.withRLS("site_preference_products", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const socialConnections = pgTable.withRLS("social_connections", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	user: uuid(),
	platform: varchar({ length: 255 }),
	identifier: varchar({ length: 255 }),
	credentials: json(),
	active: boolean().default(true),
});

export const space = pgTable.withRLS("Space", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated"),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid(),
	media: uuid(),
	numberOfMembers: varchar({ length: 255 }),
	groupType: varchar({ length: 255 }),
	creatorId: bigint("creator_id", { mode: 'number' }),
	slug: varchar({ length: 255 }),
});

export const spaceProducts = pgTable.withRLS("Space_products", {
	id: serial().primaryKey(),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const spaceTypes = pgTable.withRLS("space_types", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
	allowedContentTypes: json("allowed_content_types"),
	defaultTabs: json("default_tabs"),
	customTabs: json("custom_tabs"),
	description: text(),
	icon: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	componentPath: text("component_path"),
	layoutName: varchar("layout_name", { length: 255 }),
	remoteUrl: varchar("remote_url", { length: 255 }),
	enabled: boolean().default(true),
});

export const spaces = pgTable.withRLS("spaces", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	numberOfMembers: integer(),
	description: text(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	products: varchar({ length: 255 }),
	groupRules: json("group_rules"),
	owner: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	coverImage: uuid("cover_image").references(() => directusFiles.id, { onDelete: "set null" } ),
	customTabs: json("custom_tabs"),
	slug: varchar({ length: 255 }),
	customDomain: varchar("custom_domain", { length: 255 }),
	theme: json(),
	spaceAnalytics: boolean("space_analytics"),
	federationEnabled: boolean("federation_enabled"),
	defaultLanguage: varchar("default_language", { length: 255 }),
	inviteOnly: boolean("invite_only"),
	badgesEnabled: boolean("badges_enabled"),
	rss: json(),
	isShop: boolean("is_shop"),
	address: varchar({ length: 255 }),
	rating: integer(),
	shippingPolicy: text("shipping_policy"),
	trustedScore: varchar("trusted_score", { length: 255 }),
	menu: json(),
});

export const spacesArticles = pgTable.withRLS("spaces_articles", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
});

export const spacesCities = pgTable.withRLS("spaces_cities", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const spacesCountries = pgTable.withRLS("spaces_countries", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const spacesDepartments = pgTable("spaces_departments", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const spacesDirectusUsers = pgTable.withRLS("spaces_directus_users", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id").references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const spacesFiles = pgTable.withRLS("spaces_files", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	directusFilesId: uuid("directus_files_id").references(() => directusFiles.id, { onDelete: "set null" } ),
});

export const spacesLists = pgTable.withRLS("spaces_lists", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	listsId: integer("lists_id").references(() => lists.id, { onDelete: "set null" } ),
});

export const spacesLiveRooms = pgTable.withRLS("spaces_live_rooms", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
});

export const spacesMetaSpace = pgTable.withRLS("spaces_meta_Space", {
	id: serial().primaryKey(),
});

export const spacesPages = pgTable("spaces_pages", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	pagesId: integer("pages_id").references(() => pages.id, { onDelete: "set null" } ),
});

export const spacesPosts = pgTable.withRLS("spaces_posts", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const spacesShopType = pgTable.withRLS("spaces_shop_type", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	shopTypeId: integer("shop_type_id").references(() => shopType.id, { onDelete: "set null" } ),
});

export const spacesSpaceTypes = pgTable.withRLS("spaces_space_types", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	spaceTypesId: integer("space_types_id").references(() => spaceTypes.id, { onDelete: "set null" } ),
});

export const spacesStates = pgTable.withRLS("spaces_states", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	statesId: integer("states_id").references(() => states.id, { onDelete: "set null" } ),
});

export const spacesTags = pgTable.withRLS("spaces_tags", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
});

export const spacesTemplates = pgTable.withRLS("spaces_templates", {
	id: serial().primaryKey(),
	spacesId: integer("spaces_id").references(() => spaces.id, { onDelete: "set null" } ),
	templatesId: integer("templates_id").references(() => templates.id, { onDelete: "set null" } ),
});

export const states = pgTable.withRLS("states", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }),
	countryCode: varchar("country_code", { length: 255 }),
	fipsCode: varchar("fips_code", { length: 255 }),
	iso2: varchar({ length: 255 }),
	latitude: numeric({ precision: 10, scale: 5 }),
	longitude: numeric({ precision: 10, scale: 5 }),
	flag: integer(),
	wikiDataId: varchar({ length: 255 }),
	countryId: varchar("country_id", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const statesCities = pgTable.withRLS("states_cities", {
	id: serial().primaryKey(),
	statesId: integer("states_id").references(() => states.id, { onDelete: "set null" } ),
	citiesId: integer("cities_id").references(() => cities.id, { onDelete: "set null" } ),
});

export const statesCountries = pgTable.withRLS("states_countries", {
	id: serial().primaryKey(),
	countriesId: integer("countries_id"),
});

export const streams = pgTable.withRLS("streams", {
	id: serial().primaryKey(),
	streamId: integer("stream_id").references(() => videos.id, { onDelete: "set null" } ),
	streamDate: timestamp("stream_date", { withTimezone: true }),
	streamDuration: varchar("stream_duration", { length: 255 }),
	streamTime: varchar("stream_time", { length: 255 }),
});

export const streamsRatings = pgTable.withRLS("streams_ratings", {
	id: serial().primaryKey(),
	streamsId: integer("streams_id").references(() => streams.id, { onDelete: "set null" } ),
	ratingsId: integer("ratings_id").references(() => ratings.id, { onDelete: "set null" } ),
});

export const subscriptions = pgTable.withRLS("subscriptions", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	subscriptionNumber: uuid("subscription_number"),
	startDate: date("start_date"),
	endDate: date("end_date"),
});

export const subscriptionsDirectusUsers = pgTable.withRLS("subscriptions_directus_users", {
	id: serial().primaryKey(),
	subscriptionsId: integer("subscriptions_id").references(() => subscriptions.id, { onDelete: "set null" } ),
	directusUsersId: uuid("directus_users_id"),
});

export const subscriptionsProducts = pgTable.withRLS("subscriptions_products", {
	id: serial().primaryKey(),
	subscriptionsId: integer("subscriptions_id").references(() => subscriptions.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const tags = pgTable.withRLS("tags", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	name: varchar({ length: 255 }),
	description: text(),
	image: uuid(),
	slug: varchar({ length: 255 }),
});

export const tagsArticles = pgTable.withRLS("tags_articles", {
	id: serial().primaryKey(),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
	articlesId: integer("articles_id").references(() => articles.id, { onDelete: "set null" } ),
});

export const tagsCategories = pgTable.withRLS("tags_categories", {
	id: serial().primaryKey(),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const tagsDepartments = pgTable.withRLS("tags_departments", {
	id: serial().primaryKey(),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const tagsPosts = pgTable.withRLS("tags_posts", {
	id: serial().primaryKey(),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const tagsProducts = pgTable.withRLS("tags_products", {
	id: serial().primaryKey(),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const tagsShorts = pgTable.withRLS("tags_shorts", {
	id: serial().primaryKey(),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
	shortsId: integer("shorts_id").references(() => shorts.id, { onDelete: "set null" } ),
});

export const taxes = pgTable.withRLS("taxes", {
	id: serial().primaryKey(),
	rate: numeric({ precision: 10, scale: 5 }),
	taxClass: varchar("tax_class", { length: 255 }),
	certifications: json(),
	ageGating: varchar("age_gating", { length: 255 }),
});

export const taxesCountries = pgTable.withRLS("taxes_countries", {
	id: serial().primaryKey(),
	taxesId: integer("taxes_id").references(() => taxes.id, { onDelete: "set null" } ),
	countriesId: integer("countries_id").references(() => countries.id, { onDelete: "set null" } ),
});

export const taxesStates = pgTable.withRLS("taxes_states", {
	id: serial().primaryKey(),
	taxesId: integer("taxes_id").references(() => taxes.id, { onDelete: "set null" } ),
	statesId: integer("states_id").references(() => states.id, { onDelete: "set null" } ),
});

export const team = pgTable("team", {
	bio: text(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	id: uuid().primaryKey(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	jobTitle: varchar("job_title", { length: 255 }).default(sql`NULL`),
	name: varchar({ length: 255 }).default(sql`NULL`),
	socialMedia: json("social_media"),
	sort: integer(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
});

export const templates = pgTable.withRLS("templates", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	title: varchar({ length: 255 }),
	description: text(),
	defaultTabs: varchar("default_tabs", { length: 255 }),
	defaultTypes: varchar("default_types", { length: 255 }),
	defaultRoles: varchar("default_roles", { length: 255 }),
	defaultContent: varchar("default_content", { length: 255 }),
	theme: json(),
	templateType: varchar("template_type", { length: 255 }),
});

export const templatesSpaceTypes = pgTable.withRLS("templates_space_types", {
	id: serial().primaryKey(),
	templatesId: integer("templates_id").references(() => templates.id, { onDelete: "set null" } ),
	spaceTypesId: integer("space_types_id").references(() => spaceTypes.id, { onDelete: "set null" } ),
});

export const testimonials = pgTable("testimonials", {
	company: varchar({ length: 255 }).default(sql`NULL`),
	companyLogo: uuid("company_logo").references(() => directusFiles.id, { onDelete: "set null" } ),
	content: text(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	id: uuid().primaryKey(),
	image: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	link: varchar({ length: 255 }).default(sql`NULL`),
	sort: integer(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	subtitle: varchar({ length: 255 }).default(sql`NULL`),
	title: varchar({ length: 255 }).default(sql`NULL`),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
});

export const timezones = pgTable.withRLS("timezones", {
	id: serial().primaryKey(),
	name: varchar({ length: 255 }),
	code: varchar({ length: 255 }),
	description: text(),
});

export const transactions = pgTable.withRLS("transactions", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	status: varchar({ length: 255 }).default("open"),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	order: integer().references(() => orders.id, { onDelete: "set null" } ),
	paymentMethod: varchar("payment_method", { length: 255 }),
	transactionsParentId: varchar("transactions_parent_id", { length: 255 }),
	type: varchar({ length: 255 }),
	amount: numeric({ precision: 10, scale: 5 }),
});

export const transactionsCurrency = pgTable.withRLS("transactions_currency", {
	id: serial().primaryKey(),
	transactionsId: bigint("transactions_id", { mode: 'number' }).references(() => transactions.id, { onDelete: "set null" } ),
	currencyId: integer("currency_id").references(() => currency.id, { onDelete: "set null" } ),
});

export const translations = pgTable.withRLS("translations", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	name: varchar({ length: 255 }),
	url: varchar({ length: 255 }),
	image: uuid(),
	code: varchar({ length: 255 }),
});

export const translationsPostgresstores = pgTable.withRLS("translations_postgresstores", {
	id: serial().primaryKey(),
	translationsId: integer("translations_id").references(() => translations.id, { onDelete: "set null" } ),
	postgresstoresId: integer("postgresstores_id").references(() => postgresstores.id, { onDelete: "set null" } ),
});

export const userContentInteraction = pgTable.withRLS("user_content_interaction", {
	id: serial().primaryKey(),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	interactionType: varchar("interaction_type", { length: 255 }),
});

export const userFriends = pgTable.withRLS("user_friends", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	friend: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { withTimezone: true }),
	relation: json(),
});

export const userFriendsPosts = pgTable.withRLS("user_friends_posts", {
	id: serial().primaryKey(),
	userFriendsId: integer("user_friends_id").references(() => userFriends.id, { onDelete: "set null" } ),
	postsId: integer("posts_id").references(() => posts.id, { onDelete: "set null" } ),
});

export const userProfile = pgTable.withRLS("user_profile", {
	id: serial().primaryKey(),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	displayName: varchar("display_name", { length: 255 }),
	bio: text(),
	avatar: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	location: varchar({ length: 255 }),
	socials: json(),
	store: varchar({ length: 255 }),
	age: integer(),
});

export const variants = pgTable.withRLS("variants", {
	id: serial().primaryKey(),
	productId: integer("product_id").references(() => products.id, { onDelete: "cascade" } ),
	sku: text(),
	optionsJson: jsonb("options_json"),
	price: numeric(),
	cost: numeric(),
	barcode: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	productUuid: uuid("product_uuid"),
});

export const vibezClips = pgTable.withRLS("vibez_clips", {
	id: serial().primaryKey(),
	creatorId: integer("creator_id"),
	mediaUrl: text("media_url"),
	duration: integer(),
	captions: text(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const vibezProductMap = pgTable.withRLS("vibez_product_map", {
	clipId: integer("clip_id").notNull().references(() => vibezClips.id, { onDelete: "cascade" } ),
	productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
}, (table) => [
	primaryKey({ columns: [table.clipId, table.productId], name: "vibez_product_map_pkey"}),
]);

export const videos = pgTable.withRLS("videos", {
	id: serial().primaryKey(),
	status: varchar({ length: 255 }).default("draft").notNull(),
	sort: integer(),
	userCreated: uuid("user_created").references(() => directusUsers.id),
	dateCreated: timestamp("date_created", { withTimezone: true }),
	userUpdated: uuid("user_updated").references(() => directusUsers.id),
	dateUpdated: timestamp("date_updated", { withTimezone: true }),
	type: varchar({ length: 255 }),
	description: text(),
	ratings: integer().references(() => ratings.id, { onDelete: "set null" } ),
	name: varchar({ length: 255 }),
	media: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	thumbnail: uuid().references(() => directusFiles.id, { onDelete: "set null" } ),
	videoUrl: varchar("video_url", { length: 255 }),
	user: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
	minioKey: varchar("minio_key", { length: 255 }),
	duration: varchar({ length: 255 }),
	visibility: varchar({ length: 255 }),
	viewCount: integer("view_count"),
	distributor: integer().references(() => attributes.id, { onDelete: "set null" } ),
});

export const videosCategories = pgTable.withRLS("videos_categories", {
	id: serial().primaryKey(),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
	categoriesId: integer("categories_id").references(() => categories.id, { onDelete: "set null" } ),
});

export const videosComments = pgTable.withRLS("videos_comments", {
	id: serial().primaryKey(),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
	commentsId: integer("comments_id").references(() => comments.id, { onDelete: "set null" } ),
});

export const videosDepartments = pgTable.withRLS("videos_departments", {
	id: serial().primaryKey(),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
	departmentsId: integer("departments_id").references(() => departments.id, { onDelete: "set null" } ),
});

export const videosManufacturer = pgTable.withRLS("videos_manufacturer", {
	id: serial().primaryKey(),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
	manufacturerId: bigint("manufacturer_id", { mode: 'number' }).references(() => manufacturer.id, { onDelete: "set null" } ),
});

export const videosProductTypes = pgTable.withRLS("videos_product_types", {
	id: serial().primaryKey(),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
	productTypesId: integer("product_types_id").references(() => productTypes.id, { onDelete: "set null" } ),
});

export const videosProducts = pgTable.withRLS("videos_products", {
	id: serial().primaryKey(),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
	productsId: bigint("products_id", { mode: 'number' }).references(() => products.id, { onDelete: "set null" } ),
});

export const videosTags = pgTable.withRLS("videos_tags", {
	id: serial().primaryKey(),
	videosId: integer("videos_id").references(() => videos.id, { onDelete: "set null" } ),
	tagsId: integer("tags_id").references(() => tags.id, { onDelete: "set null" } ),
});

export const websites = pgTable.withRLS("websites", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`),
	name: text(),
	url: text(),
	image: uuid(),
	type: varchar({ length: 255 }),
	slug: varchar({ length: 255 }),
	icon: varchar({ length: 255 }),
	status: varchar({ length: 255 }),
	note: text(),
	username: varchar({ length: 255 }),
	description: text(),
	creator: uuid().references(() => directusUsers.id, { onDelete: "set null" } ),
});

export const messagesInRealtime = realtime.table.withRLS("messages", {
	topic: text().notNull(),
	extension: text().notNull(),
	payload: jsonb(),
	event: text(),
	private: boolean().default(false),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	insertedAt: timestamp("inserted_at").default(sql`now()`).notNull(),
	id: uuid().defaultRandom().notNull(),
	binaryPayload: customType({ dataType: () => 'bytea' })("binary_payload"),
}, (table) => [
	primaryKey({ columns: [table.id, table.insertedAt], name: "messages_pkey"}),

	pgPolicy("Allow listening for broadcasts for authenticated users only", { for: "select", to: ["authenticated"], using: sql`(extension = 'broadcast'::text)` }),

	pgPolicy("Allow listening for broadcasts from a specific channel", { for: "select", using: sql`((extension = 'broadcast'::text) AND (realtime.topic() = 'channel_name'::text))` }),

	pgPolicy("Allow listening for presences from a specific channel", { for: "select", using: sql`((extension = 'presence'::text) AND (realtime.topic() = 'channel_name'::text))` }),

	pgPolicy("Allow listening for presences on all channels for authenticated", { for: "select", to: ["authenticated"], using: sql`(extension = 'presence'::text)` }),

	pgPolicy("Allow pushing broadcasts for authenticated users only", { for: "insert", to: ["authenticated"], withCheck: sql`(extension = 'broadcast'::text)` }),

	pgPolicy("Allow pushing broadcasts to specific channel", { for: "insert", withCheck: sql`((extension = 'broadcast'::text) AND (realtime.topic() = 'channel_name'::text))` }),

	pgPolicy("Publish presence to a specific channel", { for: "insert", withCheck: sql`((extension = 'presence'::text) AND (realtime.topic() = 'channel_name'::text))` }),
check("messages_payload_exclusive", sql`((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI`),]);

export const messages20250207InRealtime = realtime.table("messages_2025_02_07", {
	topic: text().notNull(),
	extension: text().notNull(),
	payload: jsonb(),
	event: text(),
	private: boolean().default(false),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	insertedAt: timestamp("inserted_at").default(sql`now()`).notNull(),
	id: uuid().defaultRandom().notNull(),
	binaryPayload: customType({ dataType: () => 'bytea' })("binary_payload"),
}, (table) => [
	primaryKey({ columns: [table.id, table.insertedAt], name: "messages_2025_02_07_pkey"}),
	index("messages_2025_02_07_inserted_at_topic_idx").using("btree", table.insertedAt.desc().nullsFirst(), table.topic.asc().nullsLast()).where(sql`((extension = 'broadcast'::text) AND (private IS TRUE))`),
check("messages_payload_exclusive", sql`((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI`),]);

export const messages20250208InRealtime = realtime.table("messages_2025_02_08", {
	topic: text().notNull(),
	extension: text().notNull(),
	payload: jsonb(),
	event: text(),
	private: boolean().default(false),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	insertedAt: timestamp("inserted_at").default(sql`now()`).notNull(),
	id: uuid().defaultRandom().notNull(),
	binaryPayload: customType({ dataType: () => 'bytea' })("binary_payload"),
}, (table) => [
	primaryKey({ columns: [table.id, table.insertedAt], name: "messages_2025_02_08_pkey"}),
	index("messages_2025_02_08_inserted_at_topic_idx").using("btree", table.insertedAt.desc().nullsFirst(), table.topic.asc().nullsLast()).where(sql`((extension = 'broadcast'::text) AND (private IS TRUE))`),
check("messages_payload_exclusive", sql`((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI`),]);

export const messages20250209InRealtime = realtime.table("messages_2025_02_09", {
	topic: text().notNull(),
	extension: text().notNull(),
	payload: jsonb(),
	event: text(),
	private: boolean().default(false),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	insertedAt: timestamp("inserted_at").default(sql`now()`).notNull(),
	id: uuid().defaultRandom().notNull(),
	binaryPayload: customType({ dataType: () => 'bytea' })("binary_payload"),
}, (table) => [
	primaryKey({ columns: [table.id, table.insertedAt], name: "messages_2025_02_09_pkey"}),
	index("messages_2025_02_09_inserted_at_topic_idx").using("btree", table.insertedAt.desc().nullsFirst(), table.topic.asc().nullsLast()).where(sql`((extension = 'broadcast'::text) AND (private IS TRUE))`),
check("messages_payload_exclusive", sql`((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI`),]);

export const messages20250210InRealtime = realtime.table("messages_2025_02_10", {
	topic: text().notNull(),
	extension: text().notNull(),
	payload: jsonb(),
	event: text(),
	private: boolean().default(false),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	insertedAt: timestamp("inserted_at").default(sql`now()`).notNull(),
	id: uuid().defaultRandom().notNull(),
	binaryPayload: customType({ dataType: () => 'bytea' })("binary_payload"),
}, (table) => [
	primaryKey({ columns: [table.id, table.insertedAt], name: "messages_2025_02_10_pkey"}),
	index("messages_2025_02_10_inserted_at_topic_idx").using("btree", table.insertedAt.desc().nullsFirst(), table.topic.asc().nullsLast()).where(sql`((extension = 'broadcast'::text) AND (private IS TRUE))`),
check("messages_payload_exclusive", sql`((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI`),]);

export const messages20250211InRealtime = realtime.table("messages_2025_02_11", {
	topic: text().notNull(),
	extension: text().notNull(),
	payload: jsonb(),
	event: text(),
	private: boolean().default(false),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	insertedAt: timestamp("inserted_at").default(sql`now()`).notNull(),
	id: uuid().defaultRandom().notNull(),
	binaryPayload: customType({ dataType: () => 'bytea' })("binary_payload"),
}, (table) => [
	primaryKey({ columns: [table.id, table.insertedAt], name: "messages_2025_02_11_pkey"}),
	index("messages_2025_02_11_inserted_at_topic_idx").using("btree", table.insertedAt.desc().nullsFirst(), table.topic.asc().nullsLast()).where(sql`((extension = 'broadcast'::text) AND (private IS TRUE))`),
check("messages_payload_exclusive", sql`((payload IS NULL) OR (binary_payload IS NULL))) NOT VALI`),]);

export const schemaMigrationsInRealtime = realtime.table("schema_migrations", {
	version: bigint({ mode: 'number' }).primaryKey(),
	insertedAt: timestamp("inserted_at", { precision: 0 }),
});

export const subscriptionInRealtime = realtime.table("subscription", {
	id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	subscriptionId: uuid("subscription_id").notNull(),
	entity: customType({ dataType: () => 'regclass' })().notNull(),
	filters: customType({ dataType: () => 'realtime.user_defined_filter' })().array().default([]).notNull(),
	claims: jsonb().notNull(),
	claimsRole: customType({ dataType: () => 'regrole' })("claims_role").notNull().generatedAlwaysAs(sql`realtime.to_regrole((claims ->> 'role'::text))`),
	createdAt: timestamp("created_at").default(sql`timezone('utc'::text, now())`).notNull(),
	actionFilter: text("action_filter").default("*"),
	selectedColumns: text("selected_columns").array(),
}, (table) => [
	index("ix_realtime_subscription_entity").using("btree", table.entity.asc().nullsLast()),
	uniqueIndex("subscription_subscription_id_entity_filters_action_filter_selec").using("btree", table.subscriptionId.asc().nullsLast(), table.entity.asc().nullsLast(), table.filters.asc().nullsLast(), table.actionFilter.asc().nullsLast(), sql`COALESCE(selected_columns, '{}'::text[])`),
check("subscription_action_filter_check", sql`(action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))`),]);

export const bucketsInStorage = storage.table.withRLS("buckets", {
	id: text().primaryKey(),
	name: text().notNull(),
	owner: uuid(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	public: boolean().default(false),
	avifAutodetection: boolean("avif_autodetection").default(false),
	fileSizeLimit: bigint("file_size_limit", { mode: 'number' }),
	allowedMimeTypes: text("allowed_mime_types").array(),
	ownerId: text("owner_id"),
	type: buckettypeInStorage().default("STANDARD").notNull(),
}, (table) => [
	uniqueIndex("bname").using("btree", table.name.asc().nullsLast()),
]);

export const bucketsAnalyticsInStorage = storage.table.withRLS("buckets_analytics", {
	name: text().notNull(),
	type: buckettypeInStorage().default("ANALYTICS").notNull(),
	format: text().default("ICEBERG").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
	id: uuid().defaultRandom().primaryKey(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => [
	uniqueIndex("buckets_analytics_unique_name_idx").using("btree", table.name.asc().nullsLast()).where(sql`(deleted_at IS NULL)`),
]);

export const bucketsVectorsInStorage = storage.table.withRLS("buckets_vectors", {
	id: text().primaryKey(),
	type: buckettypeInStorage().default("VECTOR").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export const migrationsInStorage = storage.table.withRLS("migrations", {
	id: integer().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	hash: varchar({ length: 40 }).notNull(),
	executedAt: timestamp("executed_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("migrations_name_key").on(table.name),]);

export const objectsInStorage = storage.table.withRLS("objects", {
	id: uuid().defaultRandom().primaryKey(),
	bucketId: text("bucket_id").references(() => bucketsInStorage.id),
	name: text(),
	owner: uuid(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
	lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).default(sql`now()`),
	metadata: jsonb(),
	pathTokens: text("path_tokens").array().generatedAlwaysAs(sql`string_to_array(name, '/'::text)`),
	version: text(),
	ownerId: text("owner_id"),
	userMetadata: jsonb("user_metadata"),
}, (table) => [
	uniqueIndex("bucketid_objname").using("btree", table.bucketId.asc().nullsLast(), table.name.asc().nullsLast()),
	index("idx_objects_bucket_id_name").using("btree", table.bucketId.asc().nullsLast(), table.name.asc().nullsLast()),
	index("idx_objects_bucket_id_name_lower").using("btree", table.bucketId.asc().nullsLast(), sql`lower(name)`),
	index("name_prefix_search").using("btree", table.name.asc().nullsLast().op("text_pattern_ops")),
]);

export const s3MultipartUploadsInStorage = storage.table.withRLS("s3_multipart_uploads", {
	id: text().primaryKey(),
	inProgressSize: bigint("in_progress_size", { mode: 'number' }).default(0).notNull(),
	uploadSignature: text("upload_signature").notNull(),
	bucketId: text("bucket_id").notNull().references(() => bucketsInStorage.id),
	key: text().notNull(),
	version: text().notNull(),
	ownerId: text("owner_id"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	userMetadata: jsonb("user_metadata"),
	metadata: jsonb(),
}, (table) => [
	index("idx_multipart_uploads_list").using("btree", table.bucketId.asc().nullsLast(), table.key.asc().nullsLast(), table.createdAt.asc().nullsLast()),
]);

export const s3MultipartUploadsPartsInStorage = storage.table.withRLS("s3_multipart_uploads_parts", {
	id: uuid().defaultRandom().primaryKey(),
	uploadId: text("upload_id").notNull().references(() => s3MultipartUploadsInStorage.id, { onDelete: "cascade" } ),
	size: bigint({ mode: 'number' }).default(0).notNull(),
	partNumber: integer("part_number").notNull(),
	bucketId: text("bucket_id").notNull().references(() => bucketsInStorage.id),
	key: text().notNull(),
	etag: text().notNull(),
	ownerId: text("owner_id"),
	version: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export const vectorIndexesInStorage = storage.table.withRLS("vector_indexes", {
	id: text().default(sql`gen_random_uuid()`).primaryKey(),
	name: text().notNull(),
	bucketId: text("bucket_id").notNull().references(() => bucketsVectorsInStorage.id),
	dataType: text("data_type").notNull(),
	dimension: integer().notNull(),
	distanceMetric: text("distance_metric").notNull(),
	metadataConfiguration: jsonb("metadata_configuration"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => [
	uniqueIndex("vector_indexes_name_bucket_id_idx").using("btree", table.name.asc().nullsLast(), table.bucketId.asc().nullsLast()),
]);

export const hooksInSupabaseFunctions = supabaseFunctions.table("hooks", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	hookTableId: integer("hook_table_id").notNull(),
	hookName: text("hook_name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	requestId: bigint("request_id", { mode: 'number' }),
}, (table) => [
	index("supabase_functions_hooks_h_table_id_h_name_idx").using("btree", table.hookTableId.asc().nullsLast(), table.hookName.asc().nullsLast()),
	index("supabase_functions_hooks_request_id_idx").using("btree", table.requestId.asc().nullsLast()),
]);

export const migrationsInSupabaseFunctions = supabaseFunctions.table("migrations", {
	version: text().primaryKey(),
	insertedAt: timestamp("inserted_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export const secretsInVault = vault.table("secrets", {
	id: uuid().defaultRandom().primaryKey(),
	name: text(),
	description: text().default("").notNull(),
	secret: text().notNull(),
	keyId: uuid("key_id"),
	nonce: customType({ dataType: () => 'bytea' })().default("vault._crypto_aead_det_noncegen()"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("secrets_name_idx").using("btree", table.name.asc().nullsLast()).where(sql`(name IS NOT NULL)`),
]);
export const pgStatStatementsInExtensions = extensions.view("pg_stat_statements", {	userid: customType({ dataType: () => 'oid' })(),
	dbid: customType({ dataType: () => 'oid' })(),
	toplevel: boolean(),
	queryid: bigint({ mode: 'number' }),
	query: text(),
	plans: bigint({ mode: 'number' }),
	totalPlanTime: doublePrecision("total_plan_time"),
	minPlanTime: doublePrecision("min_plan_time"),
	maxPlanTime: doublePrecision("max_plan_time"),
	meanPlanTime: doublePrecision("mean_plan_time"),
	stddevPlanTime: doublePrecision("stddev_plan_time"),
	calls: bigint({ mode: 'number' }),
	totalExecTime: doublePrecision("total_exec_time"),
	minExecTime: doublePrecision("min_exec_time"),
	maxExecTime: doublePrecision("max_exec_time"),
	meanExecTime: doublePrecision("mean_exec_time"),
	stddevExecTime: doublePrecision("stddev_exec_time"),
	rows: bigint({ mode: 'number' }),
	sharedBlksHit: bigint("shared_blks_hit", { mode: 'number' }),
	sharedBlksRead: bigint("shared_blks_read", { mode: 'number' }),
	sharedBlksDirtied: bigint("shared_blks_dirtied", { mode: 'number' }),
	sharedBlksWritten: bigint("shared_blks_written", { mode: 'number' }),
	localBlksHit: bigint("local_blks_hit", { mode: 'number' }),
	localBlksRead: bigint("local_blks_read", { mode: 'number' }),
	localBlksDirtied: bigint("local_blks_dirtied", { mode: 'number' }),
	localBlksWritten: bigint("local_blks_written", { mode: 'number' }),
	tempBlksRead: bigint("temp_blks_read", { mode: 'number' }),
	tempBlksWritten: bigint("temp_blks_written", { mode: 'number' }),
	blkReadTime: doublePrecision("blk_read_time"),
	blkWriteTime: doublePrecision("blk_write_time"),
	tempBlkReadTime: doublePrecision("temp_blk_read_time"),
	tempBlkWriteTime: doublePrecision("temp_blk_write_time"),
	walRecords: bigint("wal_records", { mode: 'number' }),
	walFpi: bigint("wal_fpi", { mode: 'number' }),
	walBytes: numeric("wal_bytes"),
	jitFunctions: bigint("jit_functions", { mode: 'number' }),
	jitGenerationTime: doublePrecision("jit_generation_time"),
	jitInliningCount: bigint("jit_inlining_count", { mode: 'number' }),
	jitInliningTime: doublePrecision("jit_inlining_time"),
	jitOptimizationCount: bigint("jit_optimization_count", { mode: 'number' }),
	jitOptimizationTime: doublePrecision("jit_optimization_time"),
	jitEmissionCount: bigint("jit_emission_count", { mode: 'number' }),
	jitEmissionTime: doublePrecision("jit_emission_time"),
}).as(sql`SELECT pg_stat_statements.userid, pg_stat_statements.dbid, pg_stat_statements.toplevel, pg_stat_statements.queryid, pg_stat_statements.query, pg_stat_statements.plans, pg_stat_statements.total_plan_time, pg_stat_statements.min_plan_time, pg_stat_statements.max_plan_time, pg_stat_statements.mean_plan_time, pg_stat_statements.stddev_plan_time, pg_stat_statements.calls, pg_stat_statements.total_exec_time, pg_stat_statements.min_exec_time, pg_stat_statements.max_exec_time, pg_stat_statements.mean_exec_time, pg_stat_statements.stddev_exec_time, pg_stat_statements.rows, pg_stat_statements.shared_blks_hit, pg_stat_statements.shared_blks_read, pg_stat_statements.shared_blks_dirtied, pg_stat_statements.shared_blks_written, pg_stat_statements.local_blks_hit, pg_stat_statements.local_blks_read, pg_stat_statements.local_blks_dirtied, pg_stat_statements.local_blks_written, pg_stat_statements.temp_blks_read, pg_stat_statements.temp_blks_written, pg_stat_statements.blk_read_time, pg_stat_statements.blk_write_time, pg_stat_statements.temp_blk_read_time, pg_stat_statements.temp_blk_write_time, pg_stat_statements.wal_records, pg_stat_statements.wal_fpi, pg_stat_statements.wal_bytes, pg_stat_statements.jit_functions, pg_stat_statements.jit_generation_time, pg_stat_statements.jit_inlining_count, pg_stat_statements.jit_inlining_time, pg_stat_statements.jit_optimization_count, pg_stat_statements.jit_optimization_time, pg_stat_statements.jit_emission_count, pg_stat_statements.jit_emission_time FROM extensions.pg_stat_statements(true) pg_stat_statements(userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, blk_read_time, blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time)`);

export const pgStatStatementsInfoInExtensions = extensions.view("pg_stat_statements_info", {	dealloc: bigint({ mode: 'number' }),
	statsReset: timestamp("stats_reset", { withTimezone: true }),
}).as(sql`SELECT pg_stat_statements_info.dealloc, pg_stat_statements_info.stats_reset FROM extensions.pg_stat_statements_info() pg_stat_statements_info(dealloc, stats_reset)`);

export const decryptedKeyInPgsodium = pgsodium.view("decrypted_key", {	id: uuid(),
	status: keyStatusInPgsodium(),
	created: timestamp({ withTimezone: true }),
	expires: timestamp({ withTimezone: true }),
	keyType: keyTypeInPgsodium("key_type"),
	keyId: bigint("key_id", { mode: 'number' }),
	keyContext: customType({ dataType: () => 'bytea' })("key_context"),
	name: text(),
	associatedData: text("associated_data"),
	rawKey: customType({ dataType: () => 'bytea' })("raw_key"),
	decryptedRawKey: customType({ dataType: () => 'bytea' })("decrypted_raw_key"),
	rawKeyNonce: customType({ dataType: () => 'bytea' })("raw_key_nonce"),
	parentKey: uuid("parent_key"),
	comment: text(),
}).as(sql`SELECT key.id, key.status, key.created, key.expires, key.key_type, key.key_id, key.key_context, key.name, key.associated_data, key.raw_key, CASE WHEN key.raw_key IS NULL THEN NULL::bytea ELSE CASE WHEN key.parent_key IS NULL THEN NULL::bytea ELSE pgsodium.crypto_aead_det_decrypt(key.raw_key, convert_to(key.id::text || key.associated_data, 'utf8'::name), key.parent_key, key.raw_key_nonce) END END AS decrypted_raw_key, key.raw_key_nonce, key.parent_key, key.comment FROM pgsodium.key`);

export const maskColumnsInPgsodium = pgsodium.view("mask_columns", {	attname: customType({ dataType: () => 'name' })(),
	attrelid: customType({ dataType: () => 'oid' })(),
	keyId: text("key_id"),
	keyIdColumn: text("key_id_column"),
	associatedColumns: text("associated_columns"),
	nonceColumn: text("nonce_column"),
	formatType: text("format_type"),
}).as(sql`SELECT a.attname, a.attrelid, m.key_id, m.key_id_column, m.associated_columns, m.nonce_column, m.format_type FROM pg_attribute a LEFT JOIN pgsodium.masking_rule m ON m.attrelid = a.attrelid AND m.attname = a.attname WHERE a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum`);

export const maskingRuleInPgsodium = pgsodium.view("masking_rule", {	attrelid: customType({ dataType: () => 'oid' })(),
	attnum: integer(),
	relnamespace: customType({ dataType: () => 'regnamespace' })(),
	relname: customType({ dataType: () => 'name' })(),
	attname: customType({ dataType: () => 'name' })(),
	formatType: text("format_type"),
	colDescription: text("col_description"),
	keyIdColumn: text("key_id_column"),
	keyId: text("key_id"),
	associatedColumns: text("associated_columns"),
	nonceColumn: text("nonce_column"),
	viewName: text("view_name"),
	priority: integer(),
	securityInvoker: boolean("security_invoker"),
}).as(sql`WITH const AS ( SELECT 'encrypt +with +key +id +([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'::text AS pattern_key_id, 'encrypt +with +key +column +([\w\"\-$]+)'::text AS pattern_key_id_column, '(?<=associated) +\(([\w\"\-$, ]+)\)'::text AS pattern_associated_columns, '(?<=nonce) +([\w\"\-$]+)'::text AS pattern_nonce_column, '(?<=decrypt with view) +([\w\"\-$]+\.[\w\"\-$]+)'::text AS pattern_view_name, '(?<=security invoker)'::text AS pattern_security_invoker ), rules_from_seclabels AS ( SELECT sl.objoid AS attrelid, sl.objsubid AS attnum, c.relnamespace::regnamespace AS relnamespace, c.relname, a.attname, format_type(a.atttypid, a.atttypmod) AS format_type, sl.label AS col_description, (regexp_match(sl.label, k.pattern_key_id_column, 'i'::text))[1] AS key_id_column, (regexp_match(sl.label, k.pattern_key_id, 'i'::text))[1] AS key_id, (regexp_match(sl.label, k.pattern_associated_columns, 'i'::text))[1] AS associated_columns, (regexp_match(sl.label, k.pattern_nonce_column, 'i'::text))[1] AS nonce_column, COALESCE((regexp_match(sl2.label, k.pattern_view_name, 'i'::text))[1], (c.relnamespace::regnamespace || '.'::text) || quote_ident('decrypted_'::text || c.relname::text)) AS view_name, 100 AS priority, (regexp_match(sl.label, k.pattern_security_invoker, 'i'::text))[1] IS NOT NULL AS security_invoker FROM const k, pg_seclabel sl JOIN pg_class c ON sl.classoid = c.tableoid AND sl.objoid = c.oid JOIN pg_attribute a ON a.attrelid = c.oid AND sl.objsubid = a.attnum LEFT JOIN pg_seclabel sl2 ON sl2.objoid = c.oid AND sl2.objsubid = 0 WHERE a.attnum > 0 AND c.relnamespace::regnamespace::oid <> 'pg_catalog'::regnamespace::oid AND NOT a.attisdropped AND sl.label ~~* 'ENCRYPT%'::text AND sl.provider = 'pgsodium'::text ) SELECT DISTINCT ON (rules_from_seclabels.attrelid, rules_from_seclabels.attnum) rules_from_seclabels.attrelid, rules_from_seclabels.attnum, rules_from_seclabels.relnamespace, rules_from_seclabels.relname, rules_from_seclabels.attname, rules_from_seclabels.format_type, rules_from_seclabels.col_description, rules_from_seclabels.key_id_column, rules_from_seclabels.key_id, rules_from_seclabels.associated_columns, rules_from_seclabels.nonce_column, rules_from_seclabels.view_name, rules_from_seclabels.priority, rules_from_seclabels.security_invoker FROM rules_from_seclabels ORDER BY rules_from_seclabels.attrelid, rules_from_seclabels.attnum, rules_from_seclabels.priority DESC`);

export const validKeyInPgsodium = pgsodium.view("valid_key", {	id: uuid(),
	name: text(),
	status: keyStatusInPgsodium(),
	keyType: keyTypeInPgsodium("key_type"),
	keyId: bigint("key_id", { mode: 'number' }),
	keyContext: customType({ dataType: () => 'bytea' })("key_context"),
	created: timestamp({ withTimezone: true }),
	expires: timestamp({ withTimezone: true }),
	associatedData: text("associated_data"),
}).as(sql`SELECT key.id, key.name, key.status, key.key_type, key.key_id, key.key_context, key.created, key.expires, key.associated_data FROM pgsodium.key WHERE (key.status = ANY (ARRAY['valid'::pgsodium.key_status, 'default'::pgsodium.key_status])) AND CASE WHEN key.expires IS NULL THEN true ELSE key.expires > now() END`);

export const decryptedSecretsInVault = vault.view("decrypted_secrets", {	id: uuid(),
	name: text(),
	description: text(),
	secret: text(),
	decryptedSecret: text("decrypted_secret"),
	keyId: uuid("key_id"),
	nonce: customType({ dataType: () => 'bytea' })(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
}).as(sql`SELECT s.id, s.name, s.description, s.secret, convert_from(vault._crypto_aead_det_decrypt(message => decode(s.secret, 'base64'::text), additional => convert_to(s.id::text, 'utf8'::name), key_id => 0::bigint, context => '\x7067736f6469756d'::bytea, nonce => s.nonce), 'utf8'::name) AS decrypted_secret, s.key_id, s.nonce, s.created_at, s.updated_at FROM vault.secrets s`);