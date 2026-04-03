// ---------------------------------------------------------------------------
// Caching plugin — LRU query-result cache with configurable TTL
// ---------------------------------------------------------------------------
//
// Intercepts `beforeQuery`: if a cache hit is found the result is placed on
// `ctx.result` and the adapter is never called.  `afterQuery` stores fresh
// results back into the cache.
//
// Storage is in-process (Map-based LRU) by default; an external
// async store (Redis, Memcached, etc.) can be plugged in via `storage`.
// ---------------------------------------------------------------------------

import type { IndexSchema, PipelineContext, SearchPlugin, SearchQuery, SearchResult } from "../core/types";

// ---------------------------------------------------------------------------
// Module augmentation
// ---------------------------------------------------------------------------

declare module "../core/types" {
	interface SearchPluginRegistry {
		"caching": { creator: typeof caching };
	}
}

export const CACHING_ERROR_CODES = {
	STORAGE_ERROR: "CACHING_STORAGE_ERROR",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CacheStorage = {
	get(key: string): Promise<SearchResult | null> | SearchResult | null;
	getEntry?: (key: string) => Promise<CacheEntryState<SearchResult> | null> | CacheEntryState<SearchResult> | null;
	set(key: string, value: SearchResult, ttlMs: number): Promise<void> | void;
	setEntry?: (key: string, value: SearchResult, options: CacheSetEntryOptions) => Promise<void> | void;
	delete(key: string): Promise<void> | void;
	clear(): Promise<void> | void;
	invalidateByIndex?: (indexName: string) => Promise<number> | number;
	invalidateByTenant?: (tenantId: string) => Promise<number> | number;
	name?: string;
};

export type CacheSetEntryOptions = {
	freshTtlMs: number;
	staleTtlMs?: number;
};

export type CacheEntryState<TValue> = {
	value: TValue;
	fresh: boolean;
	stale: boolean;
	expiresAt: number;
	freshUntil: number;
};

export type CacheEnvelope<TValue> = {
	value: TValue;
	expiresAt: number;
	freshUntil?: number;
};

export type CacheSerializer<TValue> = {
	serialize(value: TValue): string;
	deserialize(value: string): TValue;
};

export type MemoryCacheStorageOptions = {
	maxSize?: number;
};

export type RedisCacheClient = {
	get(key: string): Promise<string | null> | string | null;
	set?: (...args: unknown[]) => Promise<unknown> | unknown;
	setEx?: (key: string, ttlSeconds: number, value: string) => Promise<unknown> | unknown;
	del(...keys: string[]): Promise<unknown> | unknown;
	unlink?(...keys: string[]): Promise<unknown> | unknown;
	sAdd?(key: string, ...values: string[]): Promise<unknown> | unknown;
	sRem?(key: string, ...values: string[]): Promise<unknown> | unknown;
	sMembers?(key: string): Promise<string[]> | string[];
	scan?(...args: unknown[]): Promise<unknown> | unknown;
	keys?(pattern: string): Promise<string[]> | string[];
};

export type RedisCacheStorageOptions = {
	prefix?: string;
	scanCount?: number;
	serializer?: CacheSerializer<CacheEnvelope<SearchResult>>;
	listKeys?: (prefix: string) => Promise<string[]> | string[];
	includeTags?: boolean;
	indexTagPrefix?: string;
	tenantTagPrefix?: string;
};

export type CachingOptions = {
	/** Time-to-live in milliseconds. Default: 60 000 (1 minute). */
	ttl?: number;
	/**
	 * Maximum number of entries for the in-process LRU cache.
	 * Ignored when a custom `storage` is provided. Default: 500.
	 */
	maxSize?: number;
	/** Custom async storage backend (Redis, Memcached, etc.). */
	storage?: CacheStorage;
	/** Build a custom cache key from the index name and query. */
	keyFn?: (indexName: string, query: SearchQuery) => string;
	/**
	 * Per-index fields that bypass caching when present on the query.
	 * @example { products: ["userId"] }
	 */
	bypass?: Record<string, (keyof SearchQuery)[]>;
	/**
	 * Stale-while-revalidate support.
	 * staleTtlMs extends cache retention beyond fresh ttl.
	 */
	swr?: {
		enabled?: boolean;
		staleTtlMs?: number;
	};
	/** Label returned in debug metadata for this cache implementation. */
	cacheName?: string;
};

export type CachePurgeScope = "index" | "tenant" | "query" | "all";

export type CachePurgeRequest = {
	/** Purge mode. Default: "index". */
	scope?: CachePurgeScope;
	/** Required for scope="index" and scope="query" when key is not provided. */
	indexName?: string;
	/** Required for scope="tenant". */
	tenantId?: string;
	/** Required for scope="query" when key is not provided. */
	query?: SearchQuery;
	/** Optional precomputed cache key for scope="query". */
	key?: string;
};

export type CachePurgeResult = {
	scope: CachePurgeScope;
	purged: number | null;
};

export type CachePurgeOptions = {
	/** Must match the plugin key function when custom key generation is used. */
	keyFn?: (indexName: string, query: SearchQuery) => string;
};

// ---------------------------------------------------------------------------
// In-process LRU cache
// ---------------------------------------------------------------------------

class LruCache {
	private map = new Map<string, CacheEnvelope<SearchResult>>();
	constructor(private maxSize: number) {}

	get(key: string): SearchResult | null {
		const entry = this.getEntry(key);
		if (!entry || !entry.fresh) return null;
		return entry.value;
	}

	getEntry(key: string): CacheEntryState<SearchResult> | null {
		const entry = this.map.get(key);
		if (!entry) return null;
		const freshUntil = entry.freshUntil ?? entry.expiresAt;
		if (Date.now() > entry.expiresAt) { this.map.delete(key); return null; }
		this.map.delete(key);
		this.map.set(key, entry);
		const now = Date.now();
		return {
			value: entry.value,
			fresh: now <= freshUntil,
			stale: now > freshUntil && now <= entry.expiresAt,
			expiresAt: entry.expiresAt,
			freshUntil,
		};
	}

	set(key: string, value: SearchResult, ttlMs: number): void {
		this.setEntry(key, value, { freshTtlMs: ttlMs });
	}

	setEntry(key: string, value: SearchResult, options: CacheSetEntryOptions): void {
		if (this.map.size >= this.maxSize) {
			this.map.delete(this.map.keys().next().value as string);
		}
		const now = Date.now();
		const freshUntil = now + options.freshTtlMs;
		const staleTtlMs = options.staleTtlMs ?? options.freshTtlMs;
		this.map.set(key, {
			value,
			freshUntil,
			expiresAt: now + staleTtlMs,
		});
	}

	delete(key: string): void { this.map.delete(key); }
	clear(): void { this.map.clear(); }
}

const jsonCacheSerializer: CacheSerializer<CacheEnvelope<SearchResult>> = {
	serialize(value) {
		return JSON.stringify(value);
	},
	deserialize(value) {
		return JSON.parse(value) as CacheEnvelope<SearchResult>;
	},
};

function namespacedKey(prefix: string, key: string): string {
	return `${prefix}${key}`;
}

type ParsedCacheKey = {
	indexName?: string;
	tenantId?: string;
};

function parseCacheKey(key: string): ParsedCacheKey {
	try {
		const parsed = JSON.parse(key) as {
			indexName?: unknown;
			query?: { tenantId?: unknown };
		};
		return {
			indexName: typeof parsed.indexName === "string" ? parsed.indexName : undefined,
			tenantId: typeof parsed.query?.tenantId === "string" ? parsed.query.tenantId : undefined,
		};
	} catch {
		return {};
	}
}

function stripPrefix(value: string, prefix: string): string {
	return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

async function setRedisValue(
	client: RedisCacheClient,
	key: string,
	value: string,
	ttlMs: number,
): Promise<void> {
	if (client.setEx) {
		await Promise.resolve(client.setEx(key, Math.max(1, Math.ceil(ttlMs / 1000)), value));
		return;
	}

	if (client.set) {
		try {
			await Promise.resolve(client.set(key, value, { PX: ttlMs }));
			return;
		} catch {
			try {
				await Promise.resolve(client.set(key, value, "PX", ttlMs));
				return;
			} catch {
				await Promise.resolve(client.set(key, value));
				return;
			}
		}
	}

	throw new Error("Redis cache storage requires a client with set or setEx support");
}

function normalizeScanResult(result: unknown): { cursor: string; keys: string[] } {
	if (Array.isArray(result)) {
		return {
			cursor: String(result[0] ?? "0"),
			keys: Array.isArray(result[1]) ? result[1].map((key) => String(key)) : [],
		};
	}

	if (typeof result === "object" && result !== null) {
		const candidate = result as { cursor?: unknown; keys?: unknown };
		return {
			cursor: String(candidate.cursor ?? "0"),
			keys: Array.isArray(candidate.keys) ? candidate.keys.map((key) => String(key)) : [],
		};
	}

	return { cursor: "0", keys: [] };
}

async function scanRedisKeys(
	client: RedisCacheClient,
	pattern: string,
	scanCount: number,
): Promise<string[]> {
	if (client.keys) {
		return Promise.resolve(client.keys(pattern));
	}

	if (!client.scan) {
		return [];
	}

	const keys: string[] = [];
	let cursor = "0";

	do {
		let rawResult: unknown;
		try {
			rawResult = await Promise.resolve(client.scan(cursor, { MATCH: pattern, COUNT: scanCount }));
		} catch {
			rawResult = await Promise.resolve(client.scan(cursor, "MATCH", pattern, "COUNT", String(scanCount)));
		}

		const result = normalizeScanResult(rawResult);
		cursor = result.cursor;
		keys.push(...result.keys);
	} while (cursor !== "0");

	return keys;
}

async function deleteRedisKeys(client: RedisCacheClient, keys: string[]): Promise<void> {
	if (keys.length === 0) return;
	const deleter = client.unlink ?? client.del;
	await Promise.resolve(deleter(...keys));
}

async function writeTagEntry(client: RedisCacheClient, tagKey: string, value: string): Promise<void> {
	if (!client.sAdd) return;
	await Promise.resolve(client.sAdd(tagKey, value));
}

async function readTagMembers(client: RedisCacheClient, tagKey: string): Promise<string[]> {
	if (!client.sMembers) return [];
	const result = await Promise.resolve(client.sMembers(tagKey));
	return Array.isArray(result) ? result.map((item) => String(item)) : [];
}

async function removeTagEntry(client: RedisCacheClient, tagKey: string, value: string): Promise<void> {
	if (!client.sRem) return;
	await Promise.resolve(client.sRem(tagKey, value));
}

async function deleteTagKey(client: RedisCacheClient, tagKey: string): Promise<void> {
	await Promise.resolve(client.del(tagKey));
}

function toCacheEntryState<T>(entry: CacheEnvelope<T>): CacheEntryState<T> {
	const freshUntil = entry.freshUntil ?? entry.expiresAt;
	const now = Date.now();
	return {
		value: entry.value,
		fresh: now <= freshUntil,
		stale: now > freshUntil && now <= entry.expiresAt,
		expiresAt: entry.expiresAt,
		freshUntil,
	};
}

export function createMemoryCacheStorage(options: MemoryCacheStorageOptions = {}): CacheStorage {
	const storage = new LruCache(options.maxSize ?? 500) as CacheStorage;
	storage.name = "memory";
	return storage;
}

export function createRedisCacheStorage(
	client: RedisCacheClient,
	options: RedisCacheStorageOptions = {},
): CacheStorage {
	const prefix = options.prefix ?? "alternate-search:cache:";
	const scanCount = options.scanCount ?? 100;
	const serializer = options.serializer ?? jsonCacheSerializer;
	const includeTags = options.includeTags ?? true;
	const indexTagPrefix = options.indexTagPrefix ?? `${prefix}tag:index:`;
	const tenantTagPrefix = options.tenantTagPrefix ?? `${prefix}tag:tenant:`;

	function indexTagKey(indexName: string): string {
		return `${indexTagPrefix}${indexName}`;
	}

	function tenantTagKey(tenantId: string): string {
		return `${tenantTagPrefix}${tenantId}`;
	}

	async function deleteAndCleanup(keys: string[]): Promise<number> {
		if (keys.length === 0) return 0;
		await deleteRedisKeys(client, keys);
		if (!includeTags) return keys.length;

		for (const namespaced of keys) {
			const parsed = parseCacheKey(stripPrefix(namespaced, prefix));
			if (parsed.indexName) {
				await removeTagEntry(client, indexTagKey(parsed.indexName), namespaced);
			}
			if (parsed.tenantId) {
				await removeTagEntry(client, tenantTagKey(parsed.tenantId), namespaced);
			}
		}

		return keys.length;
	}

	async function invalidateBy(
		matcher: (parsed: ParsedCacheKey) => boolean,
		tagKey?: string,
	): Promise<number> {
		if (tagKey && client.sMembers) {
			const tagged = await readTagMembers(client, tagKey);
			const removed = await deleteAndCleanup(tagged);
			await deleteTagKey(client, tagKey);
			return removed;
		}

		const keys = options.listKeys
			? await Promise.resolve(options.listKeys(prefix))
			: await scanRedisKeys(client, `${prefix}*`, scanCount);

		const matched = keys.filter((key) => {
			if (key.startsWith(indexTagPrefix) || key.startsWith(tenantTagPrefix)) return false;
			return matcher(parseCacheKey(stripPrefix(key, prefix)));
		});

		return deleteAndCleanup(matched);
	}

	return {
		name: "redis",

		async get(key) {
			const state = await this.getEntry?.(key);
			if (!state || !state.fresh) return null;
			return state.value;
		},

		async getEntry(key) {
			const namespaced = namespacedKey(prefix, key);
			const raw = await Promise.resolve(client.get(namespaced));
			if (!raw) return null;

			const entry = serializer.deserialize(raw);
			const state = toCacheEntryState(entry);
			if (!state.fresh && !state.stale) {
				await Promise.resolve(client.del(namespaced));
				return null;
			}

			return state;
		},

		async set(key, value, ttlMs) {
			await this.setEntry?.(key, value, { freshTtlMs: ttlMs });
		},

		async setEntry(key, value, entryOptions) {
			const namespaced = namespacedKey(prefix, key);
			const now = Date.now();
			const freshUntil = now + entryOptions.freshTtlMs;
			const staleTtlMs = entryOptions.staleTtlMs ?? entryOptions.freshTtlMs;
			await setRedisValue(
				client,
				namespaced,
				serializer.serialize({
					value,
					freshUntil,
					expiresAt: now + staleTtlMs,
				}),
				staleTtlMs,
			);

			if (includeTags) {
				const parsed = parseCacheKey(key);
				if (parsed.indexName) {
					await writeTagEntry(client, indexTagKey(parsed.indexName), namespaced);
				}
				if (parsed.tenantId) {
					await writeTagEntry(client, tenantTagKey(parsed.tenantId), namespaced);
				}
			}
		},

		async delete(key) {
			const namespaced = namespacedKey(prefix, key);
			await Promise.resolve(client.del(namespaced));

			if (includeTags) {
				const parsed = parseCacheKey(key);
				if (parsed.indexName) {
					await removeTagEntry(client, indexTagKey(parsed.indexName), namespaced);
				}
				if (parsed.tenantId) {
					await removeTagEntry(client, tenantTagKey(parsed.tenantId), namespaced);
				}
			}
		},

		async clear() {
			const keys = options.listKeys
				? await Promise.resolve(options.listKeys(prefix))
				: await scanRedisKeys(client, `${prefix}*`, scanCount);
			await deleteAndCleanup(keys);
		},

		async invalidateByIndex(indexName) {
			return invalidateBy(
				(parsed) => parsed.indexName === indexName,
				includeTags ? indexTagKey(indexName) : undefined,
			);
		},

		async invalidateByTenant(tenantId) {
			return invalidateBy(
				(parsed) => parsed.tenantId === tenantId,
				includeTags ? tenantTagKey(tenantId) : undefined,
			);
		},
	};
}

export async function purgeCacheStorage(
	storage: CacheStorage,
	request: CachePurgeRequest,
	options: CachePurgeOptions = {},
): Promise<CachePurgeResult> {
	const scope = request.scope ?? "index";
	const buildKey = options.keyFn
		?? ((indexName: string, query: SearchQuery) => JSON.stringify({ indexName, query }));

	if (scope === "all") {
		await Promise.resolve(storage.clear());
		return { scope, purged: null };
	}

	if (scope === "tenant") {
		if (!request.tenantId) {
			throw new Error("tenantId is required for tenant cache purge");
		}
		if (!storage.invalidateByTenant) {
			await Promise.resolve(storage.clear());
			return { scope, purged: null };
		}
		const purged = await Promise.resolve(storage.invalidateByTenant(request.tenantId));
		return { scope, purged };
	}

	if (scope === "query") {
		const key = request.key
			?? (request.indexName && request.query
				? buildKey(request.indexName, request.query)
				: null);
		if (!key) {
			throw new Error("query purge requires key or indexName+query");
		}
		await Promise.resolve(storage.delete(key));
		return { scope, purged: 1 };
	}

	if (!request.indexName) {
		throw new Error("indexName is required for index cache purge");
	}

	if (!storage.invalidateByIndex) {
		await Promise.resolve(storage.clear());
		return { scope, purged: null };
	}

	const purged = await Promise.resolve(storage.invalidateByIndex(request.indexName));
	return { scope, purged };
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function caching(options: CachingOptions = {}): SearchPlugin {
	const ttl = options.ttl ?? 60_000;
	const swrEnabled = options.swr?.enabled === true;
	const swrStaleTtlMs = Math.max(ttl, options.swr?.staleTtlMs ?? ttl * 3);
	const bypass = options.bypass ?? {};
	const store: CacheStorage = options.storage ?? createMemoryCacheStorage({ maxSize: options.maxSize ?? 500 });
	const cacheName = options.cacheName ?? store.name ?? "custom";

	function buildKey(indexName: string, query: SearchQuery): string {
		return options.keyFn ? options.keyFn(indexName, query) : JSON.stringify({ indexName, query });
	}

	function shouldBypass(ctx: PipelineContext): boolean {
		const fields = bypass[ctx.indexName] ?? bypass["*"] ?? [];
		return fields.some((f) => ctx.query[f] !== undefined && ctx.query[f] !== null);
	}

	return {
		id: "caching",
		$ERROR_CODES: CACHING_ERROR_CODES,

		init(_indexes: Record<string, IndexSchema>) {},

		async beforeQuery(ctx) {
			if (shouldBypass(ctx)) return;
			try {
				const key = buildKey(ctx.indexName, ctx.query);
				const entry = store.getEntry
					? await Promise.resolve(store.getEntry(key))
					: null;

				if (entry?.fresh || (swrEnabled && entry?.stale)) {
					ctx.result = {
						...entry.value,
						_fromCache: true,
						_cacheStorage: cacheName,
						_cacheStale: entry.stale,
					} as SearchResult;
					ctx.meta.cacheHit = true;
					ctx.meta.cacheStorage = cacheName;
					ctx.meta.cacheStale = entry.stale;
					if (entry.stale && swrEnabled) {
						ctx.meta.cacheRefreshRequired = true;
					}
					return;
				}

				if (!entry) {
					const cached = await Promise.resolve(store.get(key));
					if (cached) {
						ctx.result = {
							...cached,
							_fromCache: true,
							_cacheStorage: cacheName,
							_cacheStale: false,
						} as SearchResult;
						ctx.meta.cacheHit = true;
						ctx.meta.cacheStorage = cacheName;
						ctx.meta.cacheStale = false;
					}
				}
			} catch (err) {
				ctx.meta.cacheError = String(err);
			}
		},

		async afterQuery(ctx) {
			if (ctx.meta.cacheHit || shouldBypass(ctx) || !ctx.result) return;
			try {
				const key = buildKey(ctx.indexName, ctx.query);
				if (swrEnabled && store.setEntry) {
					await Promise.resolve(store.setEntry(key, ctx.result, {
						freshTtlMs: ttl,
						staleTtlMs: swrStaleTtlMs,
					}));
				} else {
					await Promise.resolve(store.set(key, ctx.result, ttl));
				}
			} catch (err) {
				ctx.meta.cacheError = String(err);
			}
		},

		async afterIndex(ctx) {
			try {
				if (store.invalidateByIndex) {
					await Promise.resolve(store.invalidateByIndex(ctx.indexName));
				} else {
					await Promise.resolve(store.clear());
				}
			} catch { /* non-fatal */ }
		},
	};
}
