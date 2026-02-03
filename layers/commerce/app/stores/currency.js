import { defineStore } from 'pinia'

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    currentCurrency: null,
    exchangeRates: {}
  }),

  actions: {
    setCurrency(currency) {
      this.currentCurrency = currency
    },

    setExchangeRates(rates) {
      this.exchangeRates = rates
    },

    async updateCurrency(currency) {
      this.setCurrency(currency)
      // Here you would typically make an API call to update the user's preference
      // if they are logged in
    }
  },

  getters: {
    getCurrentCurrency: (state) => state.currentCurrency,
    getExchangeRates: (state) => state.exchangeRates
  }
}) 