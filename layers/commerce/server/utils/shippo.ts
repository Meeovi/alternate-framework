
const API_VERSION = '2018-02-08'
const BASE_URL = 'https://api.goshippo.com'

function getShippoConfig(): { apiKey: string; baseUrl: string } {
  const config = useRuntimeConfig()
  return {
    apiKey: config.shippoApiKey as string,
    baseUrl: BASE_URL,
  }
}

function shippoHeaders(extra?: Record<string, string>): Record<string, string> {
  const { apiKey } = getShippoConfig()
  return {
    Authorization: `ShippoToken ${apiKey}`,
    'Content-Type': 'application/json',
    'Shippo-API-Version': API_VERSION,
    ...extra,
  }
}

function handleShippoError(response: Response, context: string): never {
  throw new Error(`Shippo ${context} failed: ${response.status} ${response.statusText}`)
}

/**
 * Generic Shippo API request helper.
 */
async function shippoFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { baseUrl } = getShippoConfig()
  const url = `${baseUrl}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...shippoHeaders(options.headers as Record<string, string> | undefined),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Shippo ${path}: ${response.status} ${body}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

/**
 * Validate an address. Takes v1 field names (street1, city, state, zip, country).
 * Returns validation results including is_valid, messages, and address_type.
 */
export async function validateAddress(address: {
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  email?: string
  phone?: string
}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(address)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }

  return shippoFetch<{
    object_id: string
    is_valid: boolean
    messages: string[]
    address_type: ' residential' | 'commercial' | 'unknown'
    changed_attributes: Record<string, string>
    zip4?: string
  }>(`/addresses/validate?${params.toString()}`)
}

/**
 * Create an address object. Uses v1 field names for inline addresses
 * and v2 field names for standalone address objects.
 */
export async function createAddress(address: {
  name?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  email?: string
  phone?: string
  address_type?: 'residential' | 'commercial'
}) {
  return shippoFetch<{ object_id: string; is_valid: boolean }>('/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  })
}

/**
 * Create a shipment and get rates. Uses v1 inline address fields
 * (street1, city, state, zip, country) and parcel dimensions as strings.
 */
export async function createShipment(shipment: {
  address_from: {
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country: string
    email?: string
    phone?: string
    name?: string
    company?: string
  }
  address_to: {
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country: string
    email?: string
    phone?: string
    name?: string
    company?: string
  }
  parcels: Array<{
    length: string
    width: string
    height: string
    distance_unit: 'in' | 'cm'
    weight: string
    mass_unit: 'lb' | 'kg'
  }>
  async?: boolean
  label_file_type?: 'PDF_4x6' | 'PDF_4x8' | 'PDF_A4' | 'PDF_A5' | 'PDF_A6' | 'PDF' | 'PNG' | 'ZPLII'
  special_services?: string[]
  extra?: Record<string, unknown>
  customs_declaration?: string
}) {
  return shippoFetch<{
    object_id: string
    // Confirmed live: the shipment result field is `status`, not
    // `object_status` (see createTransaction below for the same mixup).
    status: string
    object_created: string
    // Confirmed live: individual rate objects don't carry a status field
    // at all — they're just quotes, not a processing result.
    rates: Array<{
      object_id: string
      provider: string
      servicelevel: string
      servicelevel_name: string
      amount: string
      currency: string
      estimated_days: number
      object_created: string
    }>
  }>('/shipments', {
    method: 'POST',
    body: JSON.stringify(shipment),
  })
}

/**
 * Retrieve a single rate by id. Used to re-verify a rate's amount
 * server-side before charging for it — never trust a shipping cost sent
 * from the client, the same way a product price is never trusted.
 */
export async function getRate(rateId: string) {
  return shippoFetch<{
    object_id: string
    provider: string
    servicelevel: { name: string; token: string }
    amount: string
    currency: string
    estimated_days: number
  }>(`/rates/${encodeURIComponent(rateId)}`)
}

export interface ShippoTransaction {
  object_id: string
  status: string
  tracking_number: string
  tracking_url_provider: string
  label_url: string
  messages: string[]
  eta: string | null
}

/**
 * Retrieve a single transaction by id — used to poll a just-created
 * transaction through to a terminal state (see createTransaction below).
 */
export async function getTransaction(transactionId: string) {
  return shippoFetch<ShippoTransaction>(`/transactions/${encodeURIComponent(transactionId)}`)
}

const TERMINAL_TRANSACTION_STATUSES = new Set(['SUCCESS', 'ERROR'])

/**
 * Purchase a label by creating a transaction from a rate.
 */
export async function createTransaction(transaction: {
  rate: string
  label_file_type?: string
  async?: boolean
  reference?: string
  // Shippo's real API expects a plain string here (confirmed live: a
  // structured object throws "metadata: Not a valid string"), not a
  // structured object — it's a free-text notes field, not JSON.
  metadata?: string
  extra?: Record<string, unknown>
}) {
  // Confirmed live: the transaction's result field is `status`
  // ("SUCCESS"/"ERROR"/etc) — `object_status` doesn't exist on this
  // response at all (that name only applies to some other Shippo
  // resources). `object_state` also exists but means something different
  // (whether the object itself is valid/not deleted, not the transaction
  // outcome) — easy to confuse with `status` since both are present.
  //
  // Confirmed live (twice, reproducibly): even with async left at its
  // default (false/synchronous), this POST can return before the carrier
  // purchase has actually finished — status comes back in a non-terminal
  // state (empty messages, not SUCCESS or ERROR) while the same
  // transaction, queried moments later, shows SUCCESS with a real
  // tracking number and label. Poll briefly until it reaches a terminal
  // status rather than treating "not immediately SUCCESS" as a failure.
  const initial = await shippoFetch<ShippoTransaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  })

  let current = initial
  const maxAttempts = 6
  const delayMs = 1500
  for (let attempt = 0; attempt < maxAttempts && !TERMINAL_TRANSACTION_STATUSES.has(current.status); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    current = await getTransaction(current.object_id).catch(() => current)
  }

  return current
}

/**
 * Track a package by carrier and tracking number.
 * Carrier must be a lowercase Shippo token (usps, ups, fedex, dhl_express, etc.).
 */
export async function getTrack(carrier: string, trackingNumber: string) {
  return shippoFetch<{
    object_id: string
    tracking_number: string
    carrier: string
    tracking_status: {
      status: string
      status_details: string
      status_date: string
      location: string
    }
    tracking_history: Array<{
      status: string
      status_details: string
      status_date: string
      location: string
      substatus?: {
        code: string
        text: string
        action_required: boolean
      }
    }>
    eta: string | null
    tracking_url_provider: string
  }>(`/tracks/${encodeURIComponent(carrier)}/${encodeURIComponent(trackingNumber)}`)
}

/**
 * Refund / void a purchased label by transaction object_id.
 */
export async function createRefund(transactionId: string) {
  return shippoFetch<{
    object_id: string
    status: string
    transaction: string
  }>('/refunds', {
    method: 'POST',
    body: JSON.stringify({ transaction: transactionId }),
  })
}

/**
 * Create a customs declaration for international shipments.
 */
export async function createCustomsDeclaration(delaration: {
  contents_type: 'MERCHANDISE' | 'GIFT' | 'SAMPLE' | 'DOCUMENTS' | 'RETURN_MERCHANDISE' | 'HUMANITARIAN_DONATION' | 'OTHER'
  contents_explanation?: string
  non_delivery_option: 'return' | 'abandon'
  certify: boolean
  certify_signer: string
  eel_pfc?: string
  incoterm?: 'DDU' | 'DDP' | 'FCA'
  items: Array<{
    description: string
    quantity: number
    net_weight: string
    mass_unit: 'lb' | 'kg'
    value_amount: string
    value_currency: string
    origin_country: string
    tariff_number?: string
    hs_code?: string
  }>
}) {
  // Unused elsewhere in this codebase, so unverified live like the other
  // fixes in this file — applying the same field name Shippo actually
  // uses on every other resource checked (status, not object_status).
  return shippoFetch<{
    object_id: string
    status: string
  }>('/customs/declarations', {
    method: 'POST',
    body: JSON.stringify(delaration),
  })
}

/**
 * Create a customs item (alternative to inline items in declaration).
 */
export async function createCustomsItem(item: {
  description: string
  quantity?: number
  net_weight?: string
  mass_unit?: 'lb' | 'kg'
  value_amount?: string
  value_currency?: string
  origin_country?: string
  tariff_number?: string
  hs_code?: string
}) {
  return shippoFetch<{
    object_id: string
    status: string
  }>('/customs/items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

/**
 * List carrier accounts available on the Shippo account.
 */
export async function listCarrierAccounts() {
  return shippoFetch<{
    results: Array<{
      object_id: string
      carrier: string
      active: boolean
      test_mode: boolean
      account_id: string
    }>
  }>('/carrier-accounts')
}

/**
 * Create a manifest for end-of-day batch label processing.
 */
export async function createManifest(manifest: {
  carrier_account: string
  shipment_date?: string
  address_from: {
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  transactions?: string[]
}) {
  return shippoFetch<{
    object_id: string
    status: string
    shipment_count: number
    label_url: string[]
  }>('/manifests', {
    method: 'POST',
    body: JSON.stringify(manifest),
  })
}

/**
 * Create a batch of shipments for bulk label generation.
 */
export async function createBatch(batch: {
  batch_shipments: Array<{
    address_from: {
      street1: string
      street2?: string
      city: string
      state: string
      zip: string
      country: string
    }
    address_to: {
      street1: string
      street2?: string
      city: string
      state: string
      zip: string
      country: string
    }
    parcels: Array<{
      length: string
      width: string
      height: string
      distance_unit: 'in' | 'cm'
      weight: string
      mass_unit: 'lb' | 'kg'
    }>
    servicelevel_token?: string
    async?: boolean
    label_file_type?: string
    customs_declaration?: string
    extra?: Record<string, unknown>
  }>
}) {
  return shippoFetch<{
    object_id: string
    status: string
    batch_shipments: Array<{
      object_id: string
      status: string
      messages?: string[]
    }>
  }>('/batches', {
    method: 'POST',
    body: JSON.stringify(batch),
  })
}

/**
 * Get batch status and results.
 */
export async function getBatch(batchId: string) {
  return shippoFetch<{
    object_id: string
    status: string
    batch_shipments: Array<{
      object_id: string
      status: string
      messages?: string[]
      transaction?: string
    }>
    errors: string[]
  }>(`/batches/${batchId}`)
}

/**
 * Purchase all valid shipments in a batch.
 */
export async function purchaseBatch(batchId: string) {
  return shippoFetch<{
    object_id: string
    status: string
  }>(`/batches/${batchId}/purchase`, {
    method: 'POST',
  })
}

/**
 * List transactions for finding tracking numbers and labels.
 */
export async function listTransactions(params?: {
  page?: number
  limit?: number
  created?: string
}) {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))
  if (params?.created) query.append('created', params.created)

  return shippoFetch<{
    results: Array<{
      object_id: string
      status: string
      tracking_number: string
      carrier: string
      provider: string
      servicelevel: string
      amount: string
      currency: string
      label_url: string
      tracking_url_provider: string
      object_created: string
      metadata?: string
    }>
  }>(`/transactions?${query.toString()}`)
}

/**
 * Register a tracking webhook.
 */
export async function createWebhook(webhook: {
  url: string
  event: 'track_updated'
  active?: boolean
}) {
  return shippoFetch<{
    object_id: string
    url: string
    event: string
    active: boolean
  }>('/webhooks', {
    method: 'POST',
    body: JSON.stringify(webhook),
  })
}

/**
 * List registered webhooks.
 */
export async function listWebhooks() {
  return shippoFetch<{
    results: Array<{
      object_id: string
      url: string
      event: string
      active: boolean
    }>
  }>('/webhooks')
}
