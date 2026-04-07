import { CommerceContractError, type CommerceErrorCode } from '../../contracts/commerce/commerce.dto'

const DEFAULT_STATUS_BY_CODE: Record<CommerceErrorCode, number> = {
	COMMERCE_NOT_FOUND: 404,
	COMMERCE_FORBIDDEN: 403,
	COMMERCE_INVALID_INPUT: 400,
	COMMERCE_RATE_LIMITED: 429,
	COMMERCE_TIMEOUT: 504,
	COMMERCE_UPSTREAM_FAILURE: 502,
	COMMERCE_VALIDATION_FAILED: 400,
}

export function toCommerceCapabilityError(
	error: unknown,
	fallbackCode: CommerceErrorCode,
	fallbackMessage: string,
): CommerceContractError {
	if (error instanceof CommerceContractError) {
		return error
	}

	const maybeError = error as { name?: string; message?: string; statusCode?: number }

	if (maybeError?.name === 'ZodError') {
		return new CommerceContractError('COMMERCE_VALIDATION_FAILED', 'Invalid commerce payload', 400)
	}

	if ((maybeError?.message || '').toLowerCase().includes('timed out')) {
		return new CommerceContractError('COMMERCE_TIMEOUT', 'Commerce provider timed out', 504)
	}

	return new CommerceContractError(
		fallbackCode,
		fallbackMessage,
		maybeError?.statusCode || DEFAULT_STATUS_BY_CODE[fallbackCode],
	)
}
