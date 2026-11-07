import Redis from 'ioredis'
import { createFederation, MemoryKvStore, type Federation } from '@fedify/fedify'
import { RedisKvStore, RedisMessageQueue } from '@fedify/redis'
import { federationEnabled, siteOrigin } from './utils/activitypub/config'
import { setupFederation } from './utils/activitypub/setup'

/**
 * Meeovi on the fediverse — the Fedify instance @fedify/nuxt mounts in
 * front of Nuxt (requests it doesn't handle fall through to the site).
 * See utils/activitypub/* for the accounts, objects and inbox.
 *
 * Only meeovi.com federates (ACTIVITYPUB_FEDERATION=true). The demo shares
 * the database and Redis: there the instance has no routes, no queue and an
 * in-memory store, so it answers nothing and never picks up meeovi.com's
 * deliveries.
 */
const redisUrl = () => String(process.env.NUXT_REDIS_URL || 'redis://localhost:6379')

function build(): Federation<unknown> {
  if (!federationEnabled()) return createFederation<unknown>({ kv: new MemoryKvStore() })
  const connect = () => new Redis(redisUrl(), { lazyConnect: true, maxRetriesPerRequest: null })
  const federation = createFederation<unknown>({
    kv: new RedisKvStore(connect(), { keyPrefix: 'meeovi:fedify:kv:' }),
    // Deliveries and inbox work run in the background, retried with backoff.
    queue: new RedisMessageQueue(connect, {
      queueKey: 'meeovi:fedify:queue',
      channelKey: 'meeovi:fedify:channel',
      lockKey: 'meeovi:fedify:lock',
    }),
    // Ids are always on meeovi.com, whatever host a request came in on.
    origin: siteOrigin(),
    userAgent: { software: 'Meeovi', url: siteOrigin() },
    // Pixelfed answers 200 to unsigned-looking requests before checking
    // the signature; leading with the widely supported draft signatures
    // avoids that (Fedify tutorial).
    firstKnock: 'draft-cavage-http-signatures-12',
  })
  setupFederation(federation)
  return federation
}

const federation = build()

export default federation
