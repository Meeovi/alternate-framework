import type { Plugin } from "graphql-yoga";
import type { GatewayUser } from "../../context";

type JwtPayload = {
  sub: string;
  email?: string;
  roles?: string[];
};

const parseJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyJwtFromRequest = async (request: Request): Promise<GatewayUser | null> => {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.replace("Bearer ", "").trim();
  const payload = parseJwtPayload(token);

  if (!payload?.sub) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    roles: payload.roles ?? ["user"]
  };
};

export const useJwtAuthPlugin = (): Plugin => ({
  onRequest({ request, endResponse }) {
    if (request.method === "OPTIONS") {
      return;
    }

    const enforceJwt = process.env.GATEWAY_REQUIRE_JWT === "true";

    if (enforceJwt && !request.headers.get("authorization")) {
      endResponse(
        new Response(JSON.stringify({ error: "Missing authorization token" }), {
          status: 401,
          headers: { "content-type": "application/json" }
        })
      );
    }
  }
});