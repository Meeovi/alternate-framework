export class SocialError extends Error {
    provider;
    cause;
    constructor(message, provider, cause) {
        super(message);
        this.provider = provider;
        this.cause = cause;
        this.name = 'SocialError';
    }
}
export class RateLimitError extends SocialError {
    retryAfter;
    constructor(message, provider, retryAfter, cause) {
        super(message, provider, cause);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
