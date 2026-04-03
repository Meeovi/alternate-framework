import type {
	AddToCartInputDTO,
	AddToCartOutputDTO,
	CheckoutInputDTO,
	CheckoutOutputDTO,
	GetCartInputDTO,
	GetCartOutputDTO,
	GetProductInputDTO,
	GetProductOutputDTO,
	ListProductsInputDTO,
	ListProductsOutputDTO,
	NormalizedCommerceProviderCartDTO,
	NormalizedCommerceProviderListDTO,
	RemoveFromCartInputDTO,
	RemoveFromCartOutputDTO,
} from './commerce.dto'

export const COMMERCE_CONTRACT_INVARIANTS = [
	'Commerce money values must be finite and non-negative.',
	'Commerce product IDs and cart IDs must be non-empty strings.',
	'Commerce capabilities must enforce ACL and actor ownership checks.',
	'Commerce capabilities must return normalized DTOs without provider-specific fields.',
	'Commerce list responses must always contain pagination metadata.',
] as const

export interface CommerceCapabilityContract {
	listProducts(input: ListProductsInputDTO): Promise<ListProductsOutputDTO>
	getProduct(input: GetProductInputDTO): Promise<GetProductOutputDTO>
	getCart(input: GetCartInputDTO): Promise<GetCartOutputDTO>
	addToCart(input: AddToCartInputDTO): Promise<AddToCartOutputDTO>
	removeFromCart(input: RemoveFromCartInputDTO): Promise<RemoveFromCartOutputDTO>
	checkout(input: CheckoutInputDTO): Promise<CheckoutOutputDTO>
}

export interface CommerceAdapterContract {
	readonly providerName: string
	listProducts(input: ListProductsInputDTO): Promise<NormalizedCommerceProviderListDTO>
	getProduct(input: GetProductInputDTO): Promise<GetProductOutputDTO>
	getCart(input: GetCartInputDTO): Promise<NormalizedCommerceProviderCartDTO>
	addToCart(input: AddToCartInputDTO): Promise<NormalizedCommerceProviderCartDTO>
	removeFromCart(input: RemoveFromCartInputDTO): Promise<NormalizedCommerceProviderCartDTO>
	checkout(input: CheckoutInputDTO): Promise<CheckoutOutputDTO>
}
