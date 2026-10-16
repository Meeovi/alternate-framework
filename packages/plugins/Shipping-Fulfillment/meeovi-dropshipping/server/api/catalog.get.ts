import { defineEventHandler, getQuery } from 'h3'
import { requireSeller } from '../utils/context'
import { credentialsFor } from '../utils/jobs'
import { ownConnection, supplierFailure } from './_shared'

/** Browse the supplier: Printful = the seller's own products; CJ = CJ's catalogue. */
export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  const query = getQuery(event)
  const connection = await ownConnection(event, seller, query.connection)
  const page = Math.min(Math.max(Number.parseInt(String(query.page ?? '1'), 10) || 1, 1), 500)
  const search = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const { provider, credentials } = await credentialsFor(connection, event).catch(supplierFailure)
  return provider.listCatalog(credentials, { page, query: search || undefined }).catch(supplierFailure)
})
