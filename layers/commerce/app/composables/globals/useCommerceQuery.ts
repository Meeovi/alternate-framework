import { ref } from '#imports'

function pickMethod(client: any, names: string[]) {
  for (const name of names) {
    if (typeof client?.[name] === 'function') {
      return client[name].bind(client)
    }
  }
  return null
}

function normalizeCountries(result: any) {
  const source = result?.countries || result?.items || result?.data || result || []
  if (!Array.isArray(source)) {
    return { countries: [] }
  }

  return {
    countries: source.map((entry: any) => ({
      code: entry?.code || entry?.iso2 || entry?.countryCode || entry?.id || '',
      name: entry?.name || entry?.label || entry?.country || '',
      provinces: entry?.provinces || entry?.regions || entry?.states || [],
      regions: entry?.regions || entry?.provinces || entry?.states || [],
    })),
  }
}

async function resolveOperation(client: any, operation: string, variables: Record<string, unknown>) {
  const op = String(operation || '')

  if (op === 'activeOrder' || op === 'getActiveOrder') {
    const fn = pickMethod(client, ['getActiveOrder', 'activeOrder', 'getCart', 'getCurrentOrder'])
    if (!fn) return null
    const value = await fn(variables)
    return value?.activeOrder ? value : { activeOrder: value?.cart || value?.order || value || null }
  }

  if (op === 'getCountryList') {
    const fn = pickMethod(client, ['getCountryList', 'listCountries', 'getCountries'])
    if (!fn) return null
    return normalizeCountries(await fn(variables))
  }

  if (op === 'getProductReviews') {
    const fn = pickMethod(client, ['getProductReviews', 'listReviews', 'getReviews'])
    if (!fn) return null
    const value = await fn(variables)
    if (value?.product?.reviews) return value
    const reviews = value?.reviews || value?.items || (Array.isArray(value) ? value : [])
    return { product: { reviews } }
  }

  if (op === 'getCustomerShipments') {
    const fn = pickMethod(client, ['getCustomerShipments', 'listShipments', 'getShipments'])
    if (!fn) return null
    const value = await fn(variables)
    if (value?.activeCustomer?.shipments?.items) return value
    const items = value?.shipments?.items || value?.items || (Array.isArray(value) ? value : [])
    return { activeCustomer: { shipments: { items } } }
  }

  if (op === 'currencyQuery' || op === 'currency') {
    const fn = pickMethod(client, ['getCurrency', 'getCurrencies', 'getStoreConfig'])
    if (!fn) return null
    const value = await fn(variables)
    if (value?.currency?.available_currency_codes) return value

    const available = value?.available_currency_codes || value?.currencies || value?.availableCurrencies || []
    const exchange = value?.exchange_rates || value?.exchangeRates || []
    const defaultCode = value?.default_display_currency_code || value?.defaultCurrency || 'USD'

    return {
      currency: {
        available_currency_codes: available,
        exchange_rates: exchange,
        default_display_currency_code: defaultCode,
      },
    }
  }

  return null
}

export function useCommerceQuery(document: unknown, variables?: Record<string, unknown>) {
  const data = ref<any>(null)
  const error = ref<any>(null)
  const loading = ref(false)

  const run = async (nextVariables?: Record<string, unknown>) => {
    loading.value = true
    error.value = null
    try {
      const nuxtApp = useNuxtApp() as any
      const client = nuxtApp?.$commerceClient
      const nextVars = nextVariables ?? variables ?? {}
      if (client && typeof document === 'string') {
        const resolved = await resolveOperation(client, document, nextVars)
        if (resolved !== null) {
          data.value = resolved
          return data.value
        }
      }
      if (client && typeof client.query === 'function') {
        const result = await client.query({ document, variables: nextVars })
        data.value = result?.data ?? result ?? null
      } else {
        data.value = null
      }
      return data.value
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  void run()

  return {
    data,
    error,
    loading,
    refetch: run,
  }
}

export default useCommerceQuery
