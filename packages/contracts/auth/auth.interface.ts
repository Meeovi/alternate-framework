import type {
	LoginInputDTO,
	LoginOutputDTO,
	LogoutInputDTO,
	LogoutOutputDTO,
	NormalizedAuthProviderTokenDTO,
	NormalizedAuthProviderUserDTO,
	RefreshInputDTO,
	RefreshOutputDTO,
	ValidateAccessTokenInputDTO,
	ValidatedUserDTO,
} from './auth.dto'

export const AUTH_CONTRACT_INVARIANTS = [
	'Access tokens must always be non-empty strings.',
	'Refresh tokens must always be non-empty strings.',
	'User IDs must always be UUID strings.',
	'Token responses must include ISO expiration timestamps.',
	'Capabilities must not expose provider-specific auth payload fields.',
] as const

export interface AuthCapabilityContract {
	login(input: LoginInputDTO): Promise<LoginOutputDTO>
	refresh(input: RefreshInputDTO): Promise<RefreshOutputDTO>
	validateAccessToken(input: ValidateAccessTokenInputDTO): Promise<ValidatedUserDTO>
	logout(input: LogoutInputDTO): Promise<LogoutOutputDTO>
}

export interface AuthAdapterContract {
	readonly providerName: string
	login(input: LoginInputDTO): Promise<NormalizedAuthProviderTokenDTO & { user: NormalizedAuthProviderUserDTO }>
	refresh(input: RefreshInputDTO): Promise<NormalizedAuthProviderTokenDTO>
	introspectAccessToken(input: ValidateAccessTokenInputDTO): Promise<NormalizedAuthProviderUserDTO>
	revokeAccessToken(input: LogoutInputDTO): Promise<{ revoked: boolean }>
}
