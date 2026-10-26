import { createError, defineEventHandler, sendRedirect } from 'h3'
import { absoluteUrl, polarConfig, polarError, requirePolarUser, usePolar } from '../utils/polar'

/**
 * GET {apiBase}/portal — sends the signed-in user to Polar's customer
 * portal (orders, subscriptions, invoices). 404 when they've never bought
 * anything through Polar.
 */
export default defineEventHandler(async (event) => {
  const user = await requirePolarUser(event)
  let url: string
  try {
    const session = await usePolar(event).customerSessions.create({
      externalCustomerId: user.id,
      returnUrl: absoluteUrl(event, polarConfig(event).returnUrl),
    })
    url = session.customerPortalUrl
  } catch (error) {
    if (Number((error as { statusCode?: number })?.statusCode) === 404) {
      throw createError({ statusCode: 404, statusMessage: 'No billing account found for this user' })
    }
    polarError(error, 'customer portal')
  }
  return sendRedirect(event, url, 303)
})
