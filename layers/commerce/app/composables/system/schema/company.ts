export interface MeeoviCompany {
	id: string
	name: string
	website?: string | null
	description?: string | null
	metadata?: Record<string, unknown>
}

