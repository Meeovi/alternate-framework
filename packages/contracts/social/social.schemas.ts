import { z } from 'zod'

const UuidSchema = z.string().uuid()
const CorrelationIdSchema = z.string().min(8).max(128)

export const SocialProfileSchema = z.object({
	userId: UuidSchema,
	handle: z.string().min(3).max(64),
	displayName: z.string().min(1).max(120),
})

export const SocialPostSchema = z.object({
	postId: z.string().min(1),
	author: SocialProfileSchema,
	content: z.string().trim().min(1).max(5000),
	createdAtIso: z.string().datetime({ offset: true }),
})

export const FollowInputSchema = z.object({
	actorId: UuidSchema,
	targetId: UuidSchema,
	correlationId: CorrelationIdSchema,
})

export const FollowOutputSchema = z.object({
	followed: z.boolean(),
})

export const UnfollowInputSchema = z.object({
	actorId: UuidSchema,
	targetId: UuidSchema,
	correlationId: CorrelationIdSchema,
})

export const UnfollowOutputSchema = z.object({
	unfollowed: z.boolean(),
})

export const GetFeedInputSchema = z.object({
	actorId: UuidSchema,
	page: z.number().int().min(1).max(1000),
	pageSize: z.number().int().min(1).max(50),
	correlationId: CorrelationIdSchema,
})

export const GetFeedOutputSchema = z.object({
	posts: z.array(SocialPostSchema),
	page: z.number().int().min(1),
	pageSize: z.number().int().min(1).max(50),
	totalResults: z.number().int().min(0),
	totalPages: z.number().int().min(0),
})

export const CreatePostInputSchema = z.object({
	actorId: UuidSchema,
	content: z.string().trim().min(1).max(5000),
	correlationId: CorrelationIdSchema,
})

export const CreatePostOutputSchema = z.object({
	post: SocialPostSchema,
})

export const NormalizedSocialProviderFeedSchema = z.object({
	posts: z.array(SocialPostSchema),
	totalResults: z.number().int().min(0),
})
