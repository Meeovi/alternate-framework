import { AuthContractError, type AuthErrorCode } from '../../contracts/auth/auth.dto'

const DEFAULT_STATUS_BY_CODE: Record<AuthErrorCode, number> = {
	AUTH_INVALID_CREDENTIALS: 401,
	AUTH_INVALID_TOKEN: 401,
	AUTH_EXPIRED_TOKEN: 401,
	AUTH_FORBIDDEN: 403,
	AUTH_RATE_LIMITED: 429,
	AUTH_TIMEOUT: 504,
	AUTH_UPSTREAM_FAILURE: 502,
	AUTH_VALIDATION_FAILED: 400,
}

export function toAuthCapabilityError(
	error: unknown,
	fallbackCode: AuthErrorCode,
	fallbackMessage: string,
): AuthContractError {
	if (error instanceof AuthContractError) {
		return error
	}

	const maybeError = error as { name?: string; message?: string; code?: string; statusCode?: number }

	if (maybeError?.name === 'ZodError') {
		return new AuthContractError('AUTH_VALIDATION_FAILED', 'Invalid auth payload', 400)
	}

	if (maybeError?.code === 'ETIMEDOUT' || maybeError?.code === 'ABORT_ERR') {
		return new AuthContractError('AUTH_TIMEOUT', 'Auth provider timed out', 504)
	}

	if (fallbackCode === 'AUTH_INVALID_CREDENTIALS') {
		return new AuthContractError(
			fallbackCode,
			'Invalid credentials',
			DEFAULT_STATUS_BY_CODE[fallbackCode],
		)
	}

	return new AuthContractError(
		fallbackCode,
		fallbackMessage,
		maybeError?.statusCode || DEFAULT_STATUS_BY_CODE[fallbackCode],
	)
}
