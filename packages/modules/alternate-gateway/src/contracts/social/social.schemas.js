"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizedSocialProviderFeedSchema = exports.CreatePostOutputSchema = exports.CreatePostInputSchema = exports.GetFeedOutputSchema = exports.GetFeedInputSchema = exports.UnfollowOutputSchema = exports.UnfollowInputSchema = exports.FollowOutputSchema = exports.FollowInputSchema = exports.SocialPostSchema = exports.SocialProfileSchema = void 0;
var zod_1 = require("zod");
var UuidSchema = zod_1.z.string().uuid();
var CorrelationIdSchema = zod_1.z.string().min(8).max(128);
exports.SocialProfileSchema = zod_1.z.object({
    userId: UuidSchema,
    handle: zod_1.z.string().min(3).max(64),
    displayName: zod_1.z.string().min(1).max(120),
});
exports.SocialPostSchema = zod_1.z.object({
    postId: zod_1.z.string().min(1),
    author: exports.SocialProfileSchema,
    content: zod_1.z.string().trim().min(1).max(5000),
    createdAtIso: zod_1.z.string().datetime({ offset: true }),
});
exports.FollowInputSchema = zod_1.z.object({
    actorId: UuidSchema,
    targetId: UuidSchema,
    correlationId: CorrelationIdSchema,
});
exports.FollowOutputSchema = zod_1.z.object({
    followed: zod_1.z.boolean(),
});
exports.UnfollowInputSchema = zod_1.z.object({
    actorId: UuidSchema,
    targetId: UuidSchema,
    correlationId: CorrelationIdSchema,
});
exports.UnfollowOutputSchema = zod_1.z.object({
    unfollowed: zod_1.z.boolean(),
});
exports.GetFeedInputSchema = zod_1.z.object({
    actorId: UuidSchema,
    page: zod_1.z.number().int().min(1).max(1000),
    pageSize: zod_1.z.number().int().min(1).max(50),
    correlationId: CorrelationIdSchema,
});
exports.GetFeedOutputSchema = zod_1.z.object({
    posts: zod_1.z.array(exports.SocialPostSchema),
    page: zod_1.z.number().int().min(1),
    pageSize: zod_1.z.number().int().min(1).max(50),
    totalResults: zod_1.z.number().int().min(0),
    totalPages: zod_1.z.number().int().min(0),
});
exports.CreatePostInputSchema = zod_1.z.object({
    actorId: UuidSchema,
    content: zod_1.z.string().trim().min(1).max(5000),
    correlationId: CorrelationIdSchema,
});
exports.CreatePostOutputSchema = zod_1.z.object({
    post: exports.SocialPostSchema,
});
exports.NormalizedSocialProviderFeedSchema = zod_1.z.object({
    posts: zod_1.z.array(exports.SocialPostSchema),
    totalResults: zod_1.z.number().int().min(0),
});
