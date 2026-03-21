import { describe, expect, it } from 'vitest'

import { LoginInputSchema } from './auth/auth.schema'
import { SearchInputSchema } from './search/search.schemas'

describe('contracts schemas', () => {
	it('accepts valid login input payload', () => {
		const parsed = LoginInputSchema.parse({
			email: 'jane@example.com',
			password: 's3cure-passw0rd',
			correlationId: 'corr-12345',
		})

		expect(parsed.email).toBe('jane@example.com')
	})

	it('rejects invalid login password length', () => {
		expect(() =>
			LoginInputSchema.parse({
				email: 'jane@example.com',
				password: 'short',
				correlationId: 'corr-12345',
			}),
		).toThrow()
	})

	it('enforces bounded search page size', () => {
		expect(() =>
			SearchInputSchema.parse({
				query: 'laptop',
				page: 1,
				pageSize: 100,
				correlationId: 'corr-12345',
				actorId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
				filters: [],
				sort: [],
			}),
		).toThrow()
	})
})
