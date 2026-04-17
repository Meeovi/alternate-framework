import { useProducts as _useProducts } from './useProducts/useProducts'

export function useProducts() {
	const core = _useProducts()
	return {
		// map older names used in stores to the implementation
		getProducts: async (opts?: any) => {
			const res = await core.fetchProducts()
			const maybe = (res as any)?.value ?? res
			return maybe || []
		},
		getProductById: async (id: string) => {
			const res = await core.fetchProducts()
			const maybe = (res as any)?.value ?? res
			return (Array.isArray(maybe) ? maybe.find((p: any) => p.id === id || p.sku === id) || null : null)
		},
		getProductsByCategory: async (categoryId: string, opts?: any) => {
			const res = await core.fetchProducts()
			const maybe = (res as any)?.value ?? res
			return Array.isArray(maybe) ? maybe.filter((p: any) => p.category_id === categoryId || p.category === categoryId) : []
		},
		searchProducts: async (query: string, opts?: any) => {
			const res = await core.fetchProducts()
			const maybe = (res as any)?.value ?? res
			return Array.isArray(maybe) ? maybe.filter((p: any) => (p.name || p.title || '').toLowerCase().includes((query || '').toLowerCase())) : []
		}
	}
}

export default useProducts
