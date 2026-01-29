const defaultRetry = {
    retries: 3,
    baseDelayMs: 300,
    maxDelayMs: 5000
};
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function withRetry(fn, opts = {}) {
    const { retries, baseDelayMs, maxDelayMs } = { ...defaultRetry, ...opts };
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        }
        catch (err) {
            attempt++;
            if (attempt > retries)
                throw err;
            const delay = Math.min(baseDelayMs * Math.pow(2, attempt) + Math.random() * 100, maxDelayMs);
            await sleep(delay);
        }
    }
}
