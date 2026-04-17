import { getCommerceClient } from '../../../utils/client'
import { usePrice } from './price'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useCatalogPriceRules() {
	const client = clientOrNull()
	const price = usePrice()

	async function listCatalogPriceRules(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listCatalogPriceRules === 'function') return client.listCatalogPriceRules(opts)
		if (client && typeof client.getCatalogPriceRules === 'function') return client.getCatalogPriceRules(opts)
		if (client && typeof client.listPriceRules === 'function') return client.listPriceRules({ scope: 'catalog', ...opts })
		return []
	}

	async function getCatalogPriceForProduct(product: Record<string, any>, context: Record<string, unknown> = {}) {
		if (client && typeof client.getCatalogPriceForProduct === 'function') {
			return client.getCatalogPriceForProduct(product, context)
		}

		return price.getProductPrice(product, {
			quantity: Number(context.quantity || 1) || 1,
			customerGroup: (context.customerGroup as string | number | null | undefined) ?? null,
			currency: (context.currency as string | null | undefined) ?? null,
		})
	}

	async function getCatalogPriceBySku(sku: string, context: Record<string, unknown> = {}) {
		if (client && typeof client.getCatalogPriceBySku === 'function') {
			return client.getCatalogPriceBySku(sku, context)
		}

		let product: Record<string, any> | null = null

		if (client && typeof client.getProductBySku === 'function') {
			product = await client.getProductBySku(sku)
		} else if (client && typeof client.getProductById === 'function') {
			product = await client.getProductById(sku)
		} else if (client && typeof client.listProducts === 'function') {
			const result = await client.listProducts({ skus: [sku] })
			const items = Array.isArray(result) ? result : result?.items || result?.products || []
			product = Array.isArray(items)
				? items.find((entry: Record<string, any>) => String(entry?.sku || entry?.id || '') === String(sku)) || null
				: null
		}

		return product ? getCatalogPriceForProduct(product, context) : null
	}

	async function applyCatalogPriceRules(products: Record<string, any>[], context: Record<string, unknown> = {}) {
		return Promise.all((Array.isArray(products) ? products : []).map(async (product) => ({
			product,
			pricing: await getCatalogPriceForProduct(product, context),
		})))
	}

	return {
		listCatalogPriceRules,
		getCatalogPriceForProduct,
		getCatalogPriceBySku,
		applyCatalogPriceRules,
	}
}

export default useCatalogPriceRules
