export const RestFetcher = {
    async execute(req) {
        try {
            const res = await fetch(req.operation, {
                method: req.options?.method || 'GET',
                headers: req.options?.headers,
                body: req.options?.body ? JSON.stringify(req.options.body) : undefined
            });
            const data = await res.json();
            return { data };
        }
        catch (error) {
            return { error };
        }
    }
};
