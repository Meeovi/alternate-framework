export interface MeeoviProductType {
	id: number
	name?: string | null
	isShippable?: boolean | null
	options?: Record<string, unknown> | null
	// relations omitted: attributes_product_types[], integrations_product_types[], product_types_products[], videos_product_types[]
}


