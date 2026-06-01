import { getPolarClient } from '../../utils/polar'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const polar = getPolarClient()
  let customerId = query.customerId as string
  const customerEmail = query.customerEmail as string
  if (!customerId && customerEmail) {
    const customers = await polar.customers.list({ email: customerEmail })
    const firstCustomer = customers.result.items[0]
    if (firstCustomer) customerId = firstCustomer.id
    else {
      const newCustomer = await polar.customers.create({ email: customerEmail })
      customerId = newCustomer.id
    }
  }
  if (!customerId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Customer ID not found',
    })
  const portal = await polar.customerSessions.create({ customerId })
  return sendRedirect(event, portal.customerPortalUrl)
})