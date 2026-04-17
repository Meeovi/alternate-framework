export interface MeeoviShop {
	id: string
	name: string
	domain?: string | null
	currency?: string | null
	productsCount?: number
	metadata?: Record<string, unknown>
}


