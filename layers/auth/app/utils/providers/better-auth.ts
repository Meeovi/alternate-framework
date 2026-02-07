// Re-export the adapter-provided BetterAuth provider implementation so the
// layer continues to work while the implementation lives in the adapter
// package.
import * as BetterAuth from '@mframework/adapter-betterauth'
import { registerAuthProvider, getAuthConfig, getFrameworkContext } from '@mframework/adapter-betterauth/'
import type { AuthProvider } from '@mframework/adapter-betterauth/'

// Create a single shared Better Auth client instance
let client: any = null

function resolveClientFactory() {
	return (BetterAuth as any).Client ?? (BetterAuth as any).default ?? BetterAuth
}

function getClient() {
	if (client) return client

	const config = getAuthConfig()
	const ctx = getFrameworkContext()

	const Client = resolveClientFactory()
	client = Client({
		baseURL: config.baseUrl,
		fetch: async (url: string | Request | URL, options: RequestInit = {}) => {
			// Framework‑agnostic request wrapper
			const baseHeaders = ctx.getRequestHeaders?.() || {}

			let optionHeaders: Record<string, string> = {}

			if (options.headers instanceof Headers) {
				options.headers.forEach((value, key) => {
					optionHeaders[key] = value
				})
			} else if (Array.isArray(options.headers)) {
				for (const [k, v] of options.headers) {
					optionHeaders[k] = v
				}
			} else if (typeof options.headers === 'object' && options.headers !== null) {
				optionHeaders = options.headers as Record<string, string>
			}

			const headers = {
				...baseHeaders,
				...optionHeaders
			}

			return fetch(url, { ...options, headers })
		}
	})

	return client
}

const BetterAuthProvider: AuthProvider = {
	async login(credentials) {
		const client = getClient()
		const result = await client.signIn(credentials)

		if (result.error) {
			throw new Error(result.error.message || 'Login failed')
		}

		return result.data
	},

	async logout() {
		const client = getClient()
		await client.signOut()

		const ctx = getFrameworkContext()
		ctx.reloadApp?.()
	},

	async session() {
		const client = getClient()
		const result = await client.session()

		if (result.error) {
			return null
		}

		return result.data
	},

	async register(data) {
		const client = getClient()
		const result = await client.signUp(data)

		if (result.error) {
			throw new Error(result.error.message || 'Registration failed')
		}

		return result.data
	},

	async refresh() {
		const client = getClient()
		const result = await client.refresh()

		if (result.error) {
			throw new Error(result.error.message || 'Session refresh failed')
		}

		return result.data
	}
}

// Prefer the adapter-provided implementation when available. Use a
// synchronous `require` guarded in a try/catch so the layer can work in
// development even when the adapter package isn't published yet.
declare const require: any
try {
	// Try the package root first, then the source path used during development
	const adapterPkg = require('@mframework/adapter-betterauth') || require('@mframework/adapter-betterauth/src/provider')
	const AdapterProvider = adapterPkg?.BetterAuthProvider ?? adapterPkg?.default
	if (AdapterProvider) {
		registerAuthProvider('better-auth', AdapterProvider)
	} else {
		registerAuthProvider('better-auth', BetterAuthProvider)
	}
} catch (e) {
	registerAuthProvider('better-auth', BetterAuthProvider)
}

export default BetterAuthProvider