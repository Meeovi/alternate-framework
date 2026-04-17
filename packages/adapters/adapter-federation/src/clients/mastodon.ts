import { createRestAPIClient, createStreamingAPIClient, MastoHttpError } from 'masto'
import type { mastodon } from 'masto'

export interface MastodonRestClientOptions {
	url: string
	accessToken: string
}

export interface MastodonStreamingClientOptions {
	streamingApiUrl?: string
	accessToken: string
	webSocketImplementation?: unknown
}

export interface MastodonSessionClientOptions {
	url: string
	accessToken: string
	streamingApiUrl?: string
	enableStreaming?: boolean
	webSocketImplementation?: unknown
}

export function createMastodonRestClient(options: MastodonRestClientOptions) {
	return createRestAPIClient(options)
}

export function createMastodonStreamingClient(options: MastodonStreamingClientOptions) {
	if (!options.streamingApiUrl) {
		return undefined
	}

	return createStreamingAPIClient({
		streamingApiUrl: options.streamingApiUrl,
		accessToken: options.accessToken,
		implementation: options.webSocketImplementation as any,
	})
}

export function createMastodonSessionClients(options: MastodonSessionClientOptions) {
	const client = createMastodonRestClient({
		url: options.url,
		accessToken: options.accessToken,
	})

	const streamingClient = options.enableStreaming
		? createMastodonStreamingClient({
			streamingApiUrl: options.streamingApiUrl,
			accessToken: options.accessToken,
			webSocketImplementation: options.webSocketImplementation,
		})
		: undefined

	return { client, streamingClient }
}

export function normalizeLegacyV1InstanceToV2(newInstance: any): mastodon.v2.Instance {
	return {
		...newInstance,
		domain: newInstance.uri,
		sourceUrl: '',
		usage: {
			users: {
				activeMonth: 0,
			},
		},
		icon: [],
		apiVersions: {
			mastodon: newInstance.version,
		},
		contact: {
			email: newInstance.email,
		},
		configuration: {
			...(newInstance.configuration ?? {}),
			urls: {
				streaming: newInstance.urls.streamingApi,
			},
		},
	} as unknown as mastodon.v2.Instance
}

export function isMastoHttpErrorStatus(error: unknown, statusCode: number) {
	return error instanceof MastoHttpError && error.statusCode === statusCode
}

export { MastoHttpError }
export type { mastodon }
