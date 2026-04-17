export interface MeeoviProduct {
	id: string
	sku?: string | null
	name?: string | null
	tax_class?: string | null
	created_at?: string | null
	content?: string | null
	part_number?: string | null
	file?: string | null
	image?: string | null
	visibility?: boolean | null
	stock?: number | null
	rating?: number | null
	salable_quantity?: string | null
	updated_at?: string | null
	status?: string | null
	price?: number | null
	ratings?: string | null
	uuid?: string | null
	// relations omitted: many relation arrays like Space_products[], brands_products[], variants[], etc.
}


