export type CommerceErrorCode =
	| 'COMMERCE_NOT_FOUND'
	| 'COMMERCE_FORBIDDEN'
	| 'COMMERCE_INVALID_INPUT'
	| 'COMMERCE_RATE_LIMITED'
	| 'COMMERCE_TIMEOUT'
	| 'COMMERCE_UPSTREAM_FAILURE'
	| 'COMMERCE_VALIDATION_FAILED'

export class CommerceContractError extends Error {
	readonly code: CommerceErrorCode
	readonly statusCode: number
	readonly details: Record<string, unknown>

	constructor(
		code: CommerceErrorCode,
		message: string,
		statusCode: number,
		details: Record<string, unknown> = {},
	) {
		super(message)
		this.name = 'CommerceContractError'
		this.code = code
		this.statusCode = statusCode
		this.details = details
	}
}

export interface CommerceMoneyDTO {
	currency: string
	amount: number
}

export interface CommerceProductDTO {
	id: string
	sku: string
	title: string
	description: string
	unitPrice: CommerceMoneyDTO
	availability: 'in_stock' | 'out_of_stock'
}

export interface CommerceCartItemDTO {
	productId: string
	quantity: number
	unitPrice: CommerceMoneyDTO
	lineTotal: CommerceMoneyDTO
}

export interface CommerceCartDTO {
	id: string
	items: CommerceCartItemDTO[]
	subtotal: CommerceMoneyDTO
	total: CommerceMoneyDTO
}

export interface ListProductsInputDTO {
	query: string
	page: number
	pageSize: number
	correlationId: string
	actorId: string
}

export interface ListProductsOutputDTO {
	items: CommerceProductDTO[]
	totalResults: number
	totalPages: number
	page: number
	pageSize: number
}

export interface GetProductInputDTO {
	productId: string
	correlationId: string
	actorId: string
}

export interface GetProductOutputDTO {
	product: CommerceProductDTO
}

export interface GetCartInputDTO {
	cartId: string
	correlationId: string
	actorId: string
}

export interface GetCartOutputDTO {
	cart: CommerceCartDTO
}

export interface AddToCartInputDTO {
	cartId: string
	productId: string
	quantity: number
	correlationId: string
	actorId: string
}

export interface AddToCartOutputDTO {
	cart: CommerceCartDTO
}

export interface RemoveFromCartInputDTO {
	cartId: string
	productId: string
	correlationId: string
	actorId: string
}

export interface RemoveFromCartOutputDTO {
	cart: CommerceCartDTO
}

export interface CheckoutInputDTO {
	cartId: string
	correlationId: string
	actorId: string
}

export interface CheckoutOutputDTO {
	orderId: string
	total: CommerceMoneyDTO
}

export interface NormalizedCommerceProviderListDTO {
	items: CommerceProductDTO[]
	totalResults: number
}

export interface NormalizedCommerceProviderCartDTO {
	cart: CommerceCartDTO
}
