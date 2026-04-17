import { defineNitroPlugin } from '#imports'
import { setSocialConfig } from '../../app/composables/core/config'

export default defineNitroPlugin((nitroApp) => {
  const baseUrl = process.env.MASTO_BASE_URL || '/api/masto'
  const apiKey = process.env.MASTO_API_KEY || process.env.MASTO_API_TOKEN || ''

  setSocialConfig({ baseUrl, apiKey, provider: 'adapter-federation' as const })
})
