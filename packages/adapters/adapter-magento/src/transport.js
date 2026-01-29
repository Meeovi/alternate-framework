function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const createStarterTransport = (config) => {
    const fetchImpl = config.fetchImpl ?? globalThis.fetch;
    async function doFetchWithRetries(url, init, retries, retryDelayMs, timeoutMs) {
        let attempt = 0;
        while (true) {
            attempt++;
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
            const signal = controller?.signal;
            const timeout = timeoutMs ? setTimeout(() => controller?.abort(), timeoutMs) : undefined;
            try {
                const res = await fetchImpl(url, { ...init, signal });
                const text = await res.text().catch(() => '');
                let data;
                try {
                    data = text ? JSON.parse(text) : null;
                }
                catch (e) {
                    data = text;
                }
                if (!res.ok) {
                    const error = data?.message || res.statusText || `HTTP ${res.status}`;
                    return { status: res.status, data: null, error };
                }
                return { status: res.status, data };
            }
            catch (err) {
                const isAbort = err && err.name === 'AbortError';
                const shouldRetry = attempt <= retries && (isAbort || err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND');
                if (!shouldRetry) {
                    return { status: 500, data: null, error: err?.message || 'Transport error' };
                }
                await sleep(retryDelayMs);
            }
            finally {
                if (timeout)
                    clearTimeout(timeout);
            }
        }
    }
    return {
        async request(method, path, options = {}) {
            try {
                const url = new URL(path.toString(), config.baseUrl);
                if (options.query) {
                    Object.entries(options.query).forEach(([key, value]) => {
                        url.searchParams.set(key, String(value));
                    });
                }
                const headers = {
                    'Content-Type': 'application/json',
                    ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
                    ...(options.headers || {})
                };
                const init = {
                    method,
                    headers,
                    body: options.body ? JSON.stringify(options.body) : undefined,
                };
                const retries = typeof config.retries === 'number' ? config.retries : 1;
                const retryDelayMs = typeof config.retryDelayMs === 'number' ? config.retryDelayMs : 250;
                return await doFetchWithRetries(url.toString(), init, retries, retryDelayMs, config.timeoutMs);
            }
            catch (err) {
                return {
                    status: 500,
                    data: null,
                    error: err.message || 'Transport error'
                };
            }
        }
    };
};
