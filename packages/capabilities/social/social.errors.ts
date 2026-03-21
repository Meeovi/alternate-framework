import { SocialContractError, type SocialErrorCode } from '../../contracts/social/social.dto'

const DEFAULT_STATUS_BY_CODE: Record<SocialErrorCode, number> = {
	SOCIAL_NOT_FOUND: 404,
	SOCIAL_FORBIDDEN: 403,
	SOCIAL_INVALID_INPUT: 400,
	SOCIAL_RATE_LIMITED: 429,
	SOCIAL_TIMEOUT: 504,
	SOCIAL_UPSTREAM_FAILURE: 502,
	SOCIAL_VALIDATION_FAILED: 400,
}

export function toSocialCapabilityError(
	error: unknown,
	fallbackCode: SocialErrorCode,
	fallbackMessage: string,
): SocialContractError {
	if (error instanceof SocialContractError) {
		return error
	}

	const maybeError = error as { name?: string; message?: string; statusCode?: number }

	if (maybeError?.name === 'ZodError') {
		return new SocialContractError('SOCIAL_VALIDATION_FAILED', 'Invalid social payload', 400)
	}

	if ((maybeError?.message || '').toLowerCase().includes('timed out')) {
		return new SocialContractError('SOCIAL_TIMEOUT', 'Social provider timed out', 504)
	}

	return new SocialContractError(
		fallbackCode,
		fallbackMessage,
		maybeError?.statusCode || DEFAULT_STATUS_BY_CODE[fallbackCode],
	)
}
