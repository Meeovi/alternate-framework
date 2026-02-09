import { MeeoviProduct } from './product'

export interface MeeoviBundleProduct {
	id: string
	title: string
	items: MeeoviProduct[]
	price: number
	currency: string
	stock: number | null
	metadata?: Record<string, unknown>
}

