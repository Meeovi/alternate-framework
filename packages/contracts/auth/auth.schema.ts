import { z } from 'zod'

const UuidSchema = z.string().uuid()
const IsoDateSchema = z.string().datetime({ offset: true })

export const AuthUserSchema = z.object({
	id: UuidSchema,
	email: z.string().email(),
	displayName: z.string().min(1).max(120),
	roles: z.array(z.string().min(1)).min(1),
	isEmailVerified: z.boolean(),
})

export const LoginInputSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(256),
	correlationId: z.string().min(8).max(128),
})

export const LoginOutputSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
	tokenType: z.literal('Bearer'),
	expiresAtIso: IsoDateSchema,
	user: AuthUserSchema,
})

export const RefreshInputSchema = z.object({
	refreshToken: z.string().min(1),
	correlationId: z.string().min(8).max(128),
})

export const RefreshOutputSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
	tokenType: z.literal('Bearer'),
	expiresAtIso: IsoDateSchema,
})

export const ValidateAccessTokenInputSchema = z.object({
	accessToken: z.string().min(1),
	correlationId: z.string().min(8).max(128),
})

export const ValidatedUserSchema = z.object({
	user: AuthUserSchema,
})

export const LogoutInputSchema = z.object({
	accessToken: z.string().min(1),
	correlationId: z.string().min(8).max(128),
})

export const LogoutOutputSchema = z.object({
	revoked: z.boolean(),
})

export const NormalizedAuthProviderUserSchema = z.object({
	userId: UuidSchema,
	email: z.string().email(),
	displayName: z.string().min(1).max(120),
	roles: z.array(z.string().min(1)).min(1),
	emailVerified: z.boolean(),
})

export const NormalizedAuthProviderTokenSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
	tokenType: z.literal('Bearer'),
	expiresAtIso: IsoDateSchema,
})
