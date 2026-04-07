# M Framework Gateway Layer

Gateway layer for Hive and API runtime concerns, including gateway policy, upstream proxying, cache integration, telemetry bootstrap, and a production-oriented adapter-driven scaffold.

## Architecture Modes

This folder currently contains two complementary gateway implementations:

- Nuxt 4 gateway runtime at the layer root.
- Adapter-driven scaffold in `gateway/` based on `COPILOT_INSTRUCTIONS.md`.

## What Is Included

- Hive Gateway runtime configuration via `@graphql-hive/gateway`
- Unified graph handling via `@graphql-hive/router-runtime`
- Automatic persisted queries via `@graphql-yoga/plugin-apq`
- REST facade support via `@graphql-yoga/plugin-sofa`
- GraphQL hardening plugins and request controls
- Structured logging and telemetry hooks
- Retry and cache integration points
- Adapter-driven GraphQL modules and Mesh-style source config
- Codegen and SDK scaffolding for typed client usage

## Key Paths

### Root Runtime (Nuxt Layer)

- `gateway.config.ts`: Hive gateway config, plugin composition, logging, caching, security policies
- `server/logs/telemetry.ts`: OpenTelemetry initialization and context manager setup
- `nuxt.config.ts`: Nuxt layer config
- `app.config.ts`: gateway layer metadata
- `.playground/nuxt.config.ts`: local playground setup

### Adapter-Driven Scaffold (`gateway/`)

- `gateway/mesh.config.ts`: dynamic source registration across adapters
- `gateway/app/index.ts`: HTTP bootstrap
- `gateway/app/server.ts`: Yoga schema and plugin composition
- `gateway/app/context.ts`: request context, JWT user, session
- `gateway/app/adapters/*`: each adapter has `schema.graphql`, `resolvers.ts`, `mesh-source.ts`
- `gateway/app/envelop/security/*`: armor, depth, cost, introspection controls
- `gateway/app/envelop/performance/*`: response cache, APQ
- `gateway/app/envelop/observability/*`: hive/logging hooks
- `gateway/app/envelop/auth/*`: JWT and session handling
- `gateway/app/rest/sofa.ts`: REST mapping from GraphQL
- `gateway/app/generated/*`: generated types and SDK placeholder

## Gateway Runtime Features

- Health endpoint at `/healthcheck`
- Readiness endpoint at `/readiness`
- Upstream GraphQL proxy and composition support
- APQ support for reduced payload size and improved query reuse
- Query hardening controls: depth, token, cost, and directive limits
- Retry strategy for upstream failures
- REST projection from GraphQL via Sofa on `/rest`
- Optional New Relic wiring and OpenTelemetry support

## Security and Integration Rules

- Apps and other layers should consume gateway SDK clients instead of direct backend calls.
- Keep backend-specific logic inside adapters.
- Keep secrets out of source and inject from environment variables.

## Environment

Common variables used across the gateway layer and scaffold:

- `HMAC_SECRET`
- `NUXT_REDIS_URL`
- `NUXT_REDIS_PORT`
- `NUXT_REDIS_PASSWORD`
- `NUXT_PUBLIC_SITE_URL`
- `GRAPHQL_HEADER_AUTH`
- `GATEWAY_PORT`
- `GATEWAY_REQUIRE_JWT`
- `AUTH_GRAPHQL_URL`
- `COMMERCE_GRAPHQL_URL`
- `SEARCH_GRAPHQL_URL`
- `SOCIAL_GRAPHQL_URL`
- `LISTS_GRAPHQL_URL`
- `CHAT_GRAPHQL_URL`
- `SELLER_GRAPHQL_URL`
- `GQL_MAX_DEPTH`
- `GQL_MAX_COST`
- `GQL_ARMOR_MAX_ALIASES`
- `GQL_ARMOR_MAX_TOKENS`
- `GQL_ARMOR_MAX_DIRECTIVES`
- `GQL_RESPONSE_CACHE_TTL`
- `HIVE_DEBUG`

## Development

At layer root:

```bash
npm install
npm run dev
```

For scaffold runtime in `gateway/`:

```bash
cd gateway
npm install
npm run dev
```

This layer can be extended from other Nuxt apps or used via the local `.playground` for iteration.
