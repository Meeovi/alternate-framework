import { executeJsonRequest } from '../../../utils/gateway-transport'
import { createError, defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const countryId = typeof query.countryId === 'string' ? query.countryId.trim() : ''
  const value = typeof query.value === 'string' ? query.value.trim() : ''

  if (!countryId || !value) {
    throw createError({ statusCode: 400, statusMessage: 'countryId and value are required' })
  }

  try {
    return await executeJsonRequest(
      `https://api.zippopotam.us/${encodeURIComponent(countryId)}/${encodeURIComponent(value)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      {
        timeoutMs: 5000,
      },
    )
  } catch (error: any) {
    throw createError({
      statusCode: error?.status || 502,
      statusMessage: error?.message || 'Zipcode lookup failed',
      data: error?.details,
    })
  }
})