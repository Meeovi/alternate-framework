export interface MeeoviStockItem {
	productId: string
	sku?: string | null
	qty: number
	isInStock: boolean
	metadata?: Record<string, unknown>
}

