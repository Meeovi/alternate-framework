import { getCommerceClient } from '../../../utils/client'
import { usePrice } from './price'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

function getItemQuantity(item: Record<string, any>) {
	return Number(item?.quantity ?? item?.qty ?? 1) || 1
}

export function useCartPriceRules() {
	const client = clientOrNull()
	const price = usePrice()

	async function listCartPriceRules(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listCartPriceRules === 'function') return client.listCartPriceRules(opts)
		if (client && typeof client.getCartPriceRules === 'function') return client.getCartPriceRules(opts)
		if (client && typeof client.listPriceRules === 'function') return client.listPriceRules({ scope: 'cart', ...opts })
		return []
	}

	async function priceCartItem(item: Record<string, any>, context: Record<string, unknown> = {}) {
		if (client && typeof client.priceCartItem === 'function') {
			return client.priceCartItem(item, context)
		}

		const product = item?.product || item
		const quantity = Number(context.quantity || getItemQuantity(item)) || 1
		const pricing = price.getProductPrice(product, {
			quantity,
			customerGroup: (context.customerGroup as string | number | null | undefined) ?? null,
			currency: (context.currency as string | null | undefined) ?? null,
		})

		const subtotal = pricing.final != null ? Number((pricing.final * quantity).toFixed(2)) : null

		return {
			item,
			quantity,
			pricing,
			subtotal,
		}
	}

	async function priceCartItems(items: Record<string, any>[], context: Record<string, unknown> = {}) {
		return Promise.all((Array.isArray(items) ? items : []).map((item) => priceCartItem(item, context)))
	}

	async function summarizeCartPrices(cart: Record<string, any>, context: Record<string, unknown> = {}) {
		if (client && typeof client.calculateCartPrices === 'function') {
			return client.calculateCartPrices(cart, context)
		}

		const pricedItems = await priceCartItems(cart?.items || [], context)
		const subtotal = pricedItems.reduce((sum, entry) => sum + Number(entry.subtotal || 0), 0)

		return {
			items: pricedItems,
			subtotal: Number(subtotal.toFixed(2)),
			currency: pricedItems.find((entry) => entry?.pricing?.currency)?.pricing?.currency || null,
		}
	}

	return {
		listCartPriceRules,
		priceCartItem,
		priceCartItems,
		summarizeCartPrices,
	}
}

export default useCartPriceRules
