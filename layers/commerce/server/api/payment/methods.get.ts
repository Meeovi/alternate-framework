import { requireAuth } from '#auth/server/utils/sessions'
import { stripe } from '../../utils/stripe'

/**
 * GET /api/payment/methods
 *
 * Saved card payment methods for the signed-in user, read from the
 * Stripe customer linked to their account (`user.stripeCustomerId`, set
 * server-side by the better-auth Stripe plugin).
 *
 * Degrades to an empty list rather than erroring when Stripe isn't
 * configured or the user has no linked customer yet, so the settings page
 * can always render a clean "no saved methods" state.
 */
export interface SavedPaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  name: string | null
}

export default defineEventHandler(async (event): Promise<{ methods: SavedPaymentMethod[] }> => {
  const user = await requireAuth(event)
  const stripeCustomerId = (user as { stripeCustomerId?: string }).stripeCustomerId

  if (!stripeCustomerId || !process.env.NUXT_STRIPE_SECRET_KEY) {
    return { methods: [] }
  }

  try {
    const result = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
      limit: 20,
    })

    const methods: SavedPaymentMethod[] = result.data
      .filter((pm) => pm.card)
      .map((pm) => ({
        id: pm.id,
        brand: pm.card!.brand,
        last4: pm.card!.last4,
        expMonth: pm.card!.exp_month,
        expYear: pm.card!.exp_year,
        name: pm.billing_details?.name ?? null,
      }))

    return { methods }
  } catch (error) {
    console.error('[payment:methods] failed to list Stripe payment methods', error)
    return { methods: [] }
  }
})
