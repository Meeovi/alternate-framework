import { ref } from '#imports'

function pickMethod(client: any, names: string[]) {
  for (const name of names) {
    if (typeof client?.[name] === 'function') {
      return client[name].bind(client)
    }
  }
  return null
}

async function resolveMutation(client: any, operation: string, variables: Record<string, unknown>) {
  const op = String(operation || '')

  if (op === 'adjustOrderLine') {
    const fn = pickMethod(client, ['adjustOrderLine', 'updateOrderLine', 'updateCartLine', 'updateCartItem'])
    if (!fn) return null
    return await fn(variables)
  }

  if (op === 'removeOrderLine') {
    const fn = pickMethod(client, ['removeOrderLine', 'deleteOrderLine', 'removeCartLine', 'removeCartItem'])
    if (!fn) return null
    return await fn(variables)
  }

  if (op === 'setOrderShippingAddress') {
    const fn = pickMethod(client, ['setOrderShippingAddress', 'setShippingAddress'])
    if (!fn) return null
    const value = await fn((variables as any)?.input || variables)
    if (value?.setOrderShippingAddress?.shippingAddress) return value
    return { setOrderShippingAddress: { shippingAddress: value?.shippingAddress || value } }
  }

  if (op === 'setOrderBillingAddress') {
    const fn = pickMethod(client, ['setOrderBillingAddress', 'setBillingAddress'])
    if (!fn) return null
    const value = await fn((variables as any)?.input || variables)
    if (value?.setOrderBillingAddress?.billingAddress) return value
    return { setOrderBillingAddress: { billingAddress: value?.billingAddress || value } }
  }

  if (op === 'createStripePaymentIntent') {
    const fn = pickMethod(client, ['createStripePaymentIntent', 'createPaymentIntent'])
    if (!fn) return null
    const value = await fn(variables)
    if (value?.createStripePaymentIntent?.clientSecret) return value
    return {
      createStripePaymentIntent: {
        clientSecret: value?.clientSecret || value?.secret || null,
      },
    }
  }

  if (op === 'updateUserCurrency') {
    const fn = pickMethod(client, ['updateUserCurrency', 'setCurrency', 'setUserCurrency', 'updateCurrency'])
    if (!fn) return null
    const value = await fn((variables as any)?.currency || variables)
    return value ?? { success: true }
  }

  return null
}

export function useCommerceMutation(document: unknown) {
  const data = ref<any>(null)
  const error = ref<any>(null)
  const loading = ref(false)

  const mutate = async (variables?: Record<string, unknown>) => {
    loading.value = true
    error.value = null
    try {
      const nuxtApp = useNuxtApp() as any
      const client = nuxtApp?.$commerceClient
      const payload = variables ?? {}
      if (client && typeof document === 'string') {
        const resolved = await resolveMutation(client, document, payload)
        if (resolved !== null) {
          data.value = resolved
          return data.value
        }
      }
      if (client && typeof client.mutate === 'function') {
        const result = await client.mutate({ document, variables: payload })
        data.value = result?.data ?? result ?? null
      } else {
        data.value = null
      }
      return data.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    mutate,
  }
}

export default useCommerceMutation
