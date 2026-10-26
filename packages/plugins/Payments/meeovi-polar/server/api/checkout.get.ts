import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import { absoluteUrl, polarConfig, polarError, requirePolarUser, resolveProducts, usePolar } from '../utils/polar'

/**
 * GET {apiBase}/checkout?products=<slug or id>[,…] — sends the signed-in
 * user to Polar's hosted checkout. The checkout is always for the account's
 * own email and user id (Polar's externalCustomerId), never one from the URL.
 */
export default defineEventHandler(async (event) => {
  const user = await requirePolarUser(event)
  const products = resolveProducts(event, getQuery(event).products)
  const config = polarConfig(event)

  let url: string
  try {
    const checkout = await usePolar(event).checkouts.create({
      products,
      externalCustomerId: user.id,
      customerEmail: user.email,
      ...(user.name ? { customerName: user.name } : {}),
      successUrl: absoluteUrl(event, config.successUrl),
      returnUrl: absoluteUrl(event, config.returnUrl),
    })
    url = checkout.url
  } catch (error) {
    polarError(error, 'checkout')
  }
  return sendRedirect(event, url, 303)
})
