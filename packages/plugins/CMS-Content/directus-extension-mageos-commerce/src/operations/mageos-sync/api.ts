import { defineOperationApi } from '@directus/extensions-sdk'
import type { ICommerceAdapter } from '../../adapters/base.adapter'
import { createAdapter } from '../../backend'
import { readConfig } from '../../config'
import { directusStore } from '../../mirror/directus-store'
import { MIRROR_SECTIONS, mirror, type MirrorSection, type MirrorStats } from '../../mirror/sync'

/**
 * Flow operation "Mage-OS sync": copies the store's products, categories,
 * orders and customers into Directus (src/mirror). Writes skip the
 * collections' own event Flows and hooks (emitEvents: false), so mirrored
 * orders don't run the app's order/invoice Flows.
 */

type Options = { section?: MirrorSection | 'all' }

let adapter: ICommerceAdapter | null = null

export default defineOperationApi<Options>({
  id: 'mageos-sync',
  handler: async ({ section = 'all' }, { services, database, getSchema, env, logger }) => {
    const sections = section === 'all' ? MIRROR_SECTIONS : [section]
    if (!sections.every((s) => MIRROR_SECTIONS.includes(s))) throw new Error(`Unknown section "${section}"`)

    adapter ??= createAdapter(readConfig(env))
    const store = await directusStore({ services, database, getSchema })

    // One section failing doesn't stop the others; the run still fails so the Flow log shows it.
    const results: MirrorStats[] = []
    const failures: string[] = []
    for (const name of sections) {
      try {
        const stats = await mirror(name, adapter, store)
        results.push(stats)
        logger.info(`[mageos-sync] ${JSON.stringify(stats)}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        failures.push(`${name}: ${message}`)
        logger.warn(`[mageos-sync] ${name} failed: ${message}`)
      }
    }
    if (failures.length) throw new Error(`Mage-OS sync failed for ${failures.join('; ')} (done: ${JSON.stringify(results)})`)
    return results
  },
})
