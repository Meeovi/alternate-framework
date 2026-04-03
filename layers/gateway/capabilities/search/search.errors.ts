import { SearchContractError, type SearchErrorCode } from '../../contracts/search/search.dto'

const DEFAULT_STATUS_BY_CODE: Record<SearchErrorCode, number> = {
	SEARCH_INVALID_QUERY: 400,
	SEARCH_FORBIDDEN: 403,
	SEARCH_RATE_LIMITED: 429,
	SEARCH_TIMEOUT: 504,
	SEARCH_UPSTREAM_FAILURE: 502,
	SEARCH_VALIDATION_FAILED: 400,
}

export function toSearchCapabilityError(
	error: unknown,
	fallbackCode: SearchErrorCode,
	fallbackMessage: string,
): SearchContractError {
	if (error instanceof SearchContractError) {
		return error
	}

	const maybeError = error as { name?: string; message?: string; code?: string; statusCode?: number }

	if (maybeError?.name === 'ZodError') {
		return new SearchContractError('SEARCH_VALIDATION_FAILED', 'Invalid search payload', 400)
	}

	if ((maybeError?.message || '').toLowerCase().includes('timed out')) {
		return new SearchContractError('SEARCH_TIMEOUT', 'Search provider timed out', 504)
	}

	return new SearchContractError(
		fallbackCode,
		fallbackMessage,
		maybeError?.statusCode || DEFAULT_STATUS_BY_CODE[fallbackCode],
	)
}
