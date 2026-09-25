import type { BusinessDriverContract } from '../contracts/business.js'
import { BusinessDriverRegistry } from '../contracts/business.js'
import BusinessMeshDriver from './driver.js'

function resolveGatewayBusiness(): BusinessDriverContract {
	const runtime = globalThis as Record<string, any>
	const gatewayFactory = runtime.useGateway

	if (typeof gatewayFactory !== 'function') {
		return {} as BusinessDriverContract
	}

	try {
		const gateway = gatewayFactory() as Record<string, any>
		return (gateway?.business as BusinessDriverContract) || {}
	} catch {
		return {} as BusinessDriverContract
	}
}

export function useBusinessAdapter(): BusinessDriverContract {
	const gatewayBusiness = resolveGatewayBusiness()
	const meshDriver = new BusinessMeshDriver()

	return {
		...meshDriver,
		...gatewayBusiness,
		products: { ...meshDriver.products, ...gatewayBusiness?.products },
		orders: { ...meshDriver.orders, ...gatewayBusiness?.orders },
		invoices: { ...meshDriver.invoices, ...gatewayBusiness?.invoices },
		reviews: { ...meshDriver.reviews, ...gatewayBusiness?.reviews },
		shipments: { ...meshDriver.shipments, ...gatewayBusiness?.shipments },
		spaces: { ...meshDriver.spaces, ...gatewayBusiness?.spaces },
		attributes: { ...meshDriver.attributes, ...gatewayBusiness?.attributes },
		integrations: { ...meshDriver.integrations, ...gatewayBusiness?.integrations },
		shop: { ...meshDriver.shop, ...gatewayBusiness?.shop },
		lowStock: { ...meshDriver.lowStock, ...gatewayBusiness?.lowStock },
		transactions: { ...meshDriver.transactions, ...gatewayBusiness?.transactions },
		payouts: { ...meshDriver.payouts, ...gatewayBusiness?.payouts },
		coupons: { ...meshDriver.coupons, ...gatewayBusiness?.coupons },
		featuredProducts: { ...meshDriver.featuredProducts, ...gatewayBusiness?.featuredProducts },
		announcements: { ...meshDriver.announcements, ...gatewayBusiness?.announcements },
	}
}

const businessRegistry = new Map<string, BusinessDriverContract>()
let defaultBusinessAdapter: BusinessDriverContract | undefined

export function registerBusinessAdapter(name: string, adapter: BusinessDriverContract): void {
	businessRegistry.set(name, adapter)
	BusinessDriverRegistry.register(name, adapter)
}

export function getBusinessAdapter(name?: string): BusinessDriverContract | undefined {
	if (name) return businessRegistry.get(name)
	return defaultBusinessAdapter
}

export function setDefaultBusinessAdapter(adapter: BusinessDriverContract): void {
	defaultBusinessAdapter = adapter
	BusinessDriverRegistry.setDefaultDriver(adapter)
}

export const useBusiness = (): BusinessDriverContract => {
	if (defaultBusinessAdapter) {
		return defaultBusinessAdapter
	}
	return useBusinessAdapter()
}

export { BusinessDriverRegistry } from '../contracts/business.js'
