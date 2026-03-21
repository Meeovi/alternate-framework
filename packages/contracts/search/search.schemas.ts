import { z } from 'zod'

const SEARCH_MAX_QUERY_LENGTH = 200
const SEARCH_MAX_PAGE_SIZE = 50

export const SearchFilterSchema = z.object({
	field: z.string().min(1).max(64),
	value: z.string().min(1).max(200),
})

export const SearchSortSchema = z.object({
	field: z.string().min(1).max(64),
	direction: z.enum(['asc', 'desc']),
})

export const SearchInputSchema = z.object({
	query: z.string().trim().min(1).max(SEARCH_MAX_QUERY_LENGTH),
	page: z.number().int().min(1).max(1000),
	pageSize: z.number().int().min(1).max(SEARCH_MAX_PAGE_SIZE),
	correlationId: z.string().min(8).max(128),
	actorId: z.string().uuid(),
	filters: z.array(SearchFilterSchema).max(10),
	sort: z.array(SearchSortSchema).max(3),
})

export const SearchItemSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1).max(200),
	summary: z.string().min(1).max(500),
	url: z.string().url(),
	score: z.number().min(0),
})

export const SearchPaginationSchema = z.object({
	page: z.number().int().min(1),
	pageSize: z.number().int().min(1).max(SEARCH_MAX_PAGE_SIZE),
	totalResults: z.number().int().min(0),
	totalPages: z.number().int().min(0),
})

export const SearchOutputSchema = z.object({
	items: z.array(SearchItemSchema),
	pagination: SearchPaginationSchema,
})

export const NormalizedSearchProviderResultSchema = z.object({
	items: z.array(SearchItemSchema),
	totalResults: z.number().int().min(0),
})
