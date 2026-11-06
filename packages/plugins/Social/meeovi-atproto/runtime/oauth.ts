// AT Protocol OAuth: "Sign in with Bluesky" (any PDS) the way the protocol
// recommends — the member signs in on their own PDS and approves Meeovi,
// instead of typing an app password into Meeovi.
//
//  - Production: a confidential web client. Its metadata is published at
//    <site>/oauth-client-metadata.json (that URL is the client_id) and its
//    public key at <site>/oauth/jwks.json; it authenticates with
//    ATPROTO_OAUTH_PRIVATE_JWK (an ES256 private JWK, generate with
//    scripts/generate-oauth-key.mjs). Site = ATPROTO_OAUTH_PUBLIC_URL.
//  - Development (site on http://127.0.0.1 / localhost): the protocol's
//    loopback client — no metadata or key needed.
//
// OAuth state (10 minutes) and sessions (DPoP-bound tokens, refreshed by
// the library) live in a key-value store the host app registers with
// registerAtprotoOAuthStores() (Meeovi: Redis, layers/auth server plugin
// atproto-oauth-stores.ts) — this plugin never touches the site's database.
import { Agent } from '@atproto/api'
import {
  JoseKey,
  NodeOAuthClient,
  type NodeSavedSession,
  type NodeSavedState,
  type OAuthClientMetadataInput,
} from '@atproto/oauth-client-node'

export type OAuthKeyValueStore<V> = {
  get(key: string): Promise<V | undefined>
  set(key: string, value: V): Promise<void>
  del(key: string): Promise<void>
}

export type AtprotoOAuthStores = {
  state: OAuthKeyValueStore<NodeSavedState>
  session: OAuthKeyValueStore<NodeSavedSession>
  /** Only one token refresh per member at a time (two at once can get
   *  the member's session revoked). */
  lock?: <T>(name: string, fn: () => T | PromiseLike<T>) => Promise<T>
}

const STORES = Symbol.for('meeovi.atproto.oauthStores')
const CLIENT = Symbol.for('meeovi.atproto.oauthClient')

/** The host app's stores for OAuth state and sessions (call from a Nitro plugin). */
export function registerAtprotoOAuthStores(stores: AtprotoOAuthStores): void {
  ;(globalThis as Record<symbol, unknown>)[STORES] = stores
}

export const OAUTH_SCOPE = 'atproto transition:generic'
/** better-auth mounts plugin endpoints under /api/auth. */
export const OAUTH_CALLBACK_PATH = '/api/auth/atproto/oauth/callback'

/** The site's public origin for OAuth, e.g. https://meeovi.com. */
export function oauthPublicUrl(): string | null {
  const raw = String(process.env.ATPROTO_OAUTH_PUBLIC_URL || '').trim().replace(/\/+$/, '')
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null
  } catch {
    return null
  }
}

const isLoopback = (origin: string) => /^http:\/\/(127\.0\.0\.1|\[::1\]|localhost)(:\d+)?$/.test(origin)

/** The client metadata this site publishes (production) — null in development. */
export function oauthClientMetadata(): OAuthClientMetadataInput | null {
  const origin = oauthPublicUrl()
  if (!origin || isLoopback(origin)) return null
  return {
    client_id: `${origin}/oauth-client-metadata.json`,
    client_name: 'Meeovi',
    client_uri: origin,
    logo_uri: `${origin}/favicon.ico`,
    tos_uri: `${origin}/terms`,
    policy_uri: `${origin}/privacy`,
    redirect_uris: [`${origin}${OAUTH_CALLBACK_PATH}`],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: OAUTH_SCOPE,
    application_type: 'web',
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'ES256',
    dpop_bound_access_tokens: true,
    jwks_uri: `${origin}/oauth/jwks.json`,
  }
}

async function keyset() {
  const raw = String(process.env.ATPROTO_OAUTH_PRIVATE_JWK || '').trim()
  if (!raw) return null
  // A JWK (JSON) keeps its own kid; a string is read as a PEM key, which has none.
  if (raw.startsWith('{')) return [await JoseKey.fromImportable(JSON.parse(raw))]
  return [await JoseKey.fromImportable(raw, 'meeovi-oauth-1')]
}

/** The public half of the client key, for /oauth/jwks.json. */
export async function oauthPublicJwks(): Promise<{ keys: unknown[] } | null> {
  const keys = await keyset().catch(() => null)
  return keys ? { keys: keys.map((key) => key.publicJwk) } : null
}

/** Whether Bluesky OAuth sign-in can work here (stores registered, site + key set). */
export function oauthConfigured(): boolean {
  const origin = oauthPublicUrl()
  return !!(globalThis as Record<symbol, unknown>)[STORES] && !!origin
    && (isLoopback(origin) || !!String(process.env.ATPROTO_OAUTH_PRIVATE_JWK || '').trim())
}

/** The OAuth client (one per server). Throws a 503 when it isn't set up. */
export async function atprotoOAuthClient(): Promise<NodeOAuthClient> {
  const g = globalThis as Record<symbol, unknown>
  if (g[CLIENT]) return g[CLIENT] as Promise<NodeOAuthClient>
  const stores = g[STORES] as AtprotoOAuthStores | undefined
  const origin = oauthPublicUrl()
  if (!stores || !origin) {
    throw Object.assign(new Error('Bluesky OAuth is not set up'), { statusCode: 503, statusMessage: "Signing in with Bluesky isn't set up on this site" })
  }
  const promise = (async () => {
    let clientMetadata: OAuthClientMetadataInput
    let keys: Awaited<ReturnType<typeof keyset>> = null
    if (isLoopback(origin)) {
      // The protocol's development client: the client_id carries the
      // redirect URI and scope (which must use 127.0.0.1, not localhost).
      const redirect = `${origin.replace('localhost', '127.0.0.1')}${OAUTH_CALLBACK_PATH}`
      clientMetadata = {
        client_id: `http://localhost?redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(OAUTH_SCOPE)}`,
        redirect_uris: [redirect],
        scope: OAUTH_SCOPE,
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        application_type: 'native',
        token_endpoint_auth_method: 'none',
        dpop_bound_access_tokens: true,
      }
    } else {
      keys = await keyset()
      if (!keys) throw Object.assign(new Error('ATPROTO_OAUTH_PRIVATE_JWK is not set'), { statusCode: 503, statusMessage: "Signing in with Bluesky isn't set up on this site" })
      clientMetadata = oauthClientMetadata()!
    }
    return new NodeOAuthClient({
      clientMetadata,
      ...(keys ? { keyset: keys } : {}),
      stateStore: stores.state,
      sessionStore: stores.session,
      ...(stores.lock ? { requestLock: stores.lock } : {}),
    })
  })()
  g[CLIENT] = promise
  promise.catch(() => { if (g[CLIENT] === promise) delete g[CLIENT] })
  return promise
}

/** An API agent acting as a member through their OAuth session (refreshes itself). */
export async function restoreOAuthAgent(did: string): Promise<Agent | null> {
  try {
    const session = await (await atprotoOAuthClient()).restore(did)
    return new Agent(session)
  } catch (error: any) {
    console.warn('[meeovi-atproto] OAuth session for', did, 'is unusable:', error?.message || error)
    return null
  }
}
