// Prints a new ES256 private key (JWK) for Meeovi's Bluesky OAuth client.
// Put the output in the server's env as ATPROTO_OAUTH_PRIVATE_JWK (one
// line, keep it secret); its public half is served at /oauth/jwks.json.
//   node packages/plugins/Social/meeovi-atproto/scripts/generate-oauth-key.mjs
import { JoseKey } from '@atproto/oauth-client-node'

const key = await JoseKey.generate(['ES256'], `meeovi-oauth-${new Date().toISOString().slice(0, 10)}`)
console.log(JSON.stringify(key.privateJwk))
