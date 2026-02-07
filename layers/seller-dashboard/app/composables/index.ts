import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'
import useAffiliates from './useAffiliates'
import useCommission from './useCommission'

function resolveProvider() {
	const provider = getSellerProvider()
	return provider || mockProvider
}

export function useVendors() {
	const provider: any = resolveProvider()

	function useSellers() {
		async function listProducts(sellerId?: string, params?: Record<string, any>) {
			if (provider && typeof provider.listSellerProducts === 'function') return provider.listSellerProducts(sellerId, params)
			return mockProvider.listSellerProducts(sellerId, params)
		}

		async function getProduct(productId: string) {
			if (provider && typeof provider.getSellerProduct === 'function') return provider.getSellerProduct(productId)
			return mockProvider.getSellerProduct(productId)
		}

		async function createProduct(sellerId: string, payload: any) {
			if (provider && typeof provider.createSellerProduct === 'function') return provider.createSellerProduct(sellerId, payload)
			return mockProvider.createSellerProduct(sellerId, payload)
		}

		async function updateProduct(productId: string, payload: any) {
			if (provider && typeof provider.updateSellerProduct === 'function') return provider.updateSellerProduct(productId, payload)
			return mockProvider.updateSellerProduct(productId, payload)
		}

		async function deleteProduct(productId: string) {
			if (provider && typeof provider.deleteSellerProduct === 'function') return provider.deleteSellerProduct(productId)
			return mockProvider.deleteSellerProduct(productId)
		}

		return { listProducts, getProduct, createProduct, updateProduct, deleteProduct }
	}

	async function listReviews(productId?: string, params?: Record<string, any>) {
		if (provider && typeof provider.listReviews === 'function') return provider.listReviews(productId, params)
		return mockProvider.listReviews(productId, params)
	}

	async function moderateReview(reviewId: string, action: 'approve' | 'reject' | 'delete') {
		if (provider && typeof provider.moderateReview === 'function') return provider.moderateReview(reviewId, action)
		return mockProvider.moderateReview(reviewId, action)
	}

	async function listShops(params?: Record<string, any>) {
		if (provider && typeof provider.listShops === 'function') return provider.listShops(params)
		return mockProvider.listShops(params)
	}

	async function getShop(shopId: string) {
		if (provider && typeof provider.getShop === 'function') return provider.getShop(shopId)
		return mockProvider.getShop(shopId)
	}

	async function updateShop(shopId: string, payload: any) {
		if (provider && typeof provider.updateShop === 'function') return provider.updateShop(shopId, payload)
		return mockProvider.updateShop(shopId, payload)
	}

	async function listCustomers(params?: Record<string, any>) {
		if (provider && typeof provider.listCustomers === 'function') return provider.listCustomers(params)
		return mockProvider.listCustomers(params)
	}

	async function getCustomer(customerId: string) {
		if (provider && typeof provider.getCustomer === 'function') return provider.getCustomer(customerId)
		return mockProvider.getCustomer(customerId)
	}

	async function listOrders(params?: Record<string, any>) {
		if (provider && typeof provider.listOrders === 'function') return provider.listOrders(params)
		return mockProvider.listOrders(params)
	}

	async function getOrder(orderId: string) {
		if (provider && typeof provider.getOrder === 'function') return provider.getOrder(orderId)
		return mockProvider.getOrder(orderId)
	}

	async function updateOrderStatus(orderId: string, status: string) {
		if (provider && typeof provider.updateOrderStatus === 'function') return provider.updateOrderStatus(orderId, status)
		return mockProvider.updateOrderStatus(orderId, status)
	}

	async function getSettings(scope: string = 'global') {
		if (provider && typeof provider.getVendorSettings === 'function') return provider.getVendorSettings(scope)
		return mockProvider.getVendorSettings(scope)
	}

	async function updateSettings(scope: string, payload: any) {
		if (provider && typeof provider.updateVendorSettings === 'function') return provider.updateVendorSettings(scope, payload)
		return mockProvider.updateVendorSettings(scope, payload)
	}

	const affiliates = useAffiliates()
	const commission = useCommission()

	return {
		useSellers,
		listReviews,
		moderateReview,
		listShops,
		getShop,
		updateShop,
		listCustomers,
		getCustomer,
		listOrders,
		getOrder,
		updateOrderStatus,
		getSettings,
		updateSettings,
		affiliates,
		commission
	}
}

export default useVendors
