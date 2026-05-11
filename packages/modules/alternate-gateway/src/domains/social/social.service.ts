import type {
	SocialAdapterContract,
	SocialCapabilityContract,
} from '../../contracts/social/social.interface'
import type {
	CreatePostInputDTO,
	CreatePostOutputDTO,
	FollowInputDTO,
	FollowOutputDTO,
	GetFeedInputDTO,
	GetFeedOutputDTO,
	UnfollowInputDTO,
	UnfollowOutputDTO,
} from '../../contracts/social/social.dto'
import {
	parseCreatePostInput,
	parseCreatePostOutput,
	parseFollowInput,
	parseFollowOutput,
	parseGetFeedInput,
	parseGetFeedOutput,
	parseUnfollowInput,
	parseUnfollowOutput,
} from './social.validators'
import { toSocialCapabilityError } from './social.errors'

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

interface SocialCapabilityServiceDeps {
	logger?: CapabilityLogger
	metrics?: CapabilityMetrics
	rateLimiter?: CapabilityRateLimiter
	acl?: AclAuthorizer
	timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 15000

export class SocialCapabilityService implements SocialCapabilityContract {
	private readonly timeoutMs: number

	constructor(
		private readonly adapter: SocialAdapterContract,
		private readonly deps: SocialCapabilityServiceDeps = {},
	) {
		this.timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS
	}

	async follow(input: FollowInputDTO): Promise<FollowOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseFollowInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, `social:user:${parsedInput.targetId}`, 'follow')
			await this.deps.rateLimiter?.consume(`social:follow:${parsedInput.actorId}`)
			const providerResult = await this.withTimeout(this.adapter.follow(parsedInput))
			const output = parseFollowOutput(providerResult)
			this.recordSuccess('follow', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('follow', parsedInput.correlationId, startedAt, error)
			throw toSocialCapabilityError(error, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to follow user')
		}
	}

	async unfollow(input: UnfollowInputDTO): Promise<UnfollowOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseUnfollowInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, `social:user:${parsedInput.targetId}`, 'unfollow')
			const providerResult = await this.withTimeout(this.adapter.unfollow(parsedInput))
			const output = parseUnfollowOutput(providerResult)
			this.recordSuccess('unfollow', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('unfollow', parsedInput.correlationId, startedAt, error)
			throw toSocialCapabilityError(error, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to unfollow user')
		}
	}

	async getFeed(input: GetFeedInputDTO): Promise<GetFeedOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseGetFeedInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, 'social:feed', 'read')
			await this.deps.rateLimiter?.consume(`social:feed:${parsedInput.actorId}`)

			const providerResult = await this.withTimeout(this.adapter.getFeed(parsedInput))
			const totalPages = Math.ceil(providerResult.totalResults / parsedInput.pageSize)
			const output = parseGetFeedOutput({
				posts: providerResult.posts,
				page: parsedInput.page,
				pageSize: parsedInput.pageSize,
				totalResults: providerResult.totalResults,
				totalPages,
			})

			this.recordSuccess('getFeed', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('getFeed', parsedInput.correlationId, startedAt, error)
			throw toSocialCapabilityError(error, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to fetch feed')
		}
	}

	async createPost(input: CreatePostInputDTO): Promise<CreatePostOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseCreatePostInput(input)

		try {
			await this.deps.acl?.assertAccess(parsedInput.actorId, 'social:post', 'write')
			await this.deps.rateLimiter?.consume(`social:createPost:${parsedInput.actorId}`)

			const providerResult = await this.withTimeout(this.adapter.createPost(parsedInput))
			const output = parseCreatePostOutput(providerResult)
			this.recordSuccess('createPost', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('createPost', parsedInput.correlationId, startedAt, error)
			throw toSocialCapabilityError(error, 'SOCIAL_UPSTREAM_FAILURE', 'Failed to create post')
		}
	}

	private async withTimeout<T>(promise: Promise<T>): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId)
				reject(new Error('Social provider call timed out'))
			}, this.timeoutMs)
		})

		return Promise.race([promise, timeoutPromise])
	}

	private recordSuccess(methodName: string, correlationId: string, startedAt: number) {
		const latency = Date.now() - startedAt
		this.deps.logger?.info('social capability succeeded', {
			capability: 'social',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: true,
		})
		this.deps.metrics?.increment('capability.social.success', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.social.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}

	private recordFailure(methodName: string, correlationId: string, startedAt: number, error: unknown) {
		const latency = Date.now() - startedAt
		this.deps.logger?.error('social capability failed', {
			capability: 'social',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: false,
			errorMessage: error instanceof Error ? error.message : 'unknown-error',
		})
		this.deps.metrics?.increment('capability.social.error', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.social.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}
}
