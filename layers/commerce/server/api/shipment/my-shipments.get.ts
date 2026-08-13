import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

const directusServer = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))

// Same ownership model as order-tracking.get.ts, but listing every shipped
// order for the signed-in buyer rather than looking up one by id. Scoped
// server-side with a privileged token — the client's own Directus token has
// no per-session row scoping, so this must not be queried directly from the
// browser (see sales/shipments.vue, which previously did exactly that).
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const orders = await directusServer.request(
    readItems('orders', {
      fields: ['id', 'date_created', 'tracking_number', 'shipment_carrier', 'shipment_status'],
      filter: {
        user_id: { _eq: user.id },
        tracking_number: { _nnull: true },
      },
      sort: ['-date_created'],
    }),
  )

  return Array.isArray(orders) ? orders : []
})
