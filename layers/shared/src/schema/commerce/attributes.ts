export interface MeeoviAttribute {
	id: number
	default_label?: string | null
	isPublic?: boolean | null
	options?: Record<string, unknown> | null
	attribute_code?: string | null
	// relations omitted: attributes_product_types[], attributes_products[], integrations_attributes[], product_attributes[], products_attributes[], videos[]
}


