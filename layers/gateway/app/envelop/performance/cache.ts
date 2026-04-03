import { createInMemoryCache, useResponseCache } from "@graphql-yoga/plugin-response-cache";

const cache = createInMemoryCache();

export const useResponseCachePlugin = () =>
  useResponseCache({
    cache,
    session: (request) => request.headers.get("x-session-id") ?? "anonymous",
    ttl: Number(process.env.GQL_RESPONSE_CACHE_TTL ?? 30_000)
  });