// SDK
export * from './sdk/errors'
export * from './sdk/endpoint'
export * from './sdk/request'
export * from './sdk/response'
export * from './sdk/adapter'

// Additional UI types used by page-builder style content.
export interface PageBlock {
	collection?: string | null
	id?: string
	item?: unknown
	hide_block?: boolean | null
}

export interface OsProposal {
	id?: string
	[key: string]: unknown
}

export type BlockType =
	| 'block_hero'
	| 'block_faqs'
	| 'block_richtext'
	| 'block_testimonials'
	| 'block_quote'
	| 'block_cta'
	| 'block_form'
	| 'block_logocloud'
	| 'block_team'
	| 'block_html'
	| 'block_video'
	| 'block_gallery'
	| 'block_steps'
	| 'block_columns'
	| 'block_divider'