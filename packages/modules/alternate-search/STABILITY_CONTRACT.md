# Stability Contract: Adapters and Plugins

This document defines API stability guarantees for teams building on top of `alternate-search`.

## Scope

This contract applies to:

- `SearchAdapter` bridge shape and method signatures.
- `SearchPlugin` lifecycle contract and extension points.
- Core query/result payload formats used by adapter and plugin boundaries.

## Semantic Versioning Policy

`alternate-search` follows SemVer.

SemVer is enforced strictly for this package:

1. No breaking API/runtime changes in patch or minor releases.
2. Breaking changes ship only in major releases.
3. Every major breaking change must include migration guidance in release docs.

1. Patch (`x.y.Z`)
- Bug fixes only.
- No breaking type or runtime behavior changes.

2. Minor (`x.Y.z`)
- Backward-compatible additions.
- New optional adapter/plugin capabilities may be introduced.

3. Major (`X.y.z`)
- Breaking changes only.
- Migration guidance is required.

## Stable Surface (Safe to Depend On)

The following are considered stable in minor and patch releases:

1. `SearchAdapter` required methods
- `setup`, `index`, `query`, `delete`.

2. `SearchAdapter` optional methods (if implemented)
- `deleteWhere`, `stats` signatures.

3. Core data contracts
- `SearchQuery` public fields.
- `SearchResult` required fields (`items`, `total`, `page`, `pageSize`).

4. `SearchPlugin` lifecycle hook names
- `init`, `beforeQuery`, `afterQuery`, `onError`, `beforeIndex`, `afterIndex`.

## Evolving Surface (May Change in Minor Releases)

The following may evolve, but changes will remain backward-compatible where possible:

1. Plugin metadata conventions (`ctx.meta` keys).
2. Optional query/result enrichments (`highlights`, facet stats structure expansions, debug metadata).
3. New optional adapter or plugin hooks.
4. Helper utilities and secondary exports outside core contracts.

## Deprecated API Policy

When deprecating stable APIs:

1. Deprecation is announced in changelog and docs.
2. Backward compatibility remains for at least one minor cycle unless a critical security issue requires immediate removal.
3. Replacements are documented with migration examples.

## Adapter Author Compatibility Rules

Adapter implementations should:

1. Keep `setup` idempotent.
2. Preserve normalized pagination semantics.
3. Avoid leaking credentials or backend internals in thrown error messages.
4. Treat unknown optional query fields defensively (ignore safely or map explicitly).

## Plugin Author Compatibility Rules

Plugin implementations should:

1. Avoid mutating unrelated fields in `PipelineContext`.
2. Use namespaced keys inside `ctx.meta`.
3. Fail with typed, actionable errors when rejecting invalid input.
4. Remain no-op safe when optional dependencies are absent.

## Breaking Change Triggers

Any of the following requires a major release:

1. Removing or renaming required adapter methods.
2. Changing hook names or required hook call order semantics.
3. Removing required fields from `SearchQuery` or `SearchResult` contracts.
4. Changing behavior in ways that invalidate existing adapter/plugin implementations.

## Compatibility Promise

If you build a custom adapter or plugin against this contract, your implementation should remain compatible across patch and minor releases without code changes, except where explicitly documented as deprecated or evolving.