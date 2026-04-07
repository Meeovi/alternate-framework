"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizedCommerceProviderCartSchema = exports.NormalizedCommerceProviderListSchema = exports.CheckoutOutputSchema = exports.CheckoutInputSchema = exports.RemoveFromCartOutputSchema = exports.RemoveFromCartInputSchema = exports.AddToCartOutputSchema = exports.AddToCartInputSchema = exports.GetCartOutputSchema = exports.GetCartInputSchema = exports.GetProductOutputSchema = exports.GetProductInputSchema = exports.ListProductsOutputSchema = exports.ListProductsInputSchema = exports.CommerceCartSchema = exports.CommerceCartItemSchema = exports.CommerceProductSchema = exports.CommerceMoneySchema = void 0;
var zod_1 = require("zod");
var NonEmptyStringSchema = zod_1.z.string().min(1);
var CorrelationIdSchema = zod_1.z.string().min(8).max(128);
exports.CommerceMoneySchema = zod_1.z.object({
    currency: zod_1.z.string().length(3),
    amount: zod_1.z.number().finite().min(0),
});
exports.CommerceProductSchema = zod_1.z.object({
    id: NonEmptyStringSchema,
    sku: NonEmptyStringSchema,
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().min(1).max(4000),
    unitPrice: exports.CommerceMoneySchema,
    availability: zod_1.z.enum(['in_stock', 'out_of_stock']),
});
exports.CommerceCartItemSchema = zod_1.z.object({
    productId: NonEmptyStringSchema,
    quantity: zod_1.z.number().int().min(1).max(999),
    unitPrice: exports.CommerceMoneySchema,
    lineTotal: exports.CommerceMoneySchema,
});
exports.CommerceCartSchema = zod_1.z.object({
    id: NonEmptyStringSchema,
    items: zod_1.z.array(exports.CommerceCartItemSchema),
    subtotal: exports.CommerceMoneySchema,
    total: exports.CommerceMoneySchema,
});
exports.ListProductsInputSchema = zod_1.z.object({
    query: zod_1.z.string().trim().min(1).max(200),
    page: zod_1.z.number().int().min(1).max(1000),
    pageSize: zod_1.z.number().int().min(1).max(50),
    correlationId: CorrelationIdSchema,
    actorId: zod_1.z.string().uuid(),
});
exports.ListProductsOutputSchema = zod_1.z.object({
    items: zod_1.z.array(exports.CommerceProductSchema),
    totalResults: zod_1.z.number().int().min(0),
    totalPages: zod_1.z.number().int().min(0),
    page: zod_1.z.number().int().min(1),
    pageSize: zod_1.z.number().int().min(1).max(50),
});
exports.GetProductInputSchema = zod_1.z.object({
    productId: NonEmptyStringSchema,
    correlationId: CorrelationIdSchema,
    actorId: zod_1.z.string().uuid(),
});
exports.GetProductOutputSchema = zod_1.z.object({
    product: exports.CommerceProductSchema,
});
exports.GetCartInputSchema = zod_1.z.object({
    cartId: NonEmptyStringSchema,
    correlationId: CorrelationIdSchema,
    actorId: zod_1.z.string().uuid(),
});
exports.GetCartOutputSchema = zod_1.z.object({
    cart: exports.CommerceCartSchema,
});
exports.AddToCartInputSchema = zod_1.z.object({
    cartId: NonEmptyStringSchema,
    productId: NonEmptyStringSchema,
    quantity: zod_1.z.number().int().min(1).max(999),
    correlationId: CorrelationIdSchema,
    actorId: zod_1.z.string().uuid(),
});
exports.AddToCartOutputSchema = zod_1.z.object({
    cart: exports.CommerceCartSchema,
});
exports.RemoveFromCartInputSchema = zod_1.z.object({
    cartId: NonEmptyStringSchema,
    productId: NonEmptyStringSchema,
    correlationId: CorrelationIdSchema,
    actorId: zod_1.z.string().uuid(),
});
exports.RemoveFromCartOutputSchema = zod_1.z.object({
    cart: exports.CommerceCartSchema,
});
exports.CheckoutInputSchema = zod_1.z.object({
    cartId: NonEmptyStringSchema,
    correlationId: CorrelationIdSchema,
    actorId: zod_1.z.string().uuid(),
});
exports.CheckoutOutputSchema = zod_1.z.object({
    orderId: NonEmptyStringSchema,
    total: exports.CommerceMoneySchema,
});
exports.NormalizedCommerceProviderListSchema = zod_1.z.object({
    items: zod_1.z.array(exports.CommerceProductSchema),
    totalResults: zod_1.z.number().int().min(0),
});
exports.NormalizedCommerceProviderCartSchema = zod_1.z.object({
    cart: exports.CommerceCartSchema,
});
