import type { Plugin } from "graphql-yoga";

export const useRequestLoggingPlugin = (): Plugin => ({
  onRequest({ request }) {
    const requestId = request.headers.get("x-request-id") ?? "missing";
    console.log("[gateway] request", {
      requestId,
      method: request.method,
      path: new URL(request.url).pathname
    });
  }
});