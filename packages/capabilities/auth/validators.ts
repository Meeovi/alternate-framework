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
	LoginInputSchema,
	LoginOutputSchema,
	LogoutInputSchema,
	LogoutOutputSchema,
	RefreshInputSchema,
	RefreshOutputSchema,
	ValidateAccessTokenInputSchema,
	ValidatedUserSchema,
} from '../../contracts/auth/auth.schema'

export function parseLoginInput(input: LoginInputDTO): LoginInputDTO {
	return LoginInputSchema.parse(input)
}

export function parseLoginOutput(output: LoginOutputDTO): LoginOutputDTO {
	return LoginOutputSchema.parse(output)
}

export function parseRefreshInput(input: RefreshInputDTO): RefreshInputDTO {
	return RefreshInputSchema.parse(input)
}

export function parseRefreshOutput(output: RefreshOutputDTO): RefreshOutputDTO {
	return RefreshOutputSchema.parse(output)
}

export function parseValidateAccessTokenInput(input: ValidateAccessTokenInputDTO): ValidateAccessTokenInputDTO {
	return ValidateAccessTokenInputSchema.parse(input)
}

export function parseValidatedUserOutput(output: ValidatedUserDTO): ValidatedUserDTO {
	return ValidatedUserSchema.parse(output)
}

export function parseLogoutInput(input: LogoutInputDTO): LogoutInputDTO {
	return LogoutInputSchema.parse(input)
}

export function parseLogoutOutput(output: LogoutOutputDTO): LogoutOutputDTO {
	return LogoutOutputSchema.parse(output)
}
