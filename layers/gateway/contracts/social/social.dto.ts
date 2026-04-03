export type SocialErrorCode =
	| 'SOCIAL_NOT_FOUND'
	| 'SOCIAL_FORBIDDEN'
	| 'SOCIAL_INVALID_INPUT'
	| 'SOCIAL_RATE_LIMITED'
	| 'SOCIAL_TIMEOUT'
	| 'SOCIAL_UPSTREAM_FAILURE'
	| 'SOCIAL_VALIDATION_FAILED'

export class SocialContractError extends Error {
	readonly code: SocialErrorCode
	readonly statusCode: number
	readonly details: Record<string, unknown>

	constructor(
		code: SocialErrorCode,
		message: string,
		statusCode: number,
		details: Record<string, unknown> = {},
	) {
		super(message)
		this.name = 'SocialContractError'
		this.code = code
		this.statusCode = statusCode
		this.details = details
	}
}

export interface SocialProfileDTO {
	userId: string
	handle: string
	displayName: string
}

export interface SocialPostDTO {
	postId: string
	author: SocialProfileDTO
	content: string
	createdAtIso: string
}

export interface FollowInputDTO {
	actorId: string
	targetId: string
	correlationId: string
}

export interface FollowOutputDTO {
	followed: boolean
}

export interface UnfollowInputDTO {
	actorId: string
	targetId: string
	correlationId: string
}

export interface UnfollowOutputDTO {
	unfollowed: boolean
}

export interface GetFeedInputDTO {
	actorId: string
	page: number
	pageSize: number
	correlationId: string
}

export interface GetFeedOutputDTO {
	posts: SocialPostDTO[]
	page: number
	pageSize: number
	totalResults: number
	totalPages: number
}

export interface CreatePostInputDTO {
	actorId: string
	content: string
	correlationId: string
}

export interface CreatePostOutputDTO {
	post: SocialPostDTO
}

export interface NormalizedSocialProviderFeedDTO {
	posts: SocialPostDTO[]
	totalResults: number
}
