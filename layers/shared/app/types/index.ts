import { Page as GrapesJsPage } from 'grapesjs'

// Core
export * from './core/result'
export * from './core/utility'
export * from './core/pagination'
export * from './core/id'
export type { Maybe } from './core/common'
export * from './core/error'

// Navigation
export * from './navigation'
export type { Page } from './navigation'

// SDK
export * from './sdk/errors'
export * from './sdk/endpoint'
export * from './sdk/request'
export * from './sdk/response'
export * from './sdk/adapter'

// Compatibility exports (legacy names expected by existing packages)
export type SearchResultGeneric<T = unknown> = { items: T[]; total: number }
export type { Result } from './core/result'
export type { Result as SearchResult } from './core/result'
export type { Maybe as Optional } from './core/common'
export type { Result as ApiResult } from './core/result'
export type { Result as ServiceResult } from './core/result'

// Additional UI types - placeholders for types that may be defined elsewhere
export interface PageBlock {
	collection?: string | null
	id?: string
	item?: any
	hide_block?: boolean | null
}

export interface OsProposal {
	id?: string
	[key: string]: any
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

