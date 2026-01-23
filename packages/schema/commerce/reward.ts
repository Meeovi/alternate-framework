export interface MeeoviReward {
	id: string
	userId: string
	points: number
	balance?: number
	metadata?: Record<string, unknown>
}

