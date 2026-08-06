import { onMounted, onUnmounted, useCookie, useState, watch } from '#imports'

const CURRENCY_COOKIE_KEY = 'vsf-currency'
const CURRENCY_EVENT = 'commerce:currency-changed'
const DEFAULT_CURRENCY = 'USD'

function normalizeCurrency(value?: string | null): string {
	return (value || DEFAULT_CURRENCY).trim().toUpperCase() || DEFAULT_CURRENCY
}

export function usePreferredCurrency() {
	const currencyCookie = useCookie<string>(CURRENCY_COOKIE_KEY, {
		sameSite: 'lax',
		path: '/',
	})

	const currency = useState<string>('commerce:preferred-currency', () => normalizeCurrency(currencyCookie.value))

	const setCurrency = (next: string) => {
		const normalized = normalizeCurrency(next)
		if (currency.value === normalized) return

		currency.value = normalized
		currencyCookie.value = normalized

		if (import.meta.client) {
			localStorage.setItem(CURRENCY_COOKIE_KEY, normalized)
		}
	}

	if (import.meta.client) {
		onMounted(() => {
			const localValue = localStorage.getItem(CURRENCY_COOKIE_KEY)
			if (localValue) {
				currency.value = normalizeCurrency(localValue)
			}

			const onCurrencyChanged = (event: Event) => {
				const detail = (event as CustomEvent<{ currency?: string }>).detail
				if (!detail?.currency) return
				setCurrency(detail.currency)
			}

			window.addEventListener(CURRENCY_EVENT, onCurrencyChanged)
			onUnmounted(() => {
				window.removeEventListener(CURRENCY_EVENT, onCurrencyChanged)
			})
		})
	}

	watch(currency, (next) => {
		const normalized = normalizeCurrency(next)
		if (currencyCookie.value !== normalized) {
			currencyCookie.value = normalized
		}
		if (import.meta.client && localStorage.getItem(CURRENCY_COOKIE_KEY) !== normalized) {
			localStorage.setItem(CURRENCY_COOKIE_KEY, normalized)
		}
	})

	return {
		currency,
		setCurrency,
	}
}

export default usePreferredCurrency
