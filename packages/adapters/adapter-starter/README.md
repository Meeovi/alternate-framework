# Adapter Starter

This package is the reference starter for building new adapters with a consistent pattern.

The starter now uses a reusable installer pattern:

- Layer factories live in one map.
- A generic installer wires those factories into the gateway registry.
- New adapters only need to provide transport + layer implementations.

## Adapter Pattern

The core pattern is implemented in these files:

- [index.ts](index.ts)
- [src/patterns.ts](src/patterns.ts)
- [src/transport.ts](src/transport.ts)

`src/patterns.ts` provides:

- `defineAdapterLayerFactories(...)`
- `createAdapterInstaller(createTransport, factories)`

This keeps all adapters structurally similar and avoids custom installer boilerplate per adapter.

## Supported Layers

The starter currently supports these registry-backed layers:

- `auth`
- `commerce`
- `search`

## Create a New Adapter

From [packages/adapters/adapter-starter](packages/adapters/adapter-starter):

```bash
npm run create:interactive
```

Or non-interactive:

```bash
npm run create:interactive -- --name shop --desc "Shop adapter" --layers auth,commerce,search --no-install
```

This scaffolds a new package at:

- `packages/adapters/adapter-shop`

## Implement the New Adapter

After scaffolding, update the generated files:

1. `src/transport.ts`
- Set base URL, auth headers, retry/error handling as needed.

2. `src/auth.ts`, `src/commerce.ts`, `src/search.ts`
- Replace placeholder endpoints with backend-specific calls.
- Keep return types aligned with `alternate-gateway` contracts.

3. `index.ts`
- Ensure only implemented layers are present in `layerFactories`.

4. `package.json`
- Confirm package metadata and dependency versions.

## Build and Verify

Inside the generated adapter package:

```bash
npm install
npm run build
```

## Add Adapter to an App

In your app bootstrap/runtime setup:

```ts
import { installAdapter } from '@mframework/adapter-shop'

installAdapter({
	baseUrl: process.env.SHOP_API_URL!,
	apiKey: process.env.SHOP_API_KEY,
})
```

## CLI Options

- `--name` or `-n`: adapter short name
- `--desc` or `-d`: package description
- `--layers` or `-l`: comma-separated layers from `auth,commerce,search`
- `--dest`: custom destination path
- `--no-install`: skip `npm install` in generated package

## Template Source

The scaffolded files come from:

- [template/index.ts](template/index.ts)
- [template/src/patterns.ts](template/src/patterns.ts)
- [template/src](template/src)

If you improve the pattern, update template files here so future adapters get the improvement automatically.
