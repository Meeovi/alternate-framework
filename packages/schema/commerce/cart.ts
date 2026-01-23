import { MeeoviProduct } from './product'

export interface MeeoviCartItem {
	id: number
	quantity?: number | null
	metadata?: Record<string, unknown> | null
	products?: string | null
	cart?: number | null
	product_id?: string | null
	price?: number | null
	total?: number | null
	variant_id?: string | null
	variant?: string | null
}

export interface MeeoviCart {
	id: number
	date_created?: string | null
	user_updated?: string | null
	date_updated?: string | null
	session_id?: string | null
	total_price?: number | null
	user?: string | null
	status?: string | null
	subtotal?: number | null
	tax_amount?: number | null
	shipping_amount?: number | null
	discount_amount?: number | null
	total?: number | null
	currency?: string | null
	coupon_code?: string | null
	// relations omitted: address_cart[], cart_cart_items[], cart_items[], cart_products[]
}


