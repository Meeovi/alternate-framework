export type SearchErrorCode =
	| 'SEARCH_INVALID_QUERY'
	| 'SEARCH_FORBIDDEN'
	| 'SEARCH_RATE_LIMITED'
	| 'SEARCH_TIMEOUT'
	| 'SEARCH_UPSTREAM_FAILURE'
	| 'SEARCH_VALIDATION_FAILED'

export class SearchContractError extends Error {
	readonly code: SearchErrorCode
	readonly statusCode: number
	readonly details: Record<string, unknown>

	constructor(
		code: SearchErrorCode,
		message: string,
		statusCode: number,
		details: Record<string, unknown> = {},
	) {
		super(message)
		this.name = 'SearchContractError'
		this.code = code
		this.statusCode = statusCode
		this.details = details
	}
}

export interface SearchFilterDTO {
	field: string
	value: string
}

export interface SearchSortDTO {
	field: string
	direction: 'asc' | 'desc'
}

export interface SearchInputDTO {
	query: string
	page: number
	pageSize: number
	correlationId: string
	actorId: string
	filters: SearchFilterDTO[]
	sort: SearchSortDTO[]
}

export interface SearchItemDTO {
	id: string
	title: string
	summary: string
	url: string
	score: number
}

export interface SearchPaginationDTO {
	page: number
	pageSize: number
	totalResults: number
	totalPages: number
}

export interface SearchOutputDTO {
	items: SearchItemDTO[]
	pagination: SearchPaginationDTO
}

export interface NormalizedSearchProviderResultDTO {
	items: SearchItemDTO[]
	totalResults: number
}
