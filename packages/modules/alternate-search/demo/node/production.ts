import {
	createAnalyticsBridge,
	createCsvAnalyticsProvider,
	createFileAnalyticsProvider,
	createPostHogAnalyticsProvider,
	createRedisCacheStorage,
	createSearch,
	createSegmentAnalyticsProvider,
	caching,
	defineIndex,
	keywordField,
	memoryAdapter,
	numberField,
	security,
	textField,
} from "alternate-search";

type RedisLikeClient = {
	get(key: string): Promise<string | null>;
	set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
	del(...keys: string[]): Promise<unknown>;
	scan?(...args: unknown[]): Promise<unknown>;
	keys?(pattern: string): Promise<string[]>;
};

export function createProductionSearch(redis: RedisLikeClient) {
	const analytics = createAnalyticsBridge([
		createPostHogAnalyticsProvider({ apiKey: process.env.POSTHOG_API_KEY! }),
		createSegmentAnalyticsProvider({ writeKey: process.env.SEGMENT_WRITE_KEY! }),
		createFileAnalyticsProvider({ filePath: "./tmp/search-analytics.jsonl" }),
		createCsvAnalyticsProvider({ filePath: "./tmp/search-analytics.csv" }),
	]);

	return createSearch({
		adapter: memoryAdapter(),
		indexes: {
			products: defineIndex({
				name: "products",
				primaryKey: "id",
				fieldMap: {
					id: keywordField(),
					title: textField({ searchable: true, sortable: true }),
					description: textField({ searchable: true }),
					category: keywordField({ facetable: true }),
					price: numberField({ sortable: true, filterable: true }),
				},
			}),
		},
		plugins: [
			caching({
				ttl: 120_000,
				storage: createRedisCacheStorage(redis, {
					prefix: "alternate-search:proxy:",
				}),
			}),
			security({
				scopeQuery(ctx) {
					const tenantId = String(ctx.meta.tenantId ?? "").trim();
					if (!tenantId) return;
					return { tenantId };
				},
			}),
		],
		analytics: [
			{
				track(event) {
					return analytics.track(event);
				},
			},
		],
	});
}