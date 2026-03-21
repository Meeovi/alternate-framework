import { createError, defineEventHandler } from 'h3'
import { proxySocialRequest } from '../../../utils/proxy'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = String(config.socialApi?.commerceUrl || '').replace(/\/$/, '')
  const token = String(config.socialApi?.commerceToken || '')

  if (!baseUrl || !token) {
    throw createError({ statusCode: 500, statusMessage: 'Social commerce API is not configured' })
  }

  return proxySocialRequest(event, {
    prefix: '',
    baseUrl,
    token,
    errorMessage: 'Commerce proxy request failed',
  })
})