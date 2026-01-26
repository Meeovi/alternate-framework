export interface MeeoviReturn {
	id: number
	status?: string | null
	date_created?: string | null
	date_updated?: string | null
	return_number?: string | null
	reason?: string | null
	// relations omitted: returns_orders[], returns_products[]
}


