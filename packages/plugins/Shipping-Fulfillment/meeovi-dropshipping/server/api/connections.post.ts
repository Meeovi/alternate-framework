import { createError, defineEventHandler, readBody } from 'h3'
import { getProvider } from '../providers'
import { dropshipConfig, requireSeller, sealCredentials } from '../utils/context'
import { store, toConnection } from '../utils/store'
import { supplierFailure } from './_shared'

/** Connect a supplier account: verify the credentials with the supplier, store them sealed. */
export default defineEventHandler(async (event) => {
  const seller = await requireSeller(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const providerId = String(body?.provider ?? '')
  const provider = getProvider(providerId)
  if (!provider || !dropshipConfig(event).providers.includes(providerId)) {
    throw createError({ statusCode: 400, statusMessage: 'Choose a supported supplier' })
  }
  const input = Object.fromEntries(['token', 'storeId', 'apiKey'].map((k) => [k, typeof body?.[k] === 'string' ? (body[k] as string) : '']))

  const existing = (await store(event).connections.forUser(seller.id)).filter((c) => c.status !== 'disconnected')
  if (existing.length >= 10) throw createError({ statusCode: 409, statusMessage: 'You can connect up to 10 supplier accounts' })

  const { credentials, label } = await provider.connect(input).catch(supplierFailure)
  const row = await store(event).connections.create({
    user_id: seller.id,
    magento_customer_id: seller.magentoCustomerId,
    provider: provider.id,
    label,
    credentials: sealCredentials(credentials, event),
    status: 'active',
    last_error: null,
    auto_confirm_orders: false,
  })
  return toConnection(row)
})
