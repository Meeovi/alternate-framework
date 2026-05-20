import {
  ApiTransportError,
  DEFAULT_UNSUPPORTED_GRAPHQL_PATTERNS,
  createGraphqlRestTransport,
  executeJsonRequest,
  joinUrl,
} from './gateway-transport'
import { useRuntimeConfig } from '#imports'

class CommerceAdminError extends ApiTransportError {
  statusCode: number
  override details?: unknown
  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message, statusCode, details)
    this.name = 'CommerceAdminError'
    this.statusCode = statusCode
    this.details = details
  }
}

const COMMERCE_ADMIN_UNSUPPORTED_GRAPHQL_PATTERNS = [
  ...DEFAULT_UNSUPPORTED_GRAPHQL_PATTERNS,
  /cannot return null for non-nullable field/i,
  /schema validation/i,
]

const SKU_PATTERN = /^[A-Za-z0-9._-]{1,128}$/
const MAX_TEXT_LENGTH = 5_000

function sanitizeText(value: unknown, maxLength = 255) {
  if (value === undefined || value === null) {
    return undefined
  }

  const normalized = String(value).trim()
  return normalized.slice(0, maxLength)
}

function sanitizeOptionalNumber(value: unknown, options: { min?: number; max?: number } = {}) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new CommerceAdminError('Invalid numeric field provided.', 400)
  }

  if (options.min !== undefined && parsed < options.min) {
    throw new CommerceAdminError('Numeric field is below the allowed range.', 400)
  }

  if (options.max !== undefined && parsed > options.max) {
    throw new CommerceAdminError('Numeric field is above the allowed range.', 400)
  }

  return parsed
}

export function sanitizeSku(value: unknown): string {
  const sku = sanitizeText(value, 128)

  if (!sku || !SKU_PATTERN.test(sku)) {
    throw new CommerceAdminError('Invalid sku provided.', 400)
  }

  return sku
}

export function sanitizeProductInput(input: Record<string, any>) {
  const sku = sanitizeSku(input.sku)

  return {
    sku,
    name: sanitizeText(input.name, 255),
    price: sanitizeOptionalNumber(input.price, { min: 0, max: 1_000_000 }),
    status: sanitizeOptionalNumber(input.status, { min: 0, max: 2 }),
    weight: sanitizeOptionalNumber(input.weight, { min: 0, max: 100_000 }),
    description: sanitizeText(input.description, MAX_TEXT_LENGTH),
    short_description: sanitizeText(input.short_description, 1_000),
    tax_class_id: sanitizeOptionalNumber(input.tax_class_id, { min: 0, max: 9999 }),
  }
}

function sanitizeErrorDetails(details: unknown) {
  if (Array.isArray(details)) {
    return details.map((entry) => ({
      message: entry && typeof entry === 'object' && 'message' in entry ? String((entry as any).message) : 'Provider error',
    }))
  }

  if (details && typeof details === 'object') {
    return { message: 'Provider error' }
  }

  return undefined
}

function getConfig() {
  const runtimeConfig = useRuntimeConfig() as Record<string, any>
  const commerceConfig = runtimeConfig.commerceApi || {}

  return {
    graphqlEndpoint: commerceConfig.graphqlEndpoint || runtimeConfig.mApiEndpoint || runtimeConfig.apiEndpoint || process.env.MAPI_ENDPOINT || '/api/graphql',
    restEndpoint: commerceConfig.restEndpoint || runtimeConfig.mApiRestEndpoint || process.env.COMMERCE_REST_ENDPOINT || process.env.MAGENTO_API_URL || '',
    adminToken: commerceConfig.adminToken || process.env.COMMERCE_API_TOKEN || process.env.MAGENTO_ADMIN_TOKEN || '',
    wordpressUrl: commerceConfig.wordpressUrl || process.env.WORDPRESS_URL || '',
    wordpressToken: commerceConfig.wordpressToken || process.env.WORDPRESS_TOKEN || '',
    timeoutMs: Number(runtimeConfig.mApiTimeoutMs || runtimeConfig.public?.mApiTimeoutMs || 10000),
  }
}

function toCommerceAdminError(error: unknown): CommerceAdminError {
  if (error instanceof CommerceAdminError) {
    return error
  }

  if (error instanceof ApiTransportError) {
    return new CommerceAdminError(error.message, error.status || 500, sanitizeErrorDetails(error.details))
  }

  if (error instanceof Error) {
    return new CommerceAdminError(error.message, 500)
  }

  return new CommerceAdminError('Unexpected commerce admin error', 500, error)
}

function getTransport() {
  const config = getConfig()
  const transport = createGraphqlRestTransport({
    graphqlEndpoint: config.graphqlEndpoint,
    restEndpoint: config.restEndpoint,
    timeoutMs: config.timeoutMs,
    headers: () => ({
      ...(config.adminToken ? { Authorization: `Bearer ${config.adminToken}` } : {}),
    }),
    unsupportedGraphqlPatterns: COMMERCE_ADMIN_UNSUPPORTED_GRAPHQL_PATTERNS,
  })

  return {
    config,
    transport,
  }
}

async function executeGraphql<T>(query: string, variables?: Record<string, any>) {
  const { transport } = getTransport()
  return transport.graphql<T>(query, { variables })
}

async function executeRest<T>(path: string, options: { method?: string; body?: Record<string, any> } = {}) {
  const { transport } = getTransport()
  return transport.rest<T>(path, options)
}

export async function executeWordpressRest<T>(path: string, body: Record<string, any>) {
  const { config } = getTransport()

  if (!config.wordpressUrl || !config.wordpressToken) {
    throw new CommerceAdminError('WordPress admin API is not configured.', 500)
  }

  try {
    return await executeJsonRequest<T>(
      joinUrl(config.wordpressUrl, path),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${config.wordpressToken}`,
        },
        body: JSON.stringify(body),
      },
      {
        timeoutMs: config.timeoutMs,
      },
    )
  } catch (error) {
    throw toCommerceAdminError(error)
  }
}

export function toPublicProduct(raw: Record<string, any> | null | undefined) {
  if (!raw) {
    return null
  }

  const customAttributes = Array.isArray(raw.custom_attributes)
    ? raw.custom_attributes.reduce((acc, attribute) => {
        if (attribute?.attribute_code) {
          acc[attribute.attribute_code] = attribute.value
        }
        return acc
      }, {} as Record<string, any>)
    : {}

  return {
    name: raw.name,
    sku: raw.sku,
    price: raw.price?.regularPrice?.amount?.value ?? raw.price,
    status: raw.status,
    weight: raw.weight,
    description: raw.description?.html ?? customAttributes.description ?? raw.description ?? '',
    short_description: raw.short_description?.html ?? customAttributes.short_description ?? raw.short_description ?? '',
    tax_class_id: raw.tax_class_id ?? customAttributes.tax_class_id ?? 0,
  }
}

export async function getProductForEdit(sku: string) {
  try {
    const safeSku = sanitizeSku(sku)
    const { transport } = getTransport()

    return await transport.withGraphqlFallback(
      async () => {
        const data = await executeGraphql<{ products?: { items?: Record<string, any>[] } }>(
          'query GetProductForEdit($sku: String!) { products(filter: { sku: { eq: $sku } }) { items { name sku price { regularPrice { amount { value } } } status weight description { html } short_description { html } tax_class_id } } }',
          { sku: safeSku },
        )

        return toPublicProduct(data?.products?.items?.[0])
      },
      async () => {
        const data = await executeRest<Record<string, any>>(`/products/${encodeURIComponent(safeSku)}`)
        return toPublicProduct(data)
      },
    )
  } catch (error) {
    throw toCommerceAdminError(error)
  }
}

export async function updateProduct(input: Record<string, any>) {
  try {
    const sanitizedInput = sanitizeProductInput(input)
    const { transport } = getTransport()

    return await transport.withGraphqlFallback(
      async () => {
        const data = await executeGraphql<{ updateSimpleProduct?: { product?: Record<string, any> } }>(
          'mutation UpdateProduct($sku: String!, $name: String, $price: Float, $status: Int, $weight: Float, $description: String, $short_description: String, $tax_class_id: Int) { updateSimpleProduct(input: { sku: $sku, name: $name, price: $price, status: $status, weight: $weight, description: { html: $description }, short_description: { html: $short_description }, tax_class_id: $tax_class_id }) { product { name sku price { regularPrice { amount { value } } } status weight description { html } short_description { html } tax_class_id } } }',
          sanitizedInput,
        )

        return toPublicProduct(data?.updateSimpleProduct?.product)
      },
      async () => {
        const data = await executeRest<Record<string, any>>(`/products/${encodeURIComponent(sanitizedInput.sku)}`, {
          method: 'PUT',
          body: {
            product: {
              sku: sanitizedInput.sku,
              name: sanitizedInput.name,
              price: sanitizedInput.price,
              status: sanitizedInput.status,
              weight: sanitizedInput.weight,
              custom_attributes: [
                { attribute_code: 'description', value: sanitizedInput.description || '' },
                { attribute_code: 'short_description', value: sanitizedInput.short_description || '' },
                { attribute_code: 'tax_class_id', value: sanitizedInput.tax_class_id ?? 0 },
              ],
            },
          },
        })

        return toPublicProduct(data)
      },
    )
  } catch (error) {
    throw toCommerceAdminError(error)
  }
}

export async function deleteProduct(sku: string) {
  try {
    const safeSku = sanitizeSku(sku)
    const { transport } = getTransport()

    return await transport.withGraphqlFallback(
      async () => {
        const data = await executeGraphql<{ deleteProducts?: { result?: boolean } }>(
          'mutation DeleteProduct($sku: String!) { deleteProducts(skus: [$sku]) { result } }',
          { sku: safeSku },
        )

        return { result: Boolean(data?.deleteProducts?.result) }
      },
      async () => {
        await executeRest(`/products/${encodeURIComponent(safeSku)}`, {
          method: 'DELETE',
        })

        return { result: true }
      },
    )
  } catch (error) {
    throw toCommerceAdminError(error)
  }
}

export { CommerceAdminError }