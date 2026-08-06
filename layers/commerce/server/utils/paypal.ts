
interface PayPalConfig {
  clientId: string
  clientSecret: string
  baseUrl: string
}

function getPayPalConfig(): PayPalConfig {
  const config = useRuntimeConfig()
  const mode = (config.paypalMode || 'sandbox') as string
  return {
    clientId: config.paypalClientId as string,
    clientSecret: config.paypalClientSecret as string,
    baseUrl:
      mode === 'sandbox' || mode === 'test'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com',
  }
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
}

/**
 * Exchange PayPal server credentials for an access token
 * used for server-to-server API calls.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = getPayPalConfig()

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`PayPal token request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Generate a browser-safe client token for the PayPal v6 SDK.
 * Per PayPal v6 docs, this calls /v1/oauth2/token with
 * response_type=client_token. The returned access_token
 * is a short-lived (~15 minute) browser-safe token.
 */
export async function getBrowserSafeClientToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = getPayPalConfig()

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: 'grant_type=client_credentials&response_type=client_token',
  })

  if (!response.ok) {
    throw new Error(`PayPal client token request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Create a PayPal order via the v2 Checkout Orders API.
 * Per PayPal v6 docs, the createOrder function on the frontend
 * must return { orderId: string }. This server-side endpoint
 * creates the order and returns the order ID.
 */
export async function createPayPalOrder(
  amount: number,
  currency: string,
  idempotencyKey?: string,
): Promise<{ id: string; status: string }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    'Prefer': 'return=representation',
  }

  if (idempotencyKey) {
    headers['PayPal-Request-Id'] = idempotencyKey
  }

  const body: Record<string, unknown> = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2),
        },
      },
    ],
  }

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorMsg = error?.message || error?.details?.[0]?.description || JSON.stringify(error)
    throw new Error(`PayPal order creation failed: ${errorMsg}`)
  }

  return response.json()
}

/**
 * Capture a PayPal order after the buyer approves it.
 * Per PayPal v6 docs, the order must be captured server-side
 * to complete the payment.
 */
export async function capturePayPalOrder(
  orderId: string,
  idempotencyKey?: string,
): Promise<{ id: string; status: string }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    'Prefer': 'return=representation',
  }

  if (idempotencyKey) {
    headers['PayPal-Request-Id'] = idempotencyKey
  }

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers,
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorMsg = error?.message || error?.details?.[0]?.description || JSON.stringify(error)
    throw new Error(`PayPal order capture failed: ${errorMsg}`)
  }

  return response.json()
}

/**
 * Create a PayPal subscription plan (recurring payments).
 * Per PayPal Billing API, subscriptions are created via
 * /v1/billing/subscriptions endpoint.
 */
export async function createPayPalSubscriptionPlan(
  name: string,
  description: string,
  billingCycles: Array<{
    tenureType: 'REGULAR' | 'TRIAL' | 'INTRODUCTORY'
    sequence: number
    totalCycles: number
    pricingScheme: { fixedPrice: { value: string; currencyCode: string } }
    frequency: { intervalUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'; intervalCount: number }
  }>,
  paymentPreference?: {
    autoBillOutstanding?: boolean
    setupFee?: { value: string; currencyCode: string }
    paymentFailureThreshold?: number
  },
): Promise<{ id: string; status: string }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const body: Record<string, unknown> = {
    product_id: name,
    name,
    description,
    billing_cycles: billingCycles,
    payment_preferences: paymentPreference || {
      auto_bill_outstanding: true,
      payment_failure_threshold: 3,
    },
  }

  const response = await fetch(`${baseUrl}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal subscription plan creation failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * Activate a PayPal subscription plan (plans must be active to be subscribed to).
 */
export async function activatePayPalSubscriptionPlan(
  planId: string,
): Promise<{ id: string; status: string }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const response = await fetch(`${baseUrl}/v1/billing/plans/${planId}/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'return=representation',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal plan activation failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * Create a PayPal subscription (billing agreement) for a customer.
 */
export async function createPayPalSubscription(
  planId: string,
  subscriberEmail: string,
  customId?: string,
): Promise<{ id: string; status: string; links: Array<{ href: string; rel: string; method: string }> }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const body: Record<string, unknown> = {
    plan_id: planId,
    subscriber: {
      email_address: subscriberEmail,
    },
    application_context: {
      return_url: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/paypal/subscribe/success`,
      cancel_url: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/paypal/subscribe/cancel`,
    },
  }

  if (customId) {
    body.custom_id = customId
  }

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal subscription creation failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * Suspend a PayPal subscription.
 */
export async function suspendPayPalSubscription(
  subscriptionId: string,
): Promise<{ id: string; status: string }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const response = await fetch(
    `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/suspend`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=representation',
      },
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal subscription suspension failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * Reactivate a suspended PayPal subscription.
 */
export async function reactivatePayPalSubscription(
  subscriptionId: string,
): Promise<{ id: string; status: string }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const response = await fetch(
    `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/activate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=representation',
      },
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal subscription reactivation failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * Cancel a PayPal subscription immediately.
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason?: string,
): Promise<void> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const body: Record<string, unknown> = {}
  if (reason) {
    body.reason = reason
  }

  const response = await fetch(
    `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  )

  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal subscription cancellation failed: ${JSON.stringify(error)}`,
    )
  }
}

/**
 * Search PayPal transactions using the Reporting API.
 * Per PayPal docs, filter by date range and optional fields.
 */
export async function searchPayPalTransactions(
  startTime: string,
  endTime: string,
  fields?: string[]): Promise<{
    transaction_details: Array<{
      transaction_info: {
        paypal_correlation_id: string
        transaction_id: string
        transaction_status: string
        transaction_entity: string
        transaction_amount: {
          currency_code: string
          value: string
        }
        transaction_date: string
        fee_amount?: {
          currency_code: string
          value: string
        }
        net_amount?: {
          currency_code: string
          value: string
        }
      }
      payer_info?: {
        payer_id: string
        payer_email: string
        payer_status: string
        first_name?: string
        last_name?: string
      }
      shipping_info?: {
        name?: {
          full_name: string
        }
        address?: {
          address_line_1: string
          admin_area_2: string
          admin_area_1: string
          country_code: string
          postal_code: string
        }
      }
    }>
  }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const params = new URLSearchParams({
    start_date: startTime,
    end_date: endTime,
    fields: fields?.join(',') || 'all',
  })

  const response = await fetch(
    `${baseUrl}/v1/reporting/transactions?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal transaction search failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * Create a PayPal vault token for a saved payment method.
 * Allows customers to save credit card or bank account details
 * for future transactions.
 */
export async function createPayPalVaultToken(
  tokenType: 'CARD' | 'PAYPAL',
  tokenDetails: Record<string, unknown>,
): Promise<{ id: string; status: string; token_type: string }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const response = await fetch(`${baseUrl}/v2/customer/tokenizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      token_type: tokenType,
      token_details: tokenDetails,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal vault token creation failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * List saved payment method tokens for a customer.
 */
export async function listPayPalVaultTokens(
  customerId: string,
): Promise<{ tokens: Array<{ id: string; status: string; token_type: string }> }> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const response = await fetch(
    `${baseUrl}/v2/customer/tokenizations?customer_id=${customerId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal vault token list failed: ${JSON.stringify(error)}`,
    )
  }

  return response.json()
}

/**
 * Delete a saved payment method token from the vault.
 */
export async function deletePayPalVaultToken(
  tokenId: string,
): Promise<void> {
  const accessToken = await getPayPalAccessToken()
  const { baseUrl } = getPayPalConfig()

  const response = await fetch(
    `${baseUrl}/v2/customer/tokenizations/${tokenId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `PayPal vault token deletion failed: ${JSON.stringify(error)}`,
    )
  }
}
