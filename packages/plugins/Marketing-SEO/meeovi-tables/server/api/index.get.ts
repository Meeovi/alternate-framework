import { defineEventHandler } from 'h3'
import type { MeeoviTablesIndexResponse } from '../../runtime/types'
import { sourcesFor } from '../sources'
import { hasSession, tablesConfig } from '../utils/access'

/** GET {apiBase} — the tables this visitor may open, and which sources can serve each. */
export default defineEventHandler(async (event): Promise<MeeoviTablesIndexResponse> => {
  const { collections } = tablesConfig(event)
  const signedIn = await hasSession(event)
  const visible = Object.entries(collections).filter(([, o]) => (o.access ?? 'authenticated') === 'public' || signedIn)

  return {
    collections: await Promise.all(visible.map(async ([collection, o]) => ({
      collection,
      label: o.label || collection,
      access: o.access ?? 'authenticated',
      sources: (await sourcesFor(collection)).map((s) => s.id),
    }))),
  }
})
