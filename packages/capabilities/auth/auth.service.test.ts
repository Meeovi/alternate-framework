import { describe, expect, it, vi } from 'vitest'

import { AuthCapabilityService } from './auth.service'
import type { AuthAdapterContract } from '../../contracts/auth/auth.interface'

function createAuthAdapter(): AuthAdapterContract {
	return {
		providerName: 'test-auth',
		login: vi.fn(async () => ({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
			tokenType: 'Bearer',
			expiresAtIso: new Date().toISOString(),
			user: {
				userId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
				email: 'jane@example.com',
				displayName: 'Jane',
				roles: ['user'],
				emailVerified: true,
			},
		})),
		refresh: vi.fn(async () => ({
			accessToken: 'next-access-token',
			refreshToken: 'next-refresh-token',
			tokenType: 'Bearer',
			expiresAtIso: new Date().toISOString(),
		})),
		introspectAccessToken: vi.fn(async () => ({
			userId: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
			email: 'jane@example.com',
			displayName: 'Jane',
			roles: ['user'],
			emailVerified: true,
		})),
		revokeAccessToken: vi.fn(async () => ({ revoked: true })),
	}
}

describe('AuthCapabilityService', () => {
	it('maps provider login payload to contract-safe output', async () => {
		const adapter = createAuthAdapter()
		const service = new AuthCapabilityService(adapter)

		const output = await service.login({
			email: 'jane@example.com',
			password: 's3cure-passw0rd',
			correlationId: 'corr-12345',
		})

		expect(output.tokenType).toBe('Bearer')
		expect(output.user).toMatchObject({
			id: '9f1d50e0-9caa-4f9f-b8d2-4128e1efa8a3',
			email: 'jane@example.com',
			displayName: 'Jane',
			roles: ['user'],
			isEmailVerified: true,
		})
		expect(adapter.login).toHaveBeenCalledTimes(1)
	})
})
