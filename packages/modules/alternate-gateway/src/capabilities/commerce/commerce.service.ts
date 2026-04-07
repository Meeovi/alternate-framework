import type {
	CommerceAdapterContract,
	CommerceCapabilityContract,
} from '../../contracts/commerce/commerce.interface'
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
	parseAddToCartInput,
	parseAddToCartOutput,
	parseCheckoutInput,
	parseCheckoutOutput,
	parseGetCartInput,
	parseGetCartOutput,
	parseGetProductInput,
	parseGetProductOutput,
	parseListProductsInput,
	parseListProductsOutput,
	parseRemoveFromCartInput,
	parseRemoveFromCartOutput,
} from './commerce.validators'
import { toCommerceCapabilityError } from './commerce.errors'

interface CapabilityLogger {
	info(message: string, context: Record<string, unknown>): void
	error(message: string, context: Record<string, unknown>): void
}

interface CapabilityMetrics {
	increment(metricName: string, tags: Record<string, string>): void
	timing(metricName: string, durationMs: number, tags: Record<string, string>): void
}

interface CapabilityRateLimiter {
	consume(key: string): Promise<void>
}

interface AclAuthorizer {
	assertAccess(actorId: string, resource: string, action: string): Promise<void>
}

interface CommerceCapabilityServiceDeps {
	logger?: CapabilityLogger
	metrics?: CapabilityMetrics
	rateLimiter?: CapabilityRateLimiter
	acl?: AclAuthorizer
	timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 15000

export class CommerceCapabilityService implements CommerceCapabilityContract {
	private readonly timeoutMs: number

	constructor(
		private readonly adapter: CommerceAdapterContract,
		private readonly deps: CommerceCapabilityServiceDeps = {},
	) {
		this.timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS
	}

	async listProducts(input: ListProductsInputDTO): Promise<ListProductsOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseListProductsInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, 'catalog', 'read')
			await this.deps.rateLimiter?.consume(`commerce:listProducts:${parsedInput.actorId}`)

			const providerResult = await this.withTimeout(this.adapter.listProducts(parsedInput))
			const totalPages = Math.ceil(providerResult.totalResults / parsedInput.pageSize)
			const output = parseListProductsOutput({
				items: providerResult.items,
				totalResults: providerResult.totalResults,
				totalPages,
				page: parsedInput.page,
				pageSize: parsedInput.pageSize,
			})

			this.recordSuccess('listProducts', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('listProducts', parsedInput.correlationId, startedAt, error)
			throw toCommerceCapabilityError(error, 'COMMERCE_UPSTREAM_FAILURE', 'Failed to list products')
		}
	}

	async getProduct(input: GetProductInputDTO): Promise<GetProductOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseGetProductInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, 'catalog', 'read')
			const providerResult = await this.withTimeout(this.adapter.getProduct(parsedInput))
			const output = parseGetProductOutput(providerResult)
			this.recordSuccess('getProduct', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('getProduct', parsedInput.correlationId, startedAt, error)
			throw toCommerceCapabilityError(error, 'COMMERCE_NOT_FOUND', 'Product not found')
		}
	}

	async getCart(input: GetCartInputDTO): Promise<GetCartOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseGetCartInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, `cart:${parsedInput.cartId}`, 'read')
			const providerResult = await this.withTimeout(this.adapter.getCart(parsedInput))
			const output = parseGetCartOutput(providerResult)
			this.recordSuccess('getCart', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('getCart', parsedInput.correlationId, startedAt, error)
			throw toCommerceCapabilityError(error, 'COMMERCE_UPSTREAM_FAILURE', 'Failed to get cart')
		}
	}

	async addToCart(input: AddToCartInputDTO): Promise<AddToCartOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseAddToCartInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, `cart:${parsedInput.cartId}`, 'write')
			await this.deps.rateLimiter?.consume(`commerce:addToCart:${parsedInput.actorId}`)
			const providerResult = await this.withTimeout(this.adapter.addToCart(parsedInput))
			const output = parseAddToCartOutput(providerResult)
			this.recordSuccess('addToCart', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('addToCart', parsedInput.correlationId, startedAt, error)
			throw toCommerceCapabilityError(error, 'COMMERCE_UPSTREAM_FAILURE', 'Failed to add to cart')
		}
	}

	async removeFromCart(input: RemoveFromCartInputDTO): Promise<RemoveFromCartOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseRemoveFromCartInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, `cart:${parsedInput.cartId}`, 'write')
			const providerResult = await this.withTimeout(this.adapter.removeFromCart(parsedInput))
			const output = parseRemoveFromCartOutput(providerResult)
			this.recordSuccess('removeFromCart', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('removeFromCart', parsedInput.correlationId, startedAt, error)
			throw toCommerceCapabilityError(error, 'COMMERCE_UPSTREAM_FAILURE', 'Failed to remove from cart')
		}
	}

	async checkout(input: CheckoutInputDTO): Promise<CheckoutOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseCheckoutInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, `cart:${parsedInput.cartId}`, 'checkout')
			await this.deps.rateLimiter?.consume(`commerce:checkout:${parsedInput.actorId}`)
			const providerResult = await this.withTimeout(this.adapter.checkout(parsedInput))
			const output = parseCheckoutOutput(providerResult)
			this.recordSuccess('checkout', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('checkout', parsedInput.correlationId, startedAt, error)
			throw toCommerceCapabilityError(error, 'COMMERCE_UPSTREAM_FAILURE', 'Checkout failed')
		}
	}

	private async withTimeout<T>(promise: Promise<T>): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId)
				reject(new Error('Commerce provider call timed out'))
			}, this.timeoutMs)
		})

		return Promise.race([promise, timeoutPromise])
	}

	private recordSuccess(methodName: string, correlationId: string, startedAt: number) {
		const latency = Date.now() - startedAt
		this.deps.logger?.info('commerce capability succeeded', {
			capability: 'commerce',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: true,
		})
		this.deps.metrics?.increment('capability.commerce.success', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.commerce.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}

	private recordFailure(methodName: string, correlationId: string, startedAt: number, error: unknown) {
		const latency = Date.now() - startedAt
		this.deps.logger?.error('commerce capability failed', {
			capability: 'commerce',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: false,
			errorMessage: error instanceof Error ? error.message : 'unknown-error',
		})
		this.deps.metrics?.increment('capability.commerce.error', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.commerce.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}
}
