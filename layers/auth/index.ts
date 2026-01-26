import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
export * from "./app/composables/useAuth";

// Correct plugin exports
export { inferAdditionalFields, adminClient };

// Vue client creator
export { createAuthClient } from "better-auth/vue";

// Re-export Better Auth core
export * from "better-auth";
export * from "@better-auth/cli";
export * from "@better-auth/oauth-provider";
export * from "@better-auth/passkey";
export * from "@better-auth/scim";
export * from "@better-auth/sso";
export * from "@better-auth/stripe";

// Namespaced export for polar-sh
export * as polarSh from "@polar-sh/better-auth";