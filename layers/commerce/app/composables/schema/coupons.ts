export interface MeeoviCoupon {
	id: string
	code: string
	description?: string | null
	discountType: 'percentage' | 'fixed' | string
	amount: number
	expiresAt?: string | null
	metadata?: Record<string, unknown>
}

