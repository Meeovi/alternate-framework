# Roadmap (Next 30-60 Days)

This roadmap focuses on production reliability, adapter interoperability, and contributor usability.

## 0-30 Days

### 1. Adapter Hardening

- Add contract tests that every first-party adapter must pass (`setup`, `index`, `query`, `delete`, optional `deleteWhere`, `stats`).
- Expand query parity tests for filters, sort precedence, facets, and cursor/page behavior.
- Publish adapter capability matrix (facets, highlights, vector support, deleteWhere support).

### 2. Observability Baseline

- Standardize request IDs and timing metadata across adapters.
- Improve debug payload consistency across proxy and multi-backend adapters.
- Add examples for OpenTelemetry + analytics providers in one reference flow.

### 3. Starter Integration Experience

- Add copy-paste starter configs for single backend, multi-backend merge, and cascade failover.
- Provide environment variable templates for common backend combinations.
- Add smoke-test checklist for CI and local validation.

## 31-60 Days

### 1. Federated and Ranking Quality

- Add weighting policy presets for RRF in common commerce/content use cases.
- Add optional deduplication strategy knobs for federated item fusion.
- Benchmark federated query latency and ranking consistency across backends.

### 2. Caching and Warming Maturity

- Add cache invalidation helpers for index writes.
- Add SWR telemetry counters (fresh hit, stale hit, refresh success/failure).
- Add warmup scheduling examples for server startup and cron workflows.

### 3. Documentation and Governance

- Maintain an explicit stable-vs-evolving API map for contributors.
- Add migration notes template for future breaking changes.
- Add release checklist covering docs, contract tests, and starter-template verification.

## Success Criteria

- First-party adapters pass a shared contract suite in CI.
- Starter-template reference integration builds cleanly in release mode.
- Contributors can implement a custom adapter from docs without code archaeology.
- Runtime issues are diagnosable from logs/metrics without exposing backend secrets.