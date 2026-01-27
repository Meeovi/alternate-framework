import { MeeoviProduct } from './product'

export interface MeeoviGiftRegistry {
	id: string
	ownerId?: string | null
	items: MeeoviProduct[]
	metadata?: Record<string, unknown>
}

