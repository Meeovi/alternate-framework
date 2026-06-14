<template>
  <div class="currency-selector">
    <select v-model="selectedCurrency" @change="handleCurrencyChange" class="currency-select">
      <option v-for="currency in availableCurrencies" :key="currency.code" :value="currency.code">
        {{ currency.symbol }} {{ currency.code }}
      </option>
    </select>
  </div>
</template>

<script setup>
  import {
    ref,
    onMounted,
    watch,
    useCookie,
    useRuntimeConfig
  } from '#imports'

  const defaultCurrency = 'USD'
  const symbolMap = {
    USD: '$',
    EUR: 'EUR',
    GBP: 'GBP',
    CAD: 'CAD',
    AUD: 'AUD',
    JPY: 'JPY'
  }

  const runtimeConfig = useRuntimeConfig()
  const runtimeCurrencies = runtimeConfig.public?.currencies

  const configuredCodes = Array.isArray(runtimeCurrencies)
    ? runtimeCurrencies
    : String(runtimeCurrencies || '')
        .split(',')
        .map(code => code.trim().toUpperCase())
        .filter(Boolean)

  const currencyCodes = configuredCodes.length ? configuredCodes : ['USD', 'EUR', 'GBP']

  const availableCurrencies = ref(
    currencyCodes.map(code => ({
      code,
      symbol: symbolMap[code] || code,
    }))
  )

  const currencyCookie = useCookie<string>('vsf-currency', {
    sameSite: 'lax',
    path: '/'
  })

  const selectedCurrency = ref(currencyCookie.value || defaultCurrency)

  const handleCurrencyChange = () => {
    const value = selectedCurrency.value || defaultCurrency
    currencyCookie.value = value

    if (import.meta.client) {
      localStorage.setItem('vsf-currency', value)
      window.dispatchEvent(new CustomEvent('commerce:currency-changed', {
        detail: { currency: value }
      }))
    }
  }

  watch(selectedCurrency, () => {
    handleCurrencyChange()
  })

  onMounted(() => {
    if (import.meta.client) {
      const persisted = localStorage.getItem('vsf-currency')
      if (persisted) {
        selectedCurrency.value = persisted
        return
      }
    }

    if (currencyCookie.value) {
      selectedCurrency.value = currencyCookie.value
    }
  })
</script>

<style scoped>
  .currency-selector {
    display: inline-block;
    margin: 0 10px;
  }

  .currency-select {
    padding: 5px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    font-size: 14px;
  }

  .currency-select:focus {
    outline: none;
    border-color: #007bff;
  }
</style>