import Joi from 'joi'

/** A checkout as /checkout sends it: what to price, never a price. */
export const checkoutSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    quantity: Joi.number().integer().min(1).max(100).required(),
  }).unknown(true)).min(1).max(100).required(),
  currency: Joi.string().length(3).lowercase().default('usd'),
  // An opaque Shippo rate id chosen on /checkout; its amount is re-fetched.
  shippoRateId: Joi.string().max(64).optional(),
  // The address the rate was quoted for; PayPal ships to it and tax is
  // worked out from it.
  shippingAddress: Joi.object({
    name: Joi.string().allow('').max(300).optional(),
    street1: Joi.string().allow('').max(300).optional(),
    street2: Joi.string().allow('').max(300).optional(),
    city: Joi.string().allow('').max(120).optional(),
    state: Joi.string().allow('').max(300).optional(),
    zip: Joi.string().allow('').max(60).optional(),
    country: Joi.string().allow('').max(2).optional(),
    phone: Joi.string().allow('').max(30).optional(),
    email: Joi.string().allow('').max(300).optional(),
  }).optional(),
})

export function validateCheckout<T>(schema: Joi.ObjectSchema, body: unknown): T {
  const { error, value } = schema.validate(body, { abortEarly: false })
  if (error) {
    throw createError({ statusCode: 400, statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}` })
  }
  return value as T
}
