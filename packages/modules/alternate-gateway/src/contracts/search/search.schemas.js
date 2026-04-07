"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizedSearchProviderResultSchema = exports.SearchOutputSchema = exports.SearchPaginationSchema = exports.SearchItemSchema = exports.SearchInputSchema = exports.SearchSortSchema = exports.SearchFilterSchema = void 0;
var zod_1 = require("zod");
var SEARCH_MAX_QUERY_LENGTH = 200;
var SEARCH_MAX_PAGE_SIZE = 50;
exports.SearchFilterSchema = zod_1.z.object({
    field: zod_1.z.string().min(1).max(64),
    value: zod_1.z.string().min(1).max(200),
});
exports.SearchSortSchema = zod_1.z.object({
    field: zod_1.z.string().min(1).max(64),
    direction: zod_1.z.enum(['asc', 'desc']),
});
exports.SearchInputSchema = zod_1.z.object({
    query: zod_1.z.string().trim().min(1).max(SEARCH_MAX_QUERY_LENGTH),
    page: zod_1.z.number().int().min(1).max(1000),
    pageSize: zod_1.z.number().int().min(1).max(SEARCH_MAX_PAGE_SIZE),
    correlationId: zod_1.z.string().min(8).max(128),
    actorId: zod_1.z.string().uuid(),
    filters: zod_1.z.array(exports.SearchFilterSchema).max(10),
    sort: zod_1.z.array(exports.SearchSortSchema).max(3),
});
exports.SearchItemSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1).max(200),
    summary: zod_1.z.string().min(1).max(500),
    url: zod_1.z.string().url(),
    score: zod_1.z.number().min(0),
});
exports.SearchPaginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1),
    pageSize: zod_1.z.number().int().min(1).max(SEARCH_MAX_PAGE_SIZE),
    totalResults: zod_1.z.number().int().min(0),
    totalPages: zod_1.z.number().int().min(0),
});
exports.SearchOutputSchema = zod_1.z.object({
    items: zod_1.z.array(exports.SearchItemSchema),
    pagination: exports.SearchPaginationSchema,
});
exports.NormalizedSearchProviderResultSchema = zod_1.z.object({
    items: zod_1.z.array(exports.SearchItemSchema),
    totalResults: zod_1.z.number().int().min(0),
});
