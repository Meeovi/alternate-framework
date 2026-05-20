// packages/magento/runtime/composables/useMagentoCustomerAuth.ts
import { useFetch } from '#imports'
import { useAuth } from '#imports'
import { useMagento } from './useMagento'
import { ref } from '#imports'

export function useMagentoCustomerAuth() {
  const auth = useAuth()
  const magento = useMagento()
  const customer = ref<any | null>(null)

  const loadCustomer = async () => {
    try {
      customer.value = await magento.customer?.me?.()
    } catch {
      customer.value = null
    }
    return customer.value
  }

  const signIn = async (email: string, password: string) => {
    await auth.signIn({ email, password })
    await useFetch('/api/magento/customer/login', {
      method: 'POST',
      body: { email, password },
    })
    return loadCustomer()
  }

  const signOut = async () => {
    await auth.signOut()
    await useFetch('/api/magento/customer/logout', { method: 'POST' })
    customer.value = null
  }

  return {
    customer,
    loadCustomer,
    signIn,
    signOut,
  }
}
