# What's New in alternate-search

This release focuses on search quality, operational safety, and practical DX for teams running multi-backend search in production.

## Highlights

### Smarter Caching with SWR

Search now supports Stale-While-Revalidate behavior through the caching plugin.

- Fast stale responses when freshness windows expire.
- Background refresh keeps user-facing latency low.
- Better resilience during backend spikes.

### Federated Search with RRF

You can now query multiple indexes and fuse ranked results using reciprocal rank fusion.

- Unified result set across domains.
- Stronger blended relevance than naive concatenation.
- Adjustable fusion behavior via `rrfK` and limits.

### More Flexible Index Routing

Index routing now supports:

- Prefixes for environment isolation.
- Aliases for logical-to-physical remapping.
- Virtual indexes with baseline filters for curated views.

### Better Debugging and Runtime Insight

Proxy and multi-backend paths now carry improved debug and source metadata.

- Clearer backend-origin tracing.
- Easier failure diagnosis for optional backend fallbacks.
- More reliable release-time troubleshooting.

### Schema Export and Bridge Documentation

- JSON schema export helpers are now part of the primary workflow.
- Adapter bridge responsibilities are documented in package-level README.
- Stability contract now clearly defines what is safe to build against.

## Why This Matters

This release reduces the gap between prototype and production by making search behavior:

- Easier to reason about.
- Safer to operate under load.
- Easier to extend with custom adapters and plugins.

## Recommended Upgrade Steps

1. Review `README.md` bridge interface section for adapter expectations.
2. Enable SWR only where stale reads are acceptable.
3. Validate federated ranking defaults against your domain relevance.
4. Adopt index aliases/prefixes before multi-environment rollout.
5. Track behavior with your preferred analytics/telemetry provider.