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
	CreatePostInputSchema,
	CreatePostOutputSchema,
	FollowInputSchema,
	FollowOutputSchema,
	GetFeedInputSchema,
	GetFeedOutputSchema,
	UnfollowInputSchema,
	UnfollowOutputSchema,
} from '../../contracts/social/social.schemas'

export function parseFollowInput(input: FollowInputDTO): FollowInputDTO {
	return FollowInputSchema.parse(input)
}

export function parseFollowOutput(output: FollowOutputDTO): FollowOutputDTO {
	return FollowOutputSchema.parse(output)
}

export function parseUnfollowInput(input: UnfollowInputDTO): UnfollowInputDTO {
	return UnfollowInputSchema.parse(input)
}

export function parseUnfollowOutput(output: UnfollowOutputDTO): UnfollowOutputDTO {
	return UnfollowOutputSchema.parse(output)
}

export function parseGetFeedInput(input: GetFeedInputDTO): GetFeedInputDTO {
	return GetFeedInputSchema.parse(input)
}

export function parseGetFeedOutput(output: GetFeedOutputDTO): GetFeedOutputDTO {
	return GetFeedOutputSchema.parse(output)
}

export function parseCreatePostInput(input: CreatePostInputDTO): CreatePostInputDTO {
	return CreatePostInputSchema.parse(input)
}

export function parseCreatePostOutput(output: CreatePostOutputDTO): CreatePostOutputDTO {
	return CreatePostOutputSchema.parse(output)
}
