export interface MeeoviTransaction {
	id: string
	status?: string | null
	date_created?: string | null
	date_updated?: string | null
	order?: number | null
	payment_method?: string | null
	transactions_parent_id?: string | null
	type?: string | null
	amount?: number | null
	// relations omitted: transactions_currency[]
}

