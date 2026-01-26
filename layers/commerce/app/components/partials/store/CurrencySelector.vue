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
    watch
  } from 'vue'
  import {
    useCurrencyStore
  } from '~/stores/currency'
  import {
    useQuery,
    useMutation
  } from '@vue/apollo-composable'
  import {
    CURRENCY_QUERY
  } from '#graphql/commerce/queries/currency.gql'
  import {
    UPDATE_USER_CURRENCY
  } from '#graphql/commerce/mutations/updateUserCurrency.gql'
  import {
    getCurrencySymbol
  } from '~/utils/currency'
  import {
    useCurrency
  } from '~/app/composables/useCurrency'

  const store = useCurrencyStore()
  const selectedCurrency = ref('')
  const availableCurrencies = ref([])

  const {
    currentCurrency,
    setCurrency
  } = useCurrency()

  // Fetch currency data from Magento
  const {
    result: currencyResult
  } = useQuery(CURRENCY_QUERY)

  // Mutation for updating user currency preference
  const {
    mutate: updateUserCurrency
  } = useMutation(UPDATE_USER_CURRENCY)

  // Watch for currency data changes
  watch(currencyResult, (newResult) => {
    if (newResult?.currency) {
      const {
        available_currency_codes,
        exchange_rates,
        default_display_currency_code
      } = newResult.currency

      // Map available currencies with their symbols
      availableCurrencies.value = available_currency_codes.map(code => ({
        code,
        symbol: getCurrencySymbol(code),
        rate: exchange_rates.find(rate => rate.currency_to === code)?.rate || 1
      }))

      // Set initial currency from user preference or default
      const userCurrency = store.getCurrentCurrency
      selectedCurrency.value = userCurrency || default_display_currency_code

      // Update exchange rates in store
      const ratesObj = {}
      exchange_rates.forEach(({
        currency_to,
        rate
      }) => {
        ratesObj[currency_to] = rate
      })
      store.setExchangeRates(ratesObj)
    }
  })

  // Handle currency change
  const handleCurrencyChange = async () => {
    await setCurrency(selectedCurrency.value)

    // If user is logged in, save preference
    if (store.user) {
      try {
        await updateUserCurrency({
          variables: {
            currency: selectedCurrency.value
          }
        })
      } catch (error) {
        console.error('Failed to update user currency preference:', error)
      }
    }
  }

  onMounted(() => {
    // Initialize with store currency if available
    if (currentCurrency.value) {
      selectedCurrency.value = currentCurrency.value
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