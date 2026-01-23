export interface MeeoviTaxRule {
	id: string
	name: string
	taxRateId?: string | null
	priority?: number
	metadata?: Record<string, unknown>
}

