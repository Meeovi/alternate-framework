import { describe, expect, it, vi } from 'vitest'

import { SearchCapabilityService } from './search.service'
import type { SearchAdapterContract } from '../../contracts/search/search.interface'

function createSearchAdapter(): SearchAdapterContract {
	return {
		providerName: 'test-search',
		search: vi.fn(async () => ({
			items: [
				{
					id: 'result-1',
					title: 'Result 1',
					summary: 'Summary',
					url: 'https://example.com/r/1',
					score: 1,
				},
			],
			totalResults: 9,
		})),
	}
}

describe('SearchCapabilityService', () => {
	it('rejects wildcard queries before adapter execution', async () => {
		const adapter = createSearchAdapter()
		const service = new SearchCapabilityService(adapter)

		await expect(
			service.search({
				query: 'phone*',
				page: 1,
				pageSize: 5,
				correlationId: 'corr-12345',
				actorId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
				filters: [],
				sort: [],
			}),
		).rejects.toMatchObject({
			name: 'SearchContractError',
			code: 'SEARCH_INVALID_QUERY',
		})

		expect(adapter.search).not.toHaveBeenCalled()
	})

	it('normalizes pagination metadata from provider totals', async () => {
		const adapter = createSearchAdapter()
		const service = new SearchCapabilityService(adapter)

		const output = await service.search({
			query: 'phone',
			page: 2,
			pageSize: 4,
			correlationId: 'corr-12345',
			actorId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
			filters: [],
			sort: [],
		})

		expect(output.pagination.totalPages).toBe(3)
		expect(output.pagination.totalResults).toBe(9)
		expect(output.pagination.page).toBe(2)
	})
})
