# @mframework/search-algolia

Algolia provider for the M Framework federated search layer (`layers/search`).
Moved out of `layers/search/server/providers/algolia.ts` so apps opt in per-app.
Sorting targets replica indices named `<index>_<field>_<asc|desc>`.
Queries fan out alongside the layer's built-in providers (OpenSearch,
Postgres, …) via `/api/search`, and results merge into one list.

## Install

Register by path in the app's `nuxt.config.ts` (the app must also extend
`layers/search`):

```ts
modules: [
  resolve(__dirname, '../../../packages/plugins/Search/search-algolia/module.ts'),
],
```

The provider stays **off** until it's configured. Use the env vars below, or
`searchAlgolia: { … }` in `nuxt.config.ts`:

| Option | Env var | Default |
| --- | --- | --- |
| `appId` | `ALTERNATE_SEARCH_ALGOLIA_APP_ID` | — |
| `apiKey` | `ALTERNATE_SEARCH_ALGOLIA_API_KEY` | — (a search-only key is enough) |
| `indexName` | `ALTERNATE_SEARCH_ALGOLIA_INDEX` | `products` |

`enabled` defaults to on when `appId` + `apiKey` is set. Config is private
(`runtimeConfig.searchProviders.algolia`), so `NUXT_SEARCH_PROVIDERS_ALGOLIA_*`
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
npm test   # vitest; the Algolia client is mocked
```
