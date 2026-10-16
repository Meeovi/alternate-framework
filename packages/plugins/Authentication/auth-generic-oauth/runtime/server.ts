import {
  auth0,
  genericOAuth,
  gumroad,
  hubspot,
  keycloak,
  line,
  microsoftEntraId,
  okta,
  patreon,
  slack,
} from 'better-auth/plugins'

type Env = Record<string, string | undefined>

/** Every provider this package knows, each with the env it needs. Only the
 *  ones whose env is complete are offered. */
const PROVIDERS = [
  { id: 'auth0', env: ['AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'AUTH0_DOMAIN'], make: (e: Env) => auth0({ clientId: e.AUTH0_CLIENT_ID!, clientSecret: e.AUTH0_CLIENT_SECRET!, domain: e.AUTH0_DOMAIN! }) },
  { id: 'gumroad', env: ['GUMROAD_CLIENT_ID', 'GUMROAD_CLIENT_SECRET'], make: (e: Env) => gumroad({ clientId: e.GUMROAD_CLIENT_ID!, clientSecret: e.GUMROAD_CLIENT_SECRET! }) },
  { id: 'hubspot', env: ['HUBSPOT_CLIENT_ID', 'HUBSPOT_CLIENT_SECRET'], make: (e: Env) => hubspot({ clientId: e.HUBSPOT_CLIENT_ID!, clientSecret: e.HUBSPOT_CLIENT_SECRET!, scopes: ['oauth', 'contacts'] }) },
  { id: 'keycloak', env: ['KEYCLOAK_CLIENT_ID', 'KEYCLOAK_SECRET', 'KEYCLOAK_ISSUER'], make: (e: Env) => keycloak({ clientId: e.KEYCLOAK_CLIENT_ID!, clientSecret: e.KEYCLOAK_SECRET!, issuer: e.KEYCLOAK_ISSUER! }) },
  { id: 'line-jp', env: ['LINE_JP_CLIENT_ID', 'LINE_JP_CLIENT_SECRET'], make: (e: Env) => line({ providerId: 'line-jp', clientId: e.LINE_JP_CLIENT_ID!, clientSecret: e.LINE_JP_CLIENT_SECRET! }) },
  { id: 'microsoft-entra-id', env: ['MS_APP_ID', 'MS_CLIENT_SECRET', 'MS_TENANT_ID'], make: (e: Env) => microsoftEntraId({ clientId: e.MS_APP_ID!, clientSecret: e.MS_CLIENT_SECRET!, tenantId: e.MS_TENANT_ID! }) },
  { id: 'okta', env: ['OKTA_CLIENT_ID', 'OKTA_CLIENT_SECRET', 'OKTA_ISSUER'], make: (e: Env) => okta({ clientId: e.OKTA_CLIENT_ID!, clientSecret: e.OKTA_CLIENT_SECRET!, issuer: e.OKTA_ISSUER! }) },
  { id: 'slack', env: ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET'], make: (e: Env) => slack({ clientId: e.SLACK_CLIENT_ID!, clientSecret: e.SLACK_CLIENT_SECRET! }) },
  { id: 'patreon', env: ['PATREON_CLIENT_ID', 'PATREON_CLIENT_SECRET'], make: (e: Env) => patreon({ clientId: e.PATREON_CLIENT_ID!, clientSecret: e.PATREON_CLIENT_SECRET! }) },
]

/** The providers whose credentials are all set. */
export function configuredProviders(env: Env = process.env) {
  return PROVIDERS.filter((p) => p.env.every((key) => env[key]?.trim())).map((p) => p.make(env))
}

/** No plugin (and no /sign-in/oauth2 endpoints) until a provider is set up. */
export default function genericOAuthPlugin() {
  const config = configuredProviders()
  if (!config.length) {
    console.warn('[auth-generic-oauth] no provider has its credentials set (AUTH0_*, KEYCLOAK_*, OKTA_*, …); not enabled')
    return []
  }
  return genericOAuth({ config })
}
