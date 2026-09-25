#!/usr/bin/env node
/**
 * Register (or update) a first-party OIDC client for Meeovi's
 * @better-auth/oauth-provider — e.g. Pixanomy's Nextcloud user_oidc app.
 *
 *   NUXT_DATABASE_URL=… node layers/auth/scripts/register-oauth-client.mjs \
 *     --client-id pixanomy --name Pixanomy \
 *     --redirect https://app.pixanomy.com/apps/user_oidc/code \
 *     [--post-logout https://app.pixanomy.com/] [--rotate-secret]
 *
 * First-party clients skip the consent screen. The client secret is only
 * printed when it's created (or with --rotate-secret); it's stored as the
 * same unpadded base64url SHA-256 hash the plugin's default "hashed"
 * storeClientSecret uses, so it can't be recovered later.
 */
import { createHash, randomBytes } from 'node:crypto'
import { parseArgs } from 'node:util'
import postgres from 'postgres'
import { v7 as uuidv7 } from 'uuid'

const { values } = parseArgs({
  options: {
    'client-id': { type: 'string' },
    name: { type: 'string' },
    redirect: { type: 'string', multiple: true },
    'post-logout': { type: 'string', multiple: true },
    'rotate-secret': { type: 'boolean', default: false },
  },
})

const clientId = values['client-id']
const redirects = values.redirect || []
if (!clientId || !redirects.length) {
  console.error('Usage: --client-id <id> --redirect <uri> [--redirect <uri>…] [--name <name>] [--post-logout <uri>…] [--rotate-secret]')
  process.exit(1)
}
if (!process.env.NUXT_DATABASE_URL) {
  console.error('NUXT_DATABASE_URL is not set')
  process.exit(1)
}

const hash = (value) => createHash('sha256').update(value).digest('base64url')
const sql = postgres(process.env.NUXT_DATABASE_URL, { max: 1 })

try {
  const [existing] = await sql`select id from oauth_provider_client where client_id = ${clientId}`
  const secret = !existing || values['rotate-secret'] ? randomBytes(32).toString('base64url') : null
  const now = new Date()
  const common = {
    name: values.name || clientId,
    redirect_uris: redirects,
    post_logout_redirect_uris: values['post-logout'] || null,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_basic',
    type: 'web',
    public: false,
    skip_consent: true,
    enable_end_session: true,
    disabled: false,
    updated_at: now,
  }

  if (existing) {
    const update = secret ? { ...common, client_secret: hash(secret) } : common
    await sql`update oauth_provider_client set ${sql(update)} where client_id = ${clientId}`
    console.log(`Updated client "${clientId}".`)
  } else {
    await sql`insert into oauth_provider_client ${sql({ ...common, id: uuidv7(), client_id: clientId, client_secret: hash(secret), created_at: now })}`
    console.log(`Created client "${clientId}".`)
  }
  if (secret) console.log(`client_secret: ${secret}\n(store it now — it can't be shown again)`)
} finally {
  await sql.end()
}
