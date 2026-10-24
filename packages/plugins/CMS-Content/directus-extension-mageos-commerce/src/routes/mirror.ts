import { timingSafeEqual } from 'node:crypto'
import { CommerceError } from '../errors'
import { route, type RouteContext } from '../http'
import { directusStore, type DirectusServicesContext } from '../mirror/directus-store'
import { createMirrorScheduler } from '../mirror/scheduler'
import { MIRROR_SECTIONS, mirror, type MirrorSection } from '../mirror/sync'

/**
 *   POST /commerce/mirror/notify   { "sections": ["orders"] }
 *
 * The store's "something changed" ping (Mage-OS module Meeovi_DirectusSync,
 * after an order, customer, product or category is saved): runs the
 * Mage-OS → Directus mirror for those sections shortly after, instead of
 * waiting for the scheduled Flows. Answers 202 straight away.
 *
 * Public on purpose, like a webhook: the ping carries no data — the mirror
 * reads everything from the store itself, signed — so a forged ping can only
 * cause an early sync, and the scheduler caps that at one run per section per
 * MAGEOS_NOTIFY_MIN_INTERVAL_MS. With MAGEOS_NOTIFY_SECRET set, the ping must
 * also send it as X-Mageos-Notify-Secret.
 */
export function mirrorRoutes({ router, config, logger, backend }: RouteContext, directus: DirectusServicesContext) {
  const scheduler = createMirrorScheduler(async (section) => {
    const stats = await mirror(section, backend(), await directusStore(directus))
    logger.info(`[mageos-sync] notified ${JSON.stringify(stats)}`)
  }, {
    debounceMs: config.notify.debounceMs,
    minIntervalMs: config.notify.minIntervalMs,
    onError: (section, error) => logger.warn(`[mageos-sync] notified ${section} failed: ${error instanceof Error ? error.message : String(error)}`),
  })

  const secretOk = (sent: unknown) => {
    if (!config.notify.secret) return true
    const a = Buffer.from(String(sent ?? ''))
    const b = Buffer.from(config.notify.secret)
    return a.length === b.length && timingSafeEqual(a, b)
  }

  router.post('/mirror/notify', route(logger, async (req, res) => {
    if (!secretOk(req.get('x-mageos-notify-secret'))) throw new CommerceError('FORBIDDEN', 'Wrong or missing X-Mageos-Notify-Secret')
    backend() // 503 while the store isn't configured
    const body = (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) ? req.body as Record<string, unknown> : {}
    const asked = body.sections ?? body.section ?? 'orders'
    const sections = (Array.isArray(asked) ? asked : [asked]).map(String)
    if (!sections.length || sections.length > MIRROR_SECTIONS.length || !sections.every((s) => (MIRROR_SECTIONS as string[]).includes(s))) {
      throw new CommerceError('INVALID_QUERY', `sections must be some of: ${MIRROR_SECTIONS.join(', ')}`)
    }
    const result = Object.fromEntries([...new Set(sections)].map((s) => [s, scheduler.request(s as MirrorSection)]))
    res.set('Cache-Control', 'no-store')
    res.status(202).json({ data: result })
  }))
}
