// layers/commerce/stores/currency.ts
import { defineStore } from '#imports'
import { createDirectus, rest, readItems } from '@directus/sdk'

interface Currency {
  code: string
  symbol: string
  exchange_rate: number
}

export const useCurrencyStore = defineStore('currency', () => {
  const activeCurrency = ref<Currency>({ code: 'GBP', symbol: '£', exchange_rate: 1.0 })
  const availableCurrencies = ref<Currency[]>([])
  const isLoading = ref(false)

  // Fetch active currencies from your Directus Layer
  async function fetchCurrencies() {
    isLoading.value = true
    try {
      // Use runtimeConfig for clean Directus URLs
      const config = useRuntimeConfig()
      const directus = createDirectus((config.public as any).directusUrl).with(rest())
      
      const response = await directus.request(
        readItems('currencies', {
          filter: { is_active: { _eq: true } }
        })
      )
      
      availableCurrencies.value = response as Currency[]
    } catch (error) {
      console.error('Failed to load marketplace currencies:', error)
    } finally {
      isLoading.value = false
    }
  }

  function setCurrency(code: string) {
    const found = availableCurrencies.value.find(c => c.code === code)
    if (found) {
      activeCurrency.value = found
      // Optional: Sync choice to cookie for Nuxt SSR persistence
      const currencyCookie = useCookie('marketplace_currency')
      currencyCookie.value = code
    }
  }

  // Format Helper utility to run price calculations uniformly across the app
  const formatPrice = (priceInBaseCents: number) => {
    const convertedAmount = (priceInBaseCents / 100) * activeCurrency.value.exchange_rate
    return new Intl.NumberFormat((useNuxtApp().$i18n as any)?.locale?.value || 'en-GB', {
      style: 'currency',
      currency: activeCurrency.value.code
    }).format(convertedAmount)
  }

  return {
    activeCurrency,
    availableCurrencies,
    isLoading,
    fetchCurrencies,
    setCurrency,
    formatPrice
  }
})