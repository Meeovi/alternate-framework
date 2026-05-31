export * from './src/client'
export * from './src/createIndex'
export * from './src/adapter'

import { createOpenSearchAdapter } from './src/adapter'
import { handleOpenSearchError } from './utils/errors'
import { normalizeOpenSearchResult } from './utils/normalizers'
import type { OpenSearchGatewayAdapterContract, OpenSearchQueryInput, OpenSearchResult } from './types'
import type { OpenSearchAdapterOptions } from './src/adapter'

export interface OpenSearchBindingsOptions extends OpenSearchAdapterOptions {}

export class OpenSearchAdapter implements OpenSearchGatewayAdapterContract {
	private readonly options: OpenSearchAdapterOptions

	constructor(options: OpenSearchAdapterOptions = {}) {
		this.options = options
	}

	async search(input: OpenSearchQueryInput): Promise<OpenSearchResult> {
		try {
			const adapter = createOpenSearchAdapter(this.options)
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

export const createGatewayAdapterBindings = (options: OpenSearchBindingsOptions = {}) => ({
	search: {
		opensearch: new OpenSearchAdapter(options)
	}
})