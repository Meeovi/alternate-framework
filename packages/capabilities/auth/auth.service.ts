import type {
	AuthAdapterContract,
	AuthCapabilityContract,
} from '../../contracts/auth/auth.interface'
import type {
	LoginInputDTO,
	LoginOutputDTO,
	LogoutInputDTO,
	LogoutOutputDTO,
	RefreshInputDTO,
	RefreshOutputDTO,
	ValidateAccessTokenInputDTO,
	ValidatedUserDTO,
} from '../../contracts/auth/auth.dto'
import {
	parseLoginInput,
	parseLoginOutput,
	parseLogoutInput,
	parseLogoutOutput,
	parseRefreshInput,
	parseRefreshOutput,
	parseValidateAccessTokenInput,
	parseValidatedUserOutput,
} from './validators'
import { toAuthCapabilityError } from './auth.errors'

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

interface AuthCapabilityServiceDeps {
	logger?: CapabilityLogger
	metrics?: CapabilityMetrics
	rateLimiter?: CapabilityRateLimiter
	timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 15000

export class AuthCapabilityService implements AuthCapabilityContract {
	private readonly timeoutMs: number

	constructor(
		private readonly adapter: AuthAdapterContract,
		private readonly deps: AuthCapabilityServiceDeps = {},
	) {
		this.timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS
	}

	async login(input: LoginInputDTO): Promise<LoginOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseLoginInput(input)

		try {
			await this.deps.rateLimiter?.consume(`auth:login:${parsedInput.email.toLowerCase()}`)

			const providerResponse = await this.withTimeout(
				this.adapter.login(parsedInput),
			)

			const output = parseLoginOutput({
				accessToken: providerResponse.accessToken,
				refreshToken: providerResponse.refreshToken,
				tokenType: providerResponse.tokenType,
				expiresAtIso: providerResponse.expiresAtIso,
				user: {
					id: providerResponse.user.userId,
					email: providerResponse.user.email,
					displayName: providerResponse.user.displayName,
					roles: providerResponse.user.roles,
					isEmailVerified: providerResponse.user.emailVerified,
				},
			})

			this.recordSuccess('login', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('login', parsedInput.correlationId, startedAt, error)
			throw toAuthCapabilityError(error, 'AUTH_INVALID_CREDENTIALS', 'Auth login failed')
		}
	}

	async refresh(input: RefreshInputDTO): Promise<RefreshOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseRefreshInput(input)

		try {
			await this.deps.rateLimiter?.consume(`auth:refresh:${parsedInput.correlationId}`)
			const providerResponse = await this.withTimeout(this.adapter.refresh(parsedInput))
			const output = parseRefreshOutput({
				accessToken: providerResponse.accessToken,
				refreshToken: providerResponse.refreshToken,
				tokenType: providerResponse.tokenType,
				expiresAtIso: providerResponse.expiresAtIso,
			})

			this.recordSuccess('refresh', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('refresh', parsedInput.correlationId, startedAt, error)
			throw toAuthCapabilityError(error, 'AUTH_INVALID_TOKEN', 'Auth refresh failed')
		}
	}

	async validateAccessToken(input: ValidateAccessTokenInputDTO): Promise<ValidatedUserDTO> {
		const startedAt = Date.now()
		const parsedInput = parseValidateAccessTokenInput(input)

		try {
			const providerResponse = await this.withTimeout(this.adapter.introspectAccessToken(parsedInput))
			const output = parseValidatedUserOutput({
				user: {
					id: providerResponse.userId,
					email: providerResponse.email,
					displayName: providerResponse.displayName,
					roles: providerResponse.roles,
					isEmailVerified: providerResponse.emailVerified,
				},
			})

			this.recordSuccess('validateAccessToken', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('validateAccessToken', parsedInput.correlationId, startedAt, error)
			throw toAuthCapabilityError(error, 'AUTH_INVALID_TOKEN', 'Auth token validation failed')
		}
	}

	async logout(input: LogoutInputDTO): Promise<LogoutOutputDTO> {
		const startedAt = Date.now()
		const parsedInput = parseLogoutInput(input)

		try {
			const providerResponse = await this.withTimeout(this.adapter.revokeAccessToken(parsedInput))
			const output = parseLogoutOutput({ revoked: providerResponse.revoked })
			this.recordSuccess('logout', parsedInput.correlationId, startedAt)
			return output
		} catch (error) {
			this.recordFailure('logout', parsedInput.correlationId, startedAt, error)
			throw toAuthCapabilityError(error, 'AUTH_UPSTREAM_FAILURE', 'Auth logout failed')
		}
	}

	private async withTimeout<T>(promise: Promise<T>): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			const timeoutId = setTimeout(() => {
				clearTimeout(timeoutId)
				reject(new Error('Auth provider call timed out'))
			}, this.timeoutMs)
		})

		return Promise.race([promise, timeoutPromise])
	}

	private recordSuccess(methodName: string, correlationId: string, startedAt: number) {
		const latency = Date.now() - startedAt
		this.deps.logger?.info('auth capability succeeded', {
			capability: 'auth',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: true,
		})
		this.deps.metrics?.increment('capability.auth.success', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.auth.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}

	private recordFailure(methodName: string, correlationId: string, startedAt: number, error: unknown) {
		const latency = Date.now() - startedAt
		this.deps.logger?.error('auth capability failed', {
			capability: 'auth',
			methodName,
			correlationId,
			providerName: this.adapter.providerName,
			latency,
			success: false,
			errorMessage: error instanceof Error ? error.message : 'unknown-error',
		})
		this.deps.metrics?.increment('capability.auth.error', { methodName, provider: this.adapter.providerName })
		this.deps.metrics?.timing('capability.auth.latency_ms', latency, { methodName, provider: this.adapter.providerName })
	}
}
