import { createMastodonActivitypubProvider } from './activitypub/masto'
import { resolveWebfinger } from './activitypub/webfinger'
import { createForgeFedIssueCreateActivity } from './activitypub/forgefed'
import { createOStatusProvider } from './ostatus/provider'
import { extractFederationAttachments } from '../media/attachments'
import { createModerationEvent, toActivityPubFlag } from '../moderation/events'
import { decodeSyncCursor, encodeSyncCursor, mergeProtocolTimelines } from '../sync/timeline'

export function createFederationProviders() {
	return {
		activitypub: createMastodonActivitypubProvider(),
		ostatus: createOStatusProvider(),
		webfinger: {
			resolve: resolveWebfinger,
		},
		forgefed: {
			createIssueCreateActivity: createForgeFedIssueCreateActivity,
		},
		media: {
			extractAttachments: extractFederationAttachments,
		},
		moderation: {
			createEvent: createModerationEvent,
			toActivityPubFlag,
		},
		sync: {
			mergeTimelines: mergeProtocolTimelines,
			encodeCursor: encodeSyncCursor,
			decodeCursor: decodeSyncCursor,
		},
	}
}
