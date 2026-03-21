import { createError, defineEventHandler } from 'h3'
import { proxySocialRequest } from '../../../utils/proxy'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = String(config.socialApi?.wordpressUrl || '').replace(/\/$/, '')
  const token = String(config.socialApi?.wordpressToken || '')

  if (!baseUrl || !token) {
    throw createError({ statusCode: 500, statusMessage: 'Social WordPress API is not configured' })
  }

  return proxySocialRequest(event, {
    prefix: '/wp-json/buddypress/v1',
    baseUrl,
    token,
    errorMessage: 'BuddyPress proxy request failed',
  })
})