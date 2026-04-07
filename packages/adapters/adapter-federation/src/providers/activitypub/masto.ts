import { getActivitypubClient } from '../../runtime/client'
import { normalizeActivityStreamsActor, normalizeActivityStreamsPost, toOrderedItems } from './activitystreams'

export function createMastodonActivitypubProvider() {
	return {
		async getProfile(handle: string) {
			const client = getActivitypubClient()
			if (!client) {
				throw new Error('ActivityPub client not initialized')
			}

			const actor = await client(`/users/${encodeURIComponent(handle)}`)
			return normalizeActivityStreamsActor(actor)
		},

		async getOutbox(handle: string, limit = 20) {
			const client = getActivitypubClient()
			if (!client) {
				throw new Error('ActivityPub client not initialized')
			}

			const outbox = await client(`/users/${encodeURIComponent(handle)}/outbox`)
			return toOrderedItems(outbox).slice(0, limit).map(normalizeActivityStreamsPost)
		},
	}
}
