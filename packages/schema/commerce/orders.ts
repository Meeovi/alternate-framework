import { MeeoviProduct } from './product'

export interface MeeoviOrderItem {
	id: number
	quantity?: number | null
	price?: number | null
}

export interface MeeoviOrder {
	id: number
	status?: string | null
	date_created?: string | null
	date_updated?: string | null
	type?: string | null
	adjustment_negative?: number | null
	adjustment_positive?: number | null
	applied_rule_ids?: string | null
	base_adjustment_negative?: number | null
	base_adjustment_positive?: number | null
	base_currency_code?: string | null
	base_discount_amount?: number | null
	base_discount_canceled?: number | null
	base_discount_invoiced?: number | null
	base_discount_refunded?: number | null
	base_grand_total?: number | null
	// many more base_* and other fields omitted for brevity; include as needed
	coupon_code?: string | null
	customer_email?: string | null
	grand_total?: number | null
	order_currency_code?: string | null
	shipping_amount?: number | null
	subtotal?: number | null
	tax_amount?: number | null
	payment_status?: string | null
	user_id?: string | null
	// relations omitted: incentives_orders[], invoices_orders[], order_items_orders[], etc.
}


