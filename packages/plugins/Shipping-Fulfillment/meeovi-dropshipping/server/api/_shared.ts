import { createError } from 'h3'
import type { H3Event } from 'h3'
import { ID, type Seller } from '../utils/context'
import { store, type ConnectionRow } from '../utils/store'

/** The seller's own connection, or 404 (never reveals other sellers' ids). */
export async function ownConnection(event: H3Event, seller: Seller, id: unknown): Promise<ConnectionRow> {
  const connectionId = String(id ?? '')
  if (!ID.test(connectionId)) throw createError({ statusCode: 400, statusMessage: 'Choose a supplier connection' })
  const connection = await store(event).connections.get(connectionId)
  if (!connection || connection.user_id !== seller.id || connection.status === 'disconnected') {
    throw createError({ statusCode: 404, statusMessage: 'Supplier connection not found' })
  }
  return connection
}

/** Supplier errors → a clean 4xx/502 with the supplier's message. */
export function supplierFailure(error: unknown): never {
  const status = (error as { status?: number })?.status
  if (status && status >= 400 && status < 600 && (error as { statusMessage?: string }).statusMessage) throw error
  throw createError({
    statusCode: status && status < 500 ? status : 502,
    statusMessage: String((error as Error)?.message || 'The supplier did not respond').slice(0, 300),
  })
}
