export interface MeeoviBlock {
	id: string
	type: string
	content: string | null
	metadata?: Record<string, unknown>
}

