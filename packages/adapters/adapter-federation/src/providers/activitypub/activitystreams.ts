export type ActivityStreamsActor = {
	id: string
	username: string
	displayName: string
	avatarUrl?: string
	url?: string
}

export type ActivityStreamsPost = {
	id: string
	content: string
	createdAt: string
	author: ActivityStreamsActor
	url?: string
}

export function normalizeActivityStreamsActor(actor: any): ActivityStreamsActor {
	if (!actor) {
		return {
			id: '',
			username: '',
			displayName: '',
		}
	}

	const id = String(actor.id ?? actor.url ?? '')

	return {
		id,
		username: String(actor.preferredUsername ?? actor.name ?? id),
		displayName: String(actor.name ?? actor.preferredUsername ?? ''),
		avatarUrl: actor.icon?.url ?? actor.image?.url,
		url: actor.url ?? id,
	}
}

export function normalizeActivityStreamsPost(entry: any): ActivityStreamsPost {
	const object = entry?.object ?? entry
	return {
		id: String(object?.id ?? object?.url ?? ''),
		content: String(object?.content ?? object?.summary ?? ''),
		createdAt: String(object?.published ?? object?.updated ?? new Date().toISOString()),
		author: normalizeActivityStreamsActor(object?.attributedTo ?? entry?.actor ?? object?.author),
		url: object?.url,
	}
}

export function toOrderedItems(payload: any): any[] {
	const orderedItems = payload?.orderedItems ?? payload?.items ?? payload
	return Array.isArray(orderedItems) ? orderedItems : []
}
