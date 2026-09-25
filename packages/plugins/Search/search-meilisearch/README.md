# @mframework/search-meilisearch

Meilisearch provider for the M Framework federated search layer (`layers/search`).
Moved out of `layers/search/server/providers/meilisearch.ts` so apps opt in per-app.
Queries fan out alongside the layer's built-in providers (OpenSearch,
Postgres, …) via `/api/search`, and results merge into one list.

## Install

Register by path in the app's `nuxt.config.ts` (the app must also extend
`layers/search`):

```ts
modules: [
  resolve(__dirname, '../../../packages/plugins/Search/search-meilisearch/module.ts'),
],
```

The provider stays **off** until it's configured. Use the env vars below, or
`searchMeilisearch: { … }` in `nuxt.config.ts`:

| Option | Env var | Default |
| --- | --- | --- |
| `host` | `ALTERNATE_SEARCH_MEILISEARCH_HOST` | — |
| `apiKey` | `ALTERNATE_SEARCH_MEILISEARCH_API_KEY` | — |
| `indexUid` | `ALTERNATE_SEARCH_MEILISEARCH_INDEX` | `products` |
| `idField` | `ALTERNATE_SEARCH_MEILISEARCH_ID_FIELD` | `id` |

`enabled` defaults to on when `host` is set. Config is private
(`runtimeConfig.searchProviders.meilisearch`), so `NUXT_SEARCH_PROVIDERS_MEILISEARCH_*`
overrides work at runtime too.

## How it plugs in

A Nitro plugin (`runtime/server/plugin.ts`) adds the provider to the search
layer's registry at server start. The registry is a `Map` on `globalThis`
under `Symbol.for('mframework.search.providers')` (see
`layers/search/server/search/registry.ts`), so this package imports
nothing from the layer. `runtime/server/types.ts` is a type-only copy of
the layer's `SearchProvider` contract. Keep it in sync with the layer.

## Test

```sh
npm test   # vitest; the Meilisearch client is mocked
```
