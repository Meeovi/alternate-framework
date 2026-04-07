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
	RemoveFromCartInputDTO,
	RemoveFromCartOutputDTO,
} from '../../contracts/commerce/commerce.dto'
import {
	AddToCartInputSchema,
	AddToCartOutputSchema,
	CheckoutInputSchema,
	CheckoutOutputSchema,
	GetCartInputSchema,
	GetCartOutputSchema,
	GetProductInputSchema,
	GetProductOutputSchema,
	ListProductsInputSchema,
	ListProductsOutputSchema,
	RemoveFromCartInputSchema,
	RemoveFromCartOutputSchema,
} from '../../contracts/commerce/commerce.schemas'

export function parseListProductsInput(input: ListProductsInputDTO): ListProductsInputDTO {
	return ListProductsInputSchema.parse(input)
}

export function parseListProductsOutput(output: ListProductsOutputDTO): ListProductsOutputDTO {
	return ListProductsOutputSchema.parse(output)
}

export function parseGetProductInput(input: GetProductInputDTO): GetProductInputDTO {
	return GetProductInputSchema.parse(input)
}

export function parseGetProductOutput(output: GetProductOutputDTO): GetProductOutputDTO {
	return GetProductOutputSchema.parse(output)
}

export function parseGetCartInput(input: GetCartInputDTO): GetCartInputDTO {
	return GetCartInputSchema.parse(input)
}

export function parseGetCartOutput(output: GetCartOutputDTO): GetCartOutputDTO {
	return GetCartOutputSchema.parse(output)
}

export function parseAddToCartInput(input: AddToCartInputDTO): AddToCartInputDTO {
	return AddToCartInputSchema.parse(input)
}

export function parseAddToCartOutput(output: AddToCartOutputDTO): AddToCartOutputDTO {
	return AddToCartOutputSchema.parse(output)
}

export function parseRemoveFromCartInput(input: RemoveFromCartInputDTO): RemoveFromCartInputDTO {
	return RemoveFromCartInputSchema.parse(input)
}

export function parseRemoveFromCartOutput(output: RemoveFromCartOutputDTO): RemoveFromCartOutputDTO {
	return RemoveFromCartOutputSchema.parse(output)
}

export function parseCheckoutInput(input: CheckoutInputDTO): CheckoutInputDTO {
	return CheckoutInputSchema.parse(input)
}

export function parseCheckoutOutput(output: CheckoutOutputDTO): CheckoutOutputDTO {
	return CheckoutOutputSchema.parse(output)
}
