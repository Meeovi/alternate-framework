// ---------------------------------------------------------------------------
// Security plugin — API key auth, IP filter, and rate limiting guard
// ---------------------------------------------------------------------------
//
// Acts as a gate-keeper in the `beforeQuery` hook. Throws a structured error
// when the request fails authentication or is rate-limited so that the
// integration layer can return an appropriate HTTP response.
// ---------------------------------------------------------------------------

import type { IndexSchema, PipelineContext, SearchPlugin, SearchQuery } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"security": { creator: typeof security };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RateLimitEntry = {
	windowMs: number;
	maxRequests: number;
};

export type SecurityOptions = {
	/**
	 * Allowed API keys.  Pass the key via `ctx.meta.apiKey` (set by the
	 * integration layer from the `X-Api-Key` header or `?apiKey=` query param).
	 */
	apiKeys?: string[];
	/**
	 * IP allowlist.  Pass the caller IP via `ctx.meta.ip`.
	 */
	allowedIps?: string[];
	/**
	 * IP denylist applied before the allowlist.
	 */
	blockedIps?: string[];
	/**
	 * Per-client (keyed by IP or API key) sliding-window rate limit.
	 */
	rateLimit?: RateLimitEntry;
	/**
	 * Override the default rate-limit client key (apiKey ?? ip ?? "anon").
	 */
	rateLimitKey?: (ctx: PipelineContext) => string;
	/**
	 * Inject additional query constraints after authentication succeeds.
	 * Useful for tenant or permission scoping at the proxy layer.
	 */
	scopeQuery?: (ctx: PipelineContext) => Partial<SearchQuery> | void;
	/**
	 * Called when a request is rejected.  Return true to allow it anyway.
	 */
	onDenied?: (reason: "api-key" | "ip-blocked" | "rate-limit", meta: Record<string, unknown>) => boolean | void;
	/**
	 * Optional JWT verification settings.
	 */
	jwt?: JwtOptions;
};

export type JwtClaims = Record<string, unknown> & {
	sub?: string;
	roles?: string[];
	scope?: string | string[];
};

export type JwtVerifier = (
	token: string,
	ctx: PipelineContext,
) => Promise<JwtClaims | null>;

export type JwtOptions = {
	/** If true, a valid JWT is required for every request. */
	required?: boolean;
	/** Custom token verifier. */
	verify: JwtVerifier;
	/** Extract bearer token from context metadata. */
	tokenExtractor?: (ctx: PipelineContext) => string | undefined;
	/** Where to store verified claims in context metadata. Default: "jwtClaims". */
	metaKey?: string;
};

export const SECURITY_ERROR_CODES = {
	UNAUTHORIZED:   "SECURITY_UNAUTHORIZED",
	FORBIDDEN:      "SECURITY_FORBIDDEN",
	RATE_LIMITED:   "SECURITY_RATE_LIMITED",
	JWT_INVALID:    "SECURITY_JWT_INVALID",
	JWT_REQUIRED:   "SECURITY_JWT_REQUIRED",
} as const;

function defaultJwtTokenExtractor(ctx: PipelineContext): string | undefined {
	const candidate =
		(ctx.meta.bearerToken as string | undefined) ??
		(ctx.meta.jwt as string | undefined) ??
		(ctx.meta.authorization as string | undefined);

	if (!candidate) return undefined;
	if (!candidate.toLowerCase().startsWith("bearer ")) return candidate;
	return candidate.slice(7).trim();
}

export function createJoseJwtVerifier(options: {
	secret: string;
	issuer?: string;
	audience?: string | string[];
}): JwtVerifier {
	const key = new TextEncoder().encode(options.secret);
	return async (token) => {
		const jose = await import("jose");
		const verified = await jose.jwtVerify(token, key, {
			issuer: options.issuer,
			audience: options.audience,
		});
		return verified.payload as JwtClaims;
	};
}

// ---------------------------------------------------------------------------
// Sliding-window counter
// ---------------------------------------------------------------------------

type WindowEntry = { count: number; windowStart: number };

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function security(options: SecurityOptions = {}): SearchPlugin {
	const windows = new Map<string, WindowEntry>();

	function toFilterArray(filters?: SearchQuery["filters"]) {
		if (!filters) return [];
		if (Array.isArray(filters)) return filters;
		return Object.entries(filters).map(([field, value]) => ({
			field,
			operator: "=" as const,
			value,
		}));
	}

	function mergeScopedQuery(
		query: SearchQuery,
		patch: Partial<SearchQuery>,
	): SearchQuery {
		const merged: SearchQuery = { ...query, ...patch };

		if (query.filters && patch.filters) {
			merged.filters = [
				...toFilterArray(query.filters),
				...toFilterArray(patch.filters),
			];
		}

		return merged;
	}

	function checkRateLimit(key: string, limit: RateLimitEntry): boolean {
		const now    = Date.now();
		const entry  = windows.get(key) ?? { count: 0, windowStart: now };
		const elapsed = now - entry.windowStart;

		if (elapsed > limit.windowMs) {
			windows.set(key, { count: 1, windowStart: now });
			return true; // new window — OK
		}
		if (entry.count >= limit.maxRequests) return false; // exceeded
		entry.count++;
		windows.set(key, entry);
		return true;
	}

	function deny(
		reason: "api-key" | "ip-blocked" | "rate-limit",
		meta: Record<string, unknown>,
		code: string,
		message: string,
	): never {
		const override = options.onDenied?.(reason, meta);
		if (override === true) return undefined as never; // not really never, but signals allow
		const err = new Error(message) as Error & { code?: string };
		err.code = code;
		throw err;
	}

	return {
		id: "security",

		init(_indexes: Record<string, IndexSchema>) {},

		async beforeQuery(ctx) {
			const ip     = ctx.meta.ip as string | undefined;
			const apiKey = ctx.meta.apiKey as string | undefined;
			const jwtOptions = options.jwt;

			// 1. IP deny-list
			if (ip && options.blockedIps?.includes(ip)) {
				deny("ip-blocked", ctx.meta, SECURITY_ERROR_CODES.FORBIDDEN, `IP ${ip} is blocked`);
			}

			// 2. IP allow-list
			if (options.allowedIps && ip && !options.allowedIps.includes(ip)) {
				deny("ip-blocked", ctx.meta, SECURITY_ERROR_CODES.FORBIDDEN, `IP ${ip} not in allowlist`);
			}

			// 3. API key validation
			if (options.apiKeys && options.apiKeys.length > 0) {
				if (!apiKey || !options.apiKeys.includes(apiKey)) {
					deny("api-key", ctx.meta, SECURITY_ERROR_CODES.UNAUTHORIZED, "Invalid or missing API key");
				}
			}

			// 4. Rate limiting (key = apiKey ?? ip ?? "anon")
			if (options.rateLimit) {
				const key = options.rateLimitKey?.(ctx) ?? apiKey ?? ip ?? "anon";
				if (!checkRateLimit(key, options.rateLimit)) {
					deny("rate-limit", ctx.meta, SECURITY_ERROR_CODES.RATE_LIMITED, "Rate limit exceeded");
				}
			}

			// 5. JWT verification
			if (jwtOptions) {
				const token = (jwtOptions.tokenExtractor ?? defaultJwtTokenExtractor)(ctx);
				if (!token && jwtOptions.required === true) {
					const err = new Error("Missing JWT bearer token") as Error & { code?: string };
					err.code = SECURITY_ERROR_CODES.JWT_REQUIRED;
					throw err;
				}

				if (token) {
					try {
						const claims = await jwtOptions.verify(token, ctx);
						if (!claims) {
							const err = new Error("JWT verification failed") as Error & { code?: string };
							err.code = SECURITY_ERROR_CODES.JWT_INVALID;
							throw err;
						}

						const key = jwtOptions.metaKey ?? "jwtClaims";
						ctx.meta[key] = claims;

						if (claims.sub && !ctx.query.userId) {
							ctx.query.userId = String(claims.sub);
						}

						if (claims.roles && !ctx.meta.roles) {
							ctx.meta.roles = Array.isArray(claims.roles)
								? claims.roles
								: [claims.roles];
						}
					} catch (error) {
						const err = error instanceof Error ? error : new Error(String(error));
						if (!("code" in err)) {
							(err as Error & { code?: string }).code = SECURITY_ERROR_CODES.JWT_INVALID;
						}
						throw err;
					}
				}
			}

			// 6. Query scoping
			const scopedQuery = options.scopeQuery?.(ctx);
			if (scopedQuery) {
				ctx.query = mergeScopedQuery(ctx.query, scopedQuery);
			}
		},
	};
}
