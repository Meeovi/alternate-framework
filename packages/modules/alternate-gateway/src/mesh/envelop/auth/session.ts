import type { Plugin } from "graphql-yoga";
import type { GatewaySession } from "../../context";

export const buildSession = (request: Request, requestId: string): GatewaySession => ({
  id: request.headers.get("x-session-id") ?? requestId,
  issuedAt: Date.now()
});

export const useSessionPlugin = (): Plugin => ({
  onContextBuilding({ extendContext }: any) {
    extendContext({
      sessionInjectedAt: new Date().toISOString()
    });
  }
});