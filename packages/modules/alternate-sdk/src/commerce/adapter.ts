import type { CommerceDriverContract } from '../contracts/commerce.js'
import { CommerceDriverRegistry } from '../contracts/commerce.js'
import CommerceMeshDriver from './driver.js'

function resolveGatewayCommerce(): CommerceDriverContract {
	const runtime = globalThis as Record<string, any>
	const gatewayFactory = runtime.useGateway

	if (typeof gatewayFactory !== 'function') {
		return {} as CommerceDriverContract
	}

	try {
		const gateway = gatewayFactory() as Record<string, any>
		return (gateway?.commerce as CommerceDriverContract) || {}
	} catch {
		return {} as CommerceDriverContract
	}
}

export function useCommerceAdapter(): CommerceDriverContract {
	const gatewayCommerce = resolveGatewayCommerce()
	const meshDriver = new CommerceMeshDriver()

	return {
		...meshDriver,
		...gatewayCommerce,
		products: { ...meshDriver.products, ...gatewayCommerce?.products },
		cart: { ...meshDriver.cart, ...gatewayCommerce?.cart },
		checkout: { ...meshDriver.checkout, ...gatewayCommerce?.checkout },
	}
}

export default useCommerceAdapter

const commerceRegistry = new Map<string, CommerceDriverContract>()
let defaultCommerceAdapter: CommerceDriverContract | undefined

export function registerCommerceAdapter(name: string, adapter: CommerceDriverContract): void {
	commerceRegistry.set(name, adapter)
	CommerceDriverRegistry.register(name, adapter)
}

export function getCommerceAdapter(name?: string): CommerceDriverContract | undefined {
	if (name) return commerceRegistry.get(name)
	return defaultCommerceAdapter
}

export function setDefaultCommerceAdapter(adapter: CommerceDriverContract): void {
	defaultCommerceAdapter = adapter
	CommerceDriverRegistry.setDefaultDriver(adapter)
}

export const useCommerce = (): CommerceDriverContract => {
	if (defaultCommerceAdapter) {
		return defaultCommerceAdapter
	}
	return useCommerceAdapter()
}

export { CommerceDriverRegistry } from '../contracts/commerce.js'