import { createError } from 'h3'

// The address packages ship FROM is a property of the seller/warehouse, not
// something a buyer's browser should ever supply — always resolve it
// server-side from configuration, never accept it in a request body.
export function getShippingOrigin() {
  const origin = {
    name: process.env.SHIPPO_ORIGIN_NAME,
    company: process.env.SHIPPO_ORIGIN_COMPANY,
    street1: process.env.SHIPPO_ORIGIN_STREET1,
    street2: process.env.SHIPPO_ORIGIN_STREET2,
    city: process.env.SHIPPO_ORIGIN_CITY,
    state: process.env.SHIPPO_ORIGIN_STATE,
    zip: process.env.SHIPPO_ORIGIN_ZIP,
    country: process.env.SHIPPO_ORIGIN_COUNTRY,
    phone: process.env.SHIPPO_ORIGIN_PHONE,
    email: process.env.SHIPPO_ORIGIN_EMAIL,
  }

  if (!origin.street1 || !origin.city || !origin.state || !origin.zip || !origin.country) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Shipping origin address is not configured (set SHIPPO_ORIGIN_STREET1, _CITY, _STATE, _ZIP, _COUNTRY)',
    })
  }

  return origin as {
    name?: string
    company?: string
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country: string
    phone?: string
    email?: string
  }
}
