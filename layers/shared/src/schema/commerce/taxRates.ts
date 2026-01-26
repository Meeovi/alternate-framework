export interface MeeoviTaxRate {
	id: number
	rate?: number | null
	tax_class?: string | null
	certifications?: Record<string, unknown> | null
	age_gating?: string | null
	// relations omitted: taxes_countries[], taxes_states[]
}

