import type {
	SearchAdapterContract,
	SearchCapabilityContract,
} from '../../contracts/search/search.interface'
import type { SearchInputDTO, SearchOutputDTO } from '../../contracts/search/search.dto'
import { parseNormalizedSearchProviderResult, parseSearchInput, parseSearchOutput } from './search.validators'
import { toSearchCapabilityError } from './search.errors'

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

interface SearchCapabilityServiceDeps {
	logger?: CapabilityLogger
	metrics?: CapabilityMetrics
	rateLimiter?: CapabilityRateLimiter
	acl?: AclAuthorizer
	timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 15000

export class SearchCapabilityService implements SearchCapabilityContract {
	private readonly timeoutMs: number

	constructor(
		private readonly adapter: SearchAdapterContract,
		private readonly deps: SearchCapabilityServiceDeps = {},
	) {
		this.timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS
	}

	async search(input: SearchInputDTO): Promise<SearchOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseSearchInput(input)

		try {
			this.assertSearchSafety(parsedInput)
			await this.deps.acl?.assertAccess(parsedInput.actorId, 'search', 'read')
			await this.deps.rateLimiter?.consume(`search:${parsedInput.actorId}`)

			const providerResult = await this.withTimeout(this.adapter.search(parsedInput))
			const normalizedProviderResult = parseNormalizedSearchProviderResult(providerResult)
			const totalPages = Math.ceil(normalizedProviderResult.totalResults / parsedInput.pageSize)

			const output = parseSearchOutput({
				items: normalizedProviderResult.items,
				pagination: {
					page: parsedInput.page,
					pageSize: parsedInput.pageSize,
					totalResults: normalizedProviderResult.totalResults,
					totalPages,
				},
			})

			this.recordSuccess('search', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('search', parsedInput.correlationId, startedAt, error)
			throw toSearchCapabilityError(error, 'SEARCH_UPSTREAM_FAILURE', 'Search failed')
		}
	}

	private assertSearchSafety(input: SearchInputDTO) {
		if (/[*%]{2,}|\*/.test(input.query)) {
			throw toSearchCapabilityError(new Error('Wildcard queries are not allowed'), 'SEARCH_INVALID_QUERY', 'Invalid search query')
		}
	}

	private async withTimeout<T>(promise: Promise<T>): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId)
				reject(new Error('Search provider call timed out'))
			}, this.timeoutMs)
		})

		return Promise.race([promise, timeoutPromise])
	}

	private recordSuccess(methodName: string, correlationId: string, startedAt: number) {
		const latency = Date.now() - startedAt
		this.deps.logger?.info('search capability succeeded', {
			capability: 'search',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: true,
		})
		this.deps.metrics?.increment('capability.search.success', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.search.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}

	private recordFailure(methodName: string, correlationId: string, startedAt: number, error: unknown) {
		const latency = Date.now() - startedAt
		this.deps.logger?.error('search capability failed', {
			capability: 'search',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: false,
			errorMessage: error instanceof Error ? error.message : 'unknown-error',
		})
		this.deps.metrics?.increment('capability.search.error', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.search.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}
}
