export interface MeeoviShipment {
	id: number
	created_at?: string | null
	updated_at?: string | null
	email_sent?: number | null
	user?: string | null
	order?: number | null
	shipment_status?: string | null
	shipping_label?: string | null
	store_id?: number | null
	total_qty?: number | null
	total_weight?: number | null
	code?: string | null
	cost?: number | null
	delivery_time?: string | null
	delivery_window?: string | null
	carrier_matrix?: Record<string, unknown> | null
	// relations omitted: shipment_address[], shipment_comments[], shipment_products[], shipment_tracking[]
}


