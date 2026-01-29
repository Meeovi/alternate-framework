import { RateLimitError } from "./errors";
const providerLimits = new Map();
const providerUsage = new Map();
export function setRateLimit(provider, config) {
    providerLimits.set(provider, config);
}
export function checkRateLimit(provider) {
    const limit = providerLimits.get(provider);
    if (!limit)
        return;
    const now = Date.now();
    const usage = providerUsage.get(provider) || {
        count: 0,
        resetAt: now + limit.windowMs
    };
    if (now > usage.resetAt) {
        usage.count = 0;
        usage.resetAt = now + limit.windowMs;
    }
    usage.count++;
    providerUsage.set(provider, usage);
    if (usage.count > limit.maxRequests) {
        throw new RateLimitError(`Meeovi internal rate limit exceeded for provider "${provider}"`, provider, Math.ceil((usage.resetAt - now) / 1000));
    }
}
