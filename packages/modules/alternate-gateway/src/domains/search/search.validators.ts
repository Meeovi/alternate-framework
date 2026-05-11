import type {
	NormalizedSearchProviderResultDTO,
	SearchInputDTO,
	SearchOutputDTO,
} from '../../contracts/search/search.dto'
import {
	NormalizedSearchProviderResultSchema,
	SearchInputSchema,
	SearchOutputSchema,
} from '../../contracts/search/search.schemas'

export function parseSearchInput(input: SearchInputDTO): SearchInputDTO {
	return SearchInputSchema.parse(input)
}

export function parseSearchOutput(output: SearchOutputDTO): SearchOutputDTO {
	return SearchOutputSchema.parse(output)
}

export function parseNormalizedSearchProviderResult(result: NormalizedSearchProviderResultDTO): NormalizedSearchProviderResultDTO {
	return NormalizedSearchProviderResultSchema.parse(result)
}
