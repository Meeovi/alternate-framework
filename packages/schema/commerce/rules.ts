export interface MeeoviRule {
	id: string
	name: string
	condition?: string | null
	action?: string | null
	metadata?: Record<string, unknown>
}

