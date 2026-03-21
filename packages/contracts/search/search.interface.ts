import type {
	NormalizedSearchProviderResultDTO,
	SearchInputDTO,
	SearchOutputDTO,
} from './search.dto'

export const SEARCH_CONTRACT_INVARIANTS = [
	'Search query text must be sanitized and bounded.',
	'Search pagination must always be bounded.',
	'Search output must always include pagination metadata.',
	'Search capability must enforce ACL before querying adapters.',
	'Search output must not leak provider-specific fields.',
] as const

export interface SearchCapabilityContract {
	search(input: SearchInputDTO): Promise<SearchOutputDTO>
}

export interface SearchAdapterContract {
	readonly providerName: string
	search(input: SearchInputDTO): Promise<NormalizedSearchProviderResultDTO>
}
