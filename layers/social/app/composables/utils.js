// utils.ts
import { RateLimitError, SocialError } from './errors';
import { getSocialCache } from './cache';
import { withRetry } from './retry';
import { scheduleBackgroundRefresh } from './swr';
import { checkRateLimit } from './rateLimit';
import { recordRequest, recordSuccess, recordFailure, recordCacheHit, recordCacheMiss } from './metrics';
/**
 * Core wrapper for all provider requests.
 * Handles:
 * - caching
 * - SWR background refresh
 * - retry/backoff
 * - provider-specific rate limits
 * - unified error handling
 * - analytics hooks
 */
export async function wrapSocialRequest(provider, fn, opts = {}) {
    const cache = getSocialCache();
    // Track request attempt
    recordRequest(provider);
    // Provider-specific rate limit enforcement
    checkRateLimit(provider);
    // 1. Cache check
    if (opts.cacheKey) {
        const cached = cache.get(opts.cacheKey);
        if (cached) {
            recordCacheHit(provider);
            // SWR: return cached immediately, refresh in background
            if (opts.swr && opts.ttlMs) {
                scheduleBackgroundRefresh(opts.cacheKey, fn, opts.ttlMs);
            }
            return cached;
        }
        recordCacheMiss(provider);
    }
    // 2. Execute request (with optional retry/backoff)
    let result;
    try {
        result = await (opts.retry ? withRetry(fn) : fn());
        recordSuccess(provider);
    }
    catch (err) {
        recordFailure(provider);
        const status = err?.status || err?.response?.status;
        const retryAfterHeader = err?.response?.headers?.['retry-after'];
        const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
        if (status === 429) {
            throw new RateLimitError(`Rate limit exceeded for provider "${provider}"`, provider, retryAfter, err);
        }
        throw new SocialError(`Social provider "${provider}" request failed`, provider, err);
    }
    // 3. Cache fresh result
    if (opts.cacheKey && opts.ttlMs) {
        cache.set(opts.cacheKey, result, opts.ttlMs);
    }
    return result;
}
