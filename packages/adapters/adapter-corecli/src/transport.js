export const createTransport = (config) => {
    return {
        async request(method, path, options = {}) {
            try {
                const url = new URL(path, config.baseUrl);
                if (options.query) {
                    Object.entries(options.query).forEach(([key, value]) => {
                        url.searchParams.set(key, String(value));
                    });
                }
                const res = await fetch(url.toString(), {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
                        ...(options.headers || {})
                    },
                    body: options.body ? JSON.stringify(options.body) : undefined
                });
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    return {
                        status: res.status,
                        data: null,
                        error: data?.message || 'Unknown error'
                    };
                }
                return {
                    status: res.status,
                    data
                };
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
