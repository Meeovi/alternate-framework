import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { addPaymentLog } from '../../utils/polar'

// This is the Polar webhook endpoint actually configured on the Polar
// dashboard (Organization Settings -> Webhooks -> this route's URL). The
// @polar-sh/better-auth plugin (setupPolar() in ../../utils/polar.ts) also
// defines a webhooks sub-plugin, but that plugin is never registered on the
// live betterAuth() instance (see layers/auth/shared/utils/plugins.ts) — its
// route doesn't actually exist. This route is the one that receives real
// traffic, so it does the real fulfillment work.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig() as any
  const polarWebhookSecret = String(config.polarWebhookSecret || '')
  const webhooksHandler = Webhooks({
    webhookSecret: polarWebhookSecret,
    onPayload: async (payload) => {
      await addPaymentLog(payload.type || '', payload.data as Record<string, any>)
    },
  })
  return webhooksHandler(event)
})