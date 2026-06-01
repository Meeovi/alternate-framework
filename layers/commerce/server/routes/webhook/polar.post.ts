import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig() as any
  const polarWebhookSecret = String(config.polarWebhookSecret || '')
  const webhooksHandler = Webhooks({
    webhookSecret: polarWebhookSecret,
    onPayload: async (payload) => {
      console.log(payload)
    },
  })
  return webhooksHandler(event)
})