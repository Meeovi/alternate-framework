// packages/adapters/adapter-federation/src/auth/auth.ts
//
// Thin credential helpers used by the better-auth plugin (./plugin.ts) and
// by any server code that needs a one-off authenticated AtprotoClient
// (e.g. the runtime bootstrap in ../runtime/server/atproto.ts). Login
// itself is just `AtprotoClient.login` — see ../clients/atproto.ts, which
// is the actual `@atproto/api` wrapper.
import { AtprotoClient, getAtprotoServiceUrl } from '../clients/atproto'
import type { AtpSessionData } from '@atproto/api'

export type AtprotoCredentials = {
  service: string
  identifier: string
  password: string
}

/** Logs in against `credentials.service` (an app password, or a full
 *  password on a self-hosted PDS that doesn't enforce app passwords) and
 *  returns both the authenticated client and its session — callers that
 *  only need the identity (did/handle) can read them off `client`; callers
 *  that need to persist a resumable session can store `session`. */
export async function loginAtproto(credentials: AtprotoCredentials): Promise<{ client: AtprotoClient, session: AtpSessionData }> {
  const client = new AtprotoClient({ serviceUrl: credentials.service })
  const session = await client.login(credentials.identifier, credentials.password)
  return { client, session }
}

/** Service-account credentials for the global read-mostly client bootstrap
 *  (see ../runtime/server/atproto.ts) — not a per-user login. */
export function getAtprotoCredentialsFromEnv(): AtprotoCredentials | null {
  const service = getAtprotoServiceUrl()
  const identifier = process.env.ATPROTO_IDENTIFIER
  const password = process.env.ATPROTO_APP_PASSWORD

  if (!identifier || !password) {
    return null
  }

  return { service, identifier, password }
}
