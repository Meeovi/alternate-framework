export interface MeeoviPost {
	id: number
	user_created?: string | null
	date_created?: string | null
	content?: string | null
	file?: string | null
	username?: string | null
	user_avatar?: string | null
	image?: string | null
	title?: string | null
	type?: string | null
	status?: string | null
	audio?: string | null
	slug?: string | null
	author?: string | null
	pinned_post?: boolean | null
	auto_publish?: boolean | null
	mastodon_id?: string | null
	blsky_id?: string | null
	target_audience?: string | null
	visibility_scope?: string | null
	link_preview?: Record<string, unknown> | null
	content_type?: string | null
	views?: number | null
	// relations omitted: arrays and relation objects
}


