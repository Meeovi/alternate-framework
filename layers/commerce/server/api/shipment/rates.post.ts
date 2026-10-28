import Joi from 'joi'
import { createCustomsDeclaration, createShipment } from '../../utils/shippo'
import { getShippingOrigin } from '../../utils/shipping-origin'
import { resolveProductForCart } from '../../utils/cart'
import { createError } from 'h3'

const parcelSchema = Joi.object({
  length: Joi.string().required(),
  width: Joi.string().required(),
  height: Joi.string().required(),
  distance_unit: Joi.string().valid('in', 'cm').required(),
  weight: Joi.string().required(),
  mass_unit: Joi.string().valid('lb', 'kg').required(),
})

const addressSchema = Joi.object({
  name: Joi.string().optional(),
  company: Joi.string().optional(),
  street1: Joi.string().required(),
  street2: Joi.string().optional(),
  city: Joi.string().required(),
  // Many countries have no state or region (the UK, for one).
  state: Joi.string().allow('').optional(),
  zip: Joi.string().required(),
  country: Joi.string().length(2).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
})

const schema = Joi.object({
  address_to: addressSchema.required(),
  parcels: Joi.array().items(parcelSchema).min(1).max(100).required(),
  async: Joi.boolean().default(false),
  label_file_type: Joi.string().valid(
    'PDF_4x6', 'PDF_4x8', 'PDF_A4', 'PDF_A5', 'PDF_A6', 'PDF', 'PNG', 'ZPLII',
  ).default('PDF_4x6'),
  extra: Joi.object().optional(),
  // The cart, for the customs declaration an international label needs.
  items: Joi.array().items(Joi.object({
    id: Joi.string().max(200).required(),
    quantity: Joi.number().integer().min(1).max(1000).required(),
  })).max(100).optional(),
})

/**
 * The customs declaration carriers require on an international label.
 * Names and values come from the catalogue, never the browser. Weight is the
 * same 1 lb-per-item estimate the checkout's parcel uses.
 */
async function customsFor(items: { id: string, quantity: number }[], origin: ReturnType<typeof getShippingOrigin>) {
  const lines = await Promise.all(items.map(async (item) => {
    const product = await resolveProductForCart(item.id)
    if (!product) throw createError({ statusCode: 400, statusMessage: `Unknown product: ${item.id}` })
    return {
      description: String(product.name || item.id).slice(0, 50),
      quantity: item.quantity,
      net_weight: String(item.quantity),
      mass_unit: 'lb' as const,
      value_amount: (Number(product.price) * item.quantity).toFixed(2),
      value_currency: 'USD',
      origin_country: String(origin.country),
    }
  }))
  const declaration = await createCustomsDeclaration({
    contents_type: 'MERCHANDISE',
    non_delivery_option: 'RETURN',
    certify: true,
    certify_signer: String(origin.name || origin.company || 'Meeovi'),
    // Duties are the buyer's to pay on delivery.
    incoterm: 'DDU',
    // US exports under $2,500 a line need no EEI filing; this is the
    // exemption code carriers expect.
    ...(String(origin.country).toUpperCase() === 'US' && { eel_pfc: 'NOEEI_30_37_a' }),
    items: lines,
  })
  return declaration.object_id
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = schema.validate(body, { abortEarly: false })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const origin = getShippingOrigin()
    const { items, ...shipment } = value
    const international = String(shipment.address_to.country).toUpperCase() !== String(origin.country).toUpperCase()
    if (international && !items?.length) {
      throw createError({ statusCode: 400, statusMessage: 'International shipping needs the items being sent' })
    }

    const result = await createShipment({
      ...shipment,
      address_from: origin,
      ...(international && { customs_declaration: await customsFor(items, origin) }),
    })

    return { success: true, rates: result.rates, shipmentId: result.object_id }
  } catch (error: any) {
    console.error('[shippo:rates] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Rate shopping failed',
    })
  }
})
