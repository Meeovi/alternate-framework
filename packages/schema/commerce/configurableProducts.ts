import { MeeoviProduct } from './product'

export interface MeeoviConfigurableProduct {
	id: string
	baseProductId: string
	title?: string | null
	options: { name: string; values: string[] }[]
	variants: MeeoviProduct[]
	metadata?: Record<string, unknown>
}

