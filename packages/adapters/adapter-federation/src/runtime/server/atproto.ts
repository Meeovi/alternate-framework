// packages/adapters/adapter-federation/src/runtime/server/atproto.ts
//
// Nitro-only server plugin that bootstraps a service-level AtprotoClient
// and exposes it via globalThis.__atprotoClient (see
// clients/atproto.ts's useAtprotoClient()/setAtprotoClient()) — the same
// global-singleton convention layers/social's Mastodon integration already
// relies on (globalThis.__mastoClient).
//
// This is a *service-level* login: a single AT Protocol account (its
// identifier/app password set via ATPROTO_IDENTIFIER/ATPROTO_APP_PASSWORD)
// used for reads that don't need to run as a specific end user — the
// hosted-feed/search paths in layers/search and layers/social's read-only
// federated timeline. Per-user actions (posting, liking, following as a
// specific person) go through the atproto better-auth plugin instead (see
// ../../auth/plugin.ts), which authenticates that person's own PDS
// credentials on demand rather than sharing this global client.
//
// Runs separately from runtime/plugin.ts (a universal Vue plugin) because
// this needs to exist before any Nitro server route runs, including ones
// with no Vue app lifecycle at all — same reasoning as adapter-magento's
// runtime/server/commerce-link.ts.
import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { AtprotoClient, getAtprotoServiceUrl, setAtprotoClient } from '../../clients/atproto'

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  // service URL is public; the service-account credentials are private
  // (module.ts keeps them out of `public.atproto`).
  const publicOptions = (runtimeConfig.public as any)?.atproto || {}
  const privateOptions = (runtimeConfig as any)?.atproto || {}
  const service = publicOptions.service || getAtprotoServiceUrl()
  const identifier = privateOptions.identifier || process.env.ATPROTO_IDENTIFIER
  const password = privateOptions.appPassword || process.env.ATPROTO_APP_PASSWORD

  // No service-account credentials configured — leave the global client
  // unset. useAtprotoClient() throws with a clear message if something
  // tries to use it; per-user atproto login (../../auth/plugin.ts) and the
  // unauthenticated search provider (layers/search) don't depend on it.
  if (!identifier || !password) return

  const client = new AtprotoClient({ serviceUrl: service })

  // Fire-and-forget at boot, same as adapter-magento's commerce-link.ts —
  // requests that land before login resolves hit useAtprotoClient()'s
  // "not initialized" error for a brief window rather than blocking
  // server startup on an external PDS being reachable. The global is only
  // set on success so nothing ever observes an unauthenticated client.
  client.login(identifier, password)
    .then(() => setAtprotoClient(client))
    .catch((error) => {
      console.error(`[adapter-federation] atproto service-account login to ${service} failed:`, error)
    })
})
