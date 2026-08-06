import { createAuthClient } from "better-auth/vue";
import { useRequestHeaders, useRequestURL } from "nuxt/app";

let cachedClient: ReturnType<typeof createAuthClient> | null = null;

export function useAuth() {
	const isClient = typeof window !== 'undefined';
	if (isClient && cachedClient) {
		return cachedClient;
	}
	const url = useRequestURL();
	const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
	const client = createAuthClient({
		baseURL: url.origin,
		fetchOptions: { headers },
	});
	if (isClient) {
		cachedClient = client;
	}
	return client;
}