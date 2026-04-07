export * from './src/index'

import { activityPubGatewayClient, atprotoGatewayClient } from './utils/client'
import { handleFederationError } from './utils/errors'
import { normalizeActivityPubPost, normalizeAtprotoPost } from './utils/normalizers'
import type {
	FederationGatewayAdapterContract,
	FediverseLayerAccess,
	FediversePost,
	FediversePublishInput
} from './types'
import { createForgeFedIssueCreateActivity } from './src/providers/activitypub/forgefed'
import { createOStatusPost } from './src/providers/ostatus/provider'

export class FederationAdapter implements FederationGatewayAdapterContract {
	async getActivityPubInbox(actor: string): Promise<unknown> {
		try {
			return await activityPubGatewayClient(`/actors/${encodeURIComponent(actor)}/inbox`)
		} catch (error) {
			return handleFederationError(error)
		}
	}

	async getActivityPubOutbox(actor: string, limit = 20): Promise<FediversePost[]> {
		try {
			const outbox = await activityPubGatewayClient(`/actors/${encodeURIComponent(actor)}/outbox`)
			const items = outbox?.orderedItems ?? outbox?.items ?? []
			return (Array.isArray(items) ? items : []).slice(0, limit).map((entry: unknown) =>
				normalizeActivityPubPost(entry)
			)
		} catch (error) {
			return handleFederationError(error)
		}
	}

	async getAtprotoProfile(handle: string): Promise<unknown | null> {
		try {
			return await atprotoGatewayClient.getProfile(handle)
		} catch (error) {
			return handleFederationError(error)
		}
	}

	async getAtprotoFeed(actor: string, limit = 20): Promise<FediversePost[]> {
		try {
			const feed = await atprotoGatewayClient.getAuthorFeed(actor, limit)
			const items = feed?.feed ?? []
			return (Array.isArray(items) ? items : []).slice(0, limit).map((entry: unknown) =>
				normalizeAtprotoPost(entry)
			)
		} catch (error) {
			return handleFederationError(error)
		}
	}

	async getUnifiedFeed(identity: string, limit = 20): Promise<FediversePost[]> {
		try {
			const [activityPubPosts, atprotoPosts] = await Promise.all([
				this.getActivityPubOutbox(identity, limit),
				this.getAtprotoFeed(identity, limit)
			])

			return [...activityPubPosts, ...atprotoPosts]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, limit)
		} catch (error) {
			return handleFederationError(error)
		}
	}

	async publish(input: FediversePublishInput): Promise<unknown> {
		try {
			if (input.protocol === 'activitypub') {
				return await activityPubGatewayClient('/outbox', {
					method: 'POST',
					body: {
						type: 'Create',
						object: {
							type: 'Note',
							content: input.content
						}
					}
				})
			}

			if (input.protocol === 'ostatus') {
				const author = input.actor ?? String(input.metadata?.author ?? 'unknown')
				const id = String(input.metadata?.id ?? `ostatus:${Date.now()}`)
				const url = typeof input.metadata?.url === 'string' ? input.metadata.url : undefined
				const createdAt = typeof input.metadata?.createdAt === 'string' ? input.metadata.createdAt : undefined
				return createOStatusPost({
					id,
					author,
					content: input.content,
					url,
					createdAt
				})
			}

			if (input.protocol === 'forgefed') {
				const actor = input.actor ?? String(input.metadata?.actor ?? '')
				const repository = String(input.metadata?.repository ?? process.env.FORGEFED_REPOSITORY ?? '')
				if (!actor || !repository) {
					throw new Error('forgefed publishing requires actor and repository metadata')
				}
				return createForgeFedIssueCreateActivity({
					actor,
					repository,
					title: String(input.metadata?.title ?? input.content.slice(0, 120)),
					body: input.content
				})
			}

			const repo = input.actor ?? (typeof input.metadata?.repo === 'string' ? input.metadata.repo : undefined) ?? process.env.ATPROTO_REPO
			if (!repo) {
				throw new Error('ATPROTO_REPO or publish input.actor/input.metadata.repo is required for atproto publishing')
			}

			return await atprotoGatewayClient.createRecord(repo, 'app.bsky.feed.post', {
				$type: 'app.bsky.feed.post',
				text: input.content,
				createdAt: new Date().toISOString()
			})
		} catch (error) {
			return handleFederationError(error)
		}
	}

	async fanoutToLayers(payload: unknown): Promise<{ payload: unknown; layers: FediverseLayerAccess }> {
		return {
			payload,
			layers: {
				social: { federation: true },
				chat: { federation: true },
				lists: { federation: true },
				search: { federation: true },
				content: { federation: true }
			}
		}
	}
}

export const createGatewayAdapterBindings = () => {
	const federation = new FederationAdapter()
	return {
		federation: {
			fediverse: federation
		},
		social: {
			fediverse: federation
		},
		chat: {
			fediverse: federation
		},
		lists: {
			fediverse: federation
		},
		search: {
			fediverse: federation
		},
		content: {
			fediverse: federation
		}
	}
}
