export type WebfingerResult = {
	subject: string
	aliases?: string[]
	links?: Array<{ rel: string; href?: string; type?: string }>
}

export async function resolveWebfinger(handle: string): Promise<WebfingerResult> {
	const normalized = handle.includes('@') ? handle.replace(/^@/, '') : handle
	const [, domain = ''] = normalized.split('@')

	if (!domain) {
		throw new Error(`Invalid WebFinger handle: ${handle}`)
	}

	const resource = `acct:${normalized}`
	const endpoint = `https://${domain}/.well-known/webfinger?resource=${encodeURIComponent(resource)}`
	const response = await fetch(endpoint, {
		headers: {
			Accept: 'application/jrd+json, application/json',
		},
	})

	if (!response.ok) {
		throw new Error(`WebFinger request failed: ${response.status} ${response.statusText}`)
	}

	return response.json()
}
