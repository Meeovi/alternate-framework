/**
 * Format a price amount according to the given currency
 * @param {number} amount - The price amount to format
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR')
 * @param {Object} exchangeRates - Object containing exchange rates
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount, currency, exchangeRates) => {
  if (!amount || !currency) return ''
  
  const rate = exchangeRates[currency] || 1
  const convertedAmount = amount * rate

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency
  }).format(convertedAmount)
}

/**
 * Convert price from one currency to another
 * @param {number} amount - The price amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} exchangeRates - Object containing exchange rates
 * @returns {number} Converted price amount
 */
export const convertPrice = (amount, fromCurrency, toCurrency, exchangeRates) => {
  if (!amount || !fromCurrency || !toCurrency || !exchangeRates) return amount
  
  const fromRate = exchangeRates[fromCurrency] || 1
  const toRate = exchangeRates[toCurrency] || 1
  
  return (amount * toRate) / fromRate
}

/**
 * Get currency symbol for a currency code
 * @param {string} code - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (code) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    // Add more currency symbols as needed
  }
  return symbols[code] || code
} 