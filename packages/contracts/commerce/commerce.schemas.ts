import { z } from 'zod'

const NonEmptyStringSchema = z.string().min(1)
const CorrelationIdSchema = z.string().min(8).max(128)

export const CommerceMoneySchema = z.object({
	currency: z.string().length(3),
	amount: z.number().finite().min(0),
})

export const CommerceProductSchema = z.object({
	id: NonEmptyStringSchema,
	sku: NonEmptyStringSchema,
	title: z.string().min(1).max(200),
	description: z.string().min(1).max(4000),
	unitPrice: CommerceMoneySchema,
	availability: z.enum(['in_stock', 'out_of_stock']),
})

export const CommerceCartItemSchema = z.object({
	productId: NonEmptyStringSchema,
	quantity: z.number().int().min(1).max(999),
	unitPrice: CommerceMoneySchema,
	lineTotal: CommerceMoneySchema,
})

export const CommerceCartSchema = z.object({
	id: NonEmptyStringSchema,
	items: z.array(CommerceCartItemSchema),
	subtotal: CommerceMoneySchema,
	total: CommerceMoneySchema,
})

export const ListProductsInputSchema = z.object({
	query: z.string().trim().min(1).max(200),
	page: z.number().int().min(1).max(1000),
	pageSize: z.number().int().min(1).max(50),
	correlationId: CorrelationIdSchema,
	actorId: z.string().uuid(),
})

export const ListProductsOutputSchema = z.object({
	items: z.array(CommerceProductSchema),
	totalResults: z.number().int().min(0),
	totalPages: z.number().int().min(0),
	page: z.number().int().min(1),
	pageSize: z.number().int().min(1).max(50),
})

export const GetProductInputSchema = z.object({
	productId: NonEmptyStringSchema,
	correlationId: CorrelationIdSchema,
	actorId: z.string().uuid(),
})

export const GetProductOutputSchema = z.object({
	product: CommerceProductSchema,
})

export const GetCartInputSchema = z.object({
	cartId: NonEmptyStringSchema,
	correlationId: CorrelationIdSchema,
	actorId: z.string().uuid(),
})

export const GetCartOutputSchema = z.object({
	cart: CommerceCartSchema,
})

export const AddToCartInputSchema = z.object({
	cartId: NonEmptyStringSchema,
	productId: NonEmptyStringSchema,
	quantity: z.number().int().min(1).max(999),
	correlationId: CorrelationIdSchema,
	actorId: z.string().uuid(),
})

export const AddToCartOutputSchema = z.object({
	cart: CommerceCartSchema,
})

export const RemoveFromCartInputSchema = z.object({
	cartId: NonEmptyStringSchema,
	productId: NonEmptyStringSchema,
	correlationId: CorrelationIdSchema,
	actorId: z.string().uuid(),
})

export const RemoveFromCartOutputSchema = z.object({
	cart: CommerceCartSchema,
})

export const CheckoutInputSchema = z.object({
	cartId: NonEmptyStringSchema,
	correlationId: CorrelationIdSchema,
	actorId: z.string().uuid(),
})

export const CheckoutOutputSchema = z.object({
	orderId: NonEmptyStringSchema,
	total: CommerceMoneySchema,
})

export const NormalizedCommerceProviderListSchema = z.object({
	items: z.array(CommerceProductSchema),
	totalResults: z.number().int().min(0),
})

export const NormalizedCommerceProviderCartSchema = z.object({
	cart: CommerceCartSchema,
})
