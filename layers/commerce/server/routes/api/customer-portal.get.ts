import { getPolarClient } from '../../utils/polar'
import { requireAuth } from '#auth/server/utils/sessions'

export default defineEventHandler(async (event) => {
  // Customer ID is derived from the authenticated session only — it must
  // never be trusted from a query parameter, which would let anyone view
  // another customer's billing portal by guessing an id or email.
  const user = await requireAuth(event)
  const polar = getPolarClient()

  let customerId = user.polarCustomerId as string | undefined

  if (!customerId) {
    const customers = await polar.customers.list({ email: user.email })
    const existingCustomer = customers.result.items[0]
    customerId = existingCustomer
      ? existingCustomer.id
      : (await polar.customers.create({ email: user.email, externalId: user.id })).id
  }

  const portal = await polar.customerSessions.create({ customerId })
  return sendRedirect(event, portal.customerPortalUrl)
})