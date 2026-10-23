import { defineOperationApi } from '@directus/extensions-sdk'
import type { ICommerceAdapter } from '../../adapters/base.adapter'
import { createAdapter } from '../../backend'
import { readConfig } from '../../config'
import { MIRROR_SECTIONS, mirror, type MirrorSection, type MirrorStats, type MirrorStore } from '../../mirror/sync'

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
    const schema = await getSchema()
    const items = (collection: string) => new services.ItemsService(collection, { schema, knex: database })
    const quiet = { emitEvents: false }
    const store: MirrorStore = {
      read: (collection, filter, fields, options = {}) =>
        // Plain Directus filter objects; the SDK's Filter type is a strict union.
        items(collection).readByQuery({ filter: filter as never, fields, sort: options.sort, limit: options.limit ?? -1 }),
      create: async (collection, rows) => { await items(collection).createMany(rows, quiet) },
      update: async (collection, key, row) => { await items(collection).updateOne(key, row, quiet) },
    }

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
