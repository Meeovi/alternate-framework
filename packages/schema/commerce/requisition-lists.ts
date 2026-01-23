export interface MeeoviRequisitionList {
	id: string
	ownerId?: string | null
	items: Array<{ productId: string; quantity: number }>
	metadata?: Record<string, unknown>
}

