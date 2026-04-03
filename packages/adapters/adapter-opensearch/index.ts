export * from './src/client'
export * from './src/createIndex'
export * from './src/adapter'

import { createOpenSearchAdapter } from './src/adapter'
import { handleOpenSearchError } from './utils/errors'
import { normalizeOpenSearchResult } from './utils/normalizers'
import type { OpenSearchGatewayAdapterContract, OpenSearchQueryInput, OpenSearchResult } from './types'

export class OpenSearchAdapter implements OpenSearchGatewayAdapterContract {
	async search(input: OpenSearchQueryInput): Promise<OpenSearchResult> {
		try {
			const adapter = createOpenSearchAdapter()
			const result = await adapter.search({
				q: input.query ?? '',
				page: input.page ?? 1,
				pageSize: input.pageSize ?? 10
			} as any)
			return normalizeOpenSearchResult(result)
		} catch (error) {
			handleOpenSearchError(error)
		}
	}
}

export const createGatewayAdapterBindings = () => ({
	search: {
		opensearch: new OpenSearchAdapter()
	}
})