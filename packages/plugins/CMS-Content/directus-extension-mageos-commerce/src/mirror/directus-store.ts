import type { MirrorStore } from './sync'

/** What a Directus extension's context provides for item writes. */
// Loosely typed: endpoint and operation contexts type these differently.
export interface DirectusServicesContext {
  services: { ItemsService: any }
  database: any
  getSchema: (...args: any[]) => Promise<any>
}

/**
 * Directus's own collections as the mirror's MirrorStore. No accountability
 * (full access, no activity/revisions) and emitEvents: false, so mirrored
 * writes don't run the collections' own Flows and hooks.
 */
export async function directusStore({ services, database, getSchema }: DirectusServicesContext): Promise<MirrorStore> {
  const schema = await getSchema()
  const items = (collection: string) => new services.ItemsService(collection, { schema, knex: database })
  const quiet = { emitEvents: false }
  return {
    read: (collection, filter, fields, options = {}) =>
      // Plain Directus filter objects; the SDK's Filter type is a strict union.
      items(collection).readByQuery({ filter: filter as never, fields, sort: options.sort, limit: options.limit ?? -1 }),
    create: async (collection, rows) => { await items(collection).createMany(rows, quiet) },
    update: async (collection, key, row) => { await items(collection).updateOne(key, row, quiet) },
  }
}
