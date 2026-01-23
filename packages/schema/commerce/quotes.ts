export interface MeeoviQuote {
	id: string
	customerId?: string | null
	items: Array<{ productId: string; quantity: number; price: number }>
	total: number
	currency: string
	status?: string | null
	metadata?: Record<string, unknown>
}

