export interface MeeoviCustomerGroup {
	id: string
	name: string
	description?: string | null
	memberIds?: string[]
	metadata?: Record<string, unknown>
}

