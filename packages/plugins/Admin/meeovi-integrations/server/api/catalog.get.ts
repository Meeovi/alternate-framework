import { defineEventHandler } from 'h3'
import type { IntegrationCatalogResponse } from '../../runtime/types'
import { catalogRows, installsFor, integrationsUser, toCatalogItem } from '../utils/installs'

/** GET {apiBase} — the catalog, with each entry's state for the signed-in user. */
export default defineEventHandler(async (event): Promise<IntegrationCatalogResponse> => {
  const user = await integrationsUser(event)
  const [rows, installs] = await Promise.all([
    catalogRows(event),
    user ? installsFor(event, user.id) : Promise.resolve([]),
  ])
  const installedAt = new Map(installs.map((i) => [Number(i.integration), i.date_created ?? '']))
  return {
    signedIn: Boolean(user),
    items: rows.map((row) => {
      const at = installedAt.get(row.id)
      // An install whose entry was unpublished / unlinked no longer counts.
      const live = at !== undefined && String(row.status ?? '').toLowerCase() === 'published' && Boolean(row.plugin?.trim())
      return toCatalogItem(row, live ? at! : null)
    }),
  }
})
