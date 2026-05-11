import { defineEventHandler } from 'h3'
import { getSupportedSocialProviderIds } from '../../utils/social-providers'

export default defineEventHandler(() => {
  return {
    providers: getSupportedSocialProviderIds(),
  }
})
