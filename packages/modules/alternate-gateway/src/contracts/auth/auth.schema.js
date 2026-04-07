"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizedAuthProviderTokenSchema = exports.NormalizedAuthProviderUserSchema = exports.LogoutOutputSchema = exports.LogoutInputSchema = exports.ValidatedUserSchema = exports.ValidateAccessTokenInputSchema = exports.RefreshOutputSchema = exports.RefreshInputSchema = exports.LoginOutputSchema = exports.LoginInputSchema = exports.AuthUserSchema = void 0;
var zod_1 = require("zod");
var UuidSchema = zod_1.z.string().uuid();
var IsoDateSchema = zod_1.z.string().datetime({ offset: true });
exports.AuthUserSchema = zod_1.z.object({
    id: UuidSchema,
    email: zod_1.z.string().email(),
    displayName: zod_1.z.string().min(1).max(120),
    roles: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    isEmailVerified: zod_1.z.boolean(),
});
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(256),
    correlationId: zod_1.z.string().min(8).max(128),
});
exports.LoginOutputSchema = zod_1.z.object({
    accessToken: zod_1.z.string().min(1),
    refreshToken: zod_1.z.string().min(1),
    tokenType: zod_1.z.literal('Bearer'),
    expiresAtIso: IsoDateSchema,
    user: exports.AuthUserSchema,
});
exports.RefreshInputSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
    correlationId: zod_1.z.string().min(8).max(128),
});
exports.RefreshOutputSchema = zod_1.z.object({
    accessToken: zod_1.z.string().min(1),
    refreshToken: zod_1.z.string().min(1),
    tokenType: zod_1.z.literal('Bearer'),
    expiresAtIso: IsoDateSchema,
});
exports.ValidateAccessTokenInputSchema = zod_1.z.object({
    accessToken: zod_1.z.string().min(1),
    correlationId: zod_1.z.string().min(8).max(128),
});
exports.ValidatedUserSchema = zod_1.z.object({
    user: exports.AuthUserSchema,
});
exports.LogoutInputSchema = zod_1.z.object({
    accessToken: zod_1.z.string().min(1),
    correlationId: zod_1.z.string().min(8).max(128),
});
exports.LogoutOutputSchema = zod_1.z.object({
    revoked: zod_1.z.boolean(),
});
exports.NormalizedAuthProviderUserSchema = zod_1.z.object({
    userId: UuidSchema,
    email: zod_1.z.string().email(),
    displayName: zod_1.z.string().min(1).max(120),
    roles: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    emailVerified: zod_1.z.boolean(),
});
exports.NormalizedAuthProviderTokenSchema = zod_1.z.object({
    accessToken: zod_1.z.string().min(1),
    refreshToken: zod_1.z.string().min(1),
    tokenType: zod_1.z.literal('Bearer'),
    expiresAtIso: IsoDateSchema,
});
