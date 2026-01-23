export interface MeeoviPayment {
	id: number
	status?: string | null
	description?: string | null
	gateway?: string | null
	amount?: number | null
	created_at?: string | null
	// relations omitted: payments_countries[], payments_currency[]
}


