export interface MeeoviCurrency {
	id: number
	sort?: number | null
	date_created?: string | null
	date_updated?: string | null
	name?: string | null
	code?: string | null
	symbol?: string | null
	// relations omitted: countries_currency[], currency_departments[], etc.
}


