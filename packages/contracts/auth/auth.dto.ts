export type AuthErrorCode =
	| 'AUTH_INVALID_CREDENTIALS'
	| 'AUTH_INVALID_TOKEN'
	| 'AUTH_EXPIRED_TOKEN'
	| 'AUTH_FORBIDDEN'
	| 'AUTH_RATE_LIMITED'
	| 'AUTH_TIMEOUT'
	| 'AUTH_UPSTREAM_FAILURE'
	| 'AUTH_VALIDATION_FAILED'

export class AuthContractError extends Error {
	readonly code: AuthErrorCode
	readonly statusCode: number
	readonly details: Record<string, unknown>

	constructor(
		code: AuthErrorCode,
		message: string,
		statusCode: number,
		details: Record<string, unknown> = {},
	) {
		super(message)
		this.name = 'AuthContractError'
		this.code = code
		this.statusCode = statusCode
		this.details = details
	}
}

export interface AuthUserDTO {
	id: string
	email: string
	displayName: string
	roles: string[]
	isEmailVerified: boolean
}

export interface LoginInputDTO {
	email: string
	password: string
	correlationId: string
}

export interface LoginOutputDTO {
	accessToken: string
	refreshToken: string
	tokenType: 'Bearer'
	expiresAtIso: string
	user: AuthUserDTO
}

export interface RefreshInputDTO {
	refreshToken: string
	correlationId: string
}

export interface RefreshOutputDTO {
	accessToken: string
	refreshToken: string
	tokenType: 'Bearer'
	expiresAtIso: string
}

export interface ValidateAccessTokenInputDTO {
	accessToken: string
	correlationId: string
}

export interface ValidatedUserDTO {
	user: AuthUserDTO
}

export interface LogoutInputDTO {
	accessToken: string
	correlationId: string
}

export interface LogoutOutputDTO {
	revoked: boolean
}

export interface NormalizedAuthProviderUserDTO {
	userId: string
	email: string
	displayName: string
	roles: string[]
	emailVerified: boolean
}

export interface NormalizedAuthProviderTokenDTO {
	accessToken: string
	refreshToken: string
	tokenType: 'Bearer'
	expiresAtIso: string
}
