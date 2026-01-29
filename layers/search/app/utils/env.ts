let shared: any = null
try {
	// Try to use the centralized shared helper at runtime when available
	// Use require to avoid TypeScript resolving the module at compile-time for this layer project
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	shared = require('../../../shared/app/utils/env')
} catch (e) {
	shared = null
}

export function getEnv(key: string, fallback?: string): string | undefined {
	if (shared && typeof shared.getEnv === 'function') return shared.getEnv(key, fallback)
	if (!key) return fallback
	const direct = process.env[key]
	if (direct !== undefined) return direct
	const publicKey = `NUXT_PUBLIC_${key}`
	if (process.env[publicKey] !== undefined) return process.env[publicKey]
	return fallback
}

export function getEnvBool(key: string, fallback = false): boolean {
	const v = getEnv(key)
	if (v === undefined) return fallback
	const low = String(v).toLowerCase()
	return ['1', 'true', 'yes', 'on'].includes(low)
}

export default { getEnv, getEnvBool }
