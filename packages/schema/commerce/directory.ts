export interface MeeoviDirectoryEntry {
	id: string
	name: string
	type?: string | null
	url?: string | null
	metadata?: Record<string, unknown>
}

