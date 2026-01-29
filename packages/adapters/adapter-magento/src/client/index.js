import { GraphQLClient } from 'graphql-request';
import { getSdk } from './sdk';
// createMagentoClient exposes a GraphQL SDK wrapped with a fetch implementation
// that supports timeout and optional retries. If running in Node, provide a
// `fetchImpl` (for example, node-fetch) when Node runtime lacks a global fetch.
export function createMagentoClient(options) {
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    const wrappedFetch = async (input, init) => {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
        const timeout = options.timeoutMs ? setTimeout(() => controller?.abort(), options.timeoutMs) : undefined;
        try {
            const res = await fetchImpl(input, { ...init, signal: controller?.signal });
            return res;
        }
        finally {
            if (timeout)
                clearTimeout(timeout);
        }
    };
    const client = new GraphQLClient(options.endpoint, {
        headers: options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {},
        fetch: wrappedFetch,
    });
    return getSdk(client);
}
