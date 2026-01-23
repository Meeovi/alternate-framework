import { MeeoviCart } from './cart'

export interface MeeoviCheckout {
	id: string
	cart: MeeoviCart
	total: number
	currency: string
	status: 'pending' | 'completed' | 'failed' | string
	metadata?: Record<string, unknown>
}

