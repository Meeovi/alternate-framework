// GET /api/social/atproto/status
//
// Lightweight atproto/PDS connectivity check — the federation counterpart
// to raw browser online/offline detection (see useOnline.vue's new
// `checkAtproto` prop). `configured` reflects whether the shared
// service-account client ever logged in successfully (see
// @mframework/adapter-federation's runtime/server/atproto.ts);
// `reachable` is a live check against the PDS itself
// (com.atproto.server.describeServer, unauthenticated, works regardless
// of whether a service account is configured).
import { useAtprotoClient, AtprotoClient, getAtprotoServiceUrl } from '@mframework/adapter-federation/clients/atproto'

export default defineEventHandler(async () => {
  let configured = true
  let client: AtprotoClient
  try {
    client = useAtprotoClient()
  } catch {
    configured = false
    client = new AtprotoClient({ serviceUrl: getAtprotoServiceUrl() })
  }

  try {
    await client.describeServer()
    return { configured, reachable: true }
  } catch (error) {
    console.error('[atproto] status check failed:', error)
    return { configured, reachable: false }
  }
})
