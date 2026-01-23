import { MeeoviProduct } from './product'

export interface MeeoviDigitalProduct {
	id: string
	title: string
	downloadUrl?: string | null
	fileId?: string | null
	product?: MeeoviProduct
	price?: number
	currency?: string
	metadata?: Record<string, unknown>
}

