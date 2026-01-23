export interface MeeoviStore {
	id: string
	name: string
	currency: string
	defaultLocale?: string | null
	metadata?: Record<string, unknown>
}

