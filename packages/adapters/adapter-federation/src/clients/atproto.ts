export interface AtprotoGatewayClientOptions {
	baseUrl?: string
	token?: string
	fetchImpl?: typeof fetch
}

export function createAtprotoGatewayClient(options: AtprotoGatewayClientOptions = {}) {
	const baseUrl = (options.baseUrl ?? process.env.ATPROTO_BASE_URL ?? 'https://public.api.bsky.app').replace(/\/$/, '')
	const authToken = options.token ?? process.env.ATPROTO_TOKEN
	const request = options.fetchImpl ?? fetch

	const atprotoRequest = async (path: string, init?: RequestInit) => {
		const response = await request(`${baseUrl}${path}`, {
			...init,
			headers: {
				'Content-Type': 'application/json',
				...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
				...(init?.headers ?? {}),
			},
		})

		if (!response.ok) {
			throw new Error(`ATProto request failed: ${response.status} ${response.statusText}`)
		}

		return response.json()
	}

	return {
		getProfile: (actor: string) =>
			atprotoRequest(`/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`),
		getAuthorFeed: (actor: string, limit = 20) =>
			atprotoRequest(
				`/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(actor)}&limit=${encodeURIComponent(String(limit))}`,
			),
		createRecord: (repo: string, collection: string, record: Record<string, unknown>) =>
			atprotoRequest('/xrpc/com.atproto.repo.createRecord', {
				method: 'POST',
				body: JSON.stringify({ repo, collection, record }),
			}),
	}
}
