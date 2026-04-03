# Changelog

All notable changes to `alternate-search` are documented in this file.

## [Unreleased]

### Added

- Stale-While-Revalidate (SWR) cache flow in caching plugin, including stale response serving with background refresh.
- Cache warming utilities for preloading known high-traffic queries.
- Federated multi-index query path with reciprocal rank fusion (RRF) ranking.
- Progressive federated response API via `queryManyStream` async generator.
- Nuxt streaming integration handler with NDJSON and SSE transports.
- Purge API hooks in Node and Nuxt integrations (`_action=purge`) for explicit cache invalidation.
- Search schema JSON export helpers for index definitions.
- Runtime support for index prefixes, aliases, and virtual indexes.
- Multi-backend circuit breaker support (failure threshold, cooldown, probe requests).
- Primary-to-fallback backend chains for automatic failover.
- Security JWT helper (`createJoseJwtVerifier`) integrated with `security` plugin middleware.
- Field-level masking plugin for role-based result redaction before proxy response.
- `purgeCacheStorage` helper for index/tenant/query/all cache invalidation flows.
- Debug metadata/headers pathway for proxy and server integrations.
- Expanded package-level documentation for bridge interfaces and adapter/plugin stability guarantees.

### Changed

- Improved multi-backend adapter observability and result-source transparency.
- Tightened server-side adapter naming and import compatibility in starter-template integration.
- Clarified adapter contract behavior around pagination, facets, and optional capabilities.

### Fixed

- Resolved duplicate helper symbol conflict in starter-template server utilities that triggered Nuxt auto-import warnings.

### Validation

- Starter-template production build validated successfully after integration updates.
- Existing test coverage for advanced search, plugins, and backend health retained for release confidence.