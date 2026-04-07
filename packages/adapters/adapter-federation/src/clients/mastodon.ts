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

export function isMastoHttpErrorStatus(error: unknown, statusCode: number) {
	return error instanceof MastoHttpError && error.statusCode === statusCode
}

export { MastoHttpError }
export type { mastodon }
