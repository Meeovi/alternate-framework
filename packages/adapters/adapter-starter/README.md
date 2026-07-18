# adapter-starter

A minimal Nuxt adapter for MyBackend.

## Features
- GraphQL Mesh v1 schema loader with Prefix transform and webhooks support
- Codegen-generated types
- Domain normalizers
- Nuxt module integration
- Env-based configuration
- `$sdk` auto-merge pattern for frontend consumption

## Structure

```
src/
  module.ts      - Nuxt module definition, pushes public config and registers plugin
  runtime/
    plugin.ts    - Instantiates the adapter and merges it into `nuxtApp.$sdk`
  index.ts       - Adapter class with `content` namespace methods
  env.ts         - Loads environment/config values
```

## `$sdk` merging pattern

This starter follows the same runtime pattern as `adapter-directus` and `adapter-magento`:

1. **Module setup** (`src/module.ts`) pushes merged options into `nuxt.options.runtimeConfig.public.adapterStarter`
2. **Plugin** (`src/runtime/plugin.ts`) reads from `config.public.adapterStarter` and merges the adapter into `nuxtApp.$sdk` via the `app:created` hook
3. **Adapter class** (`src/index.ts`) exposes a `content` namespace with methods like `getItem`, `readItem`, `readItems`, `getItems`, `createItem`, `request`, and `getAssetUrl`

## Usage in a Nuxt app

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['adapter-starter'],
  runtimeConfig: {
    public: {
      adapterStarter: {
        endpoint: process.env.ADAPTER_STARTER_ENDPOINT,
        token: process.env.ADAPTER_STARTER_TOKEN
      }
    }
  }
})
```

```vue
<!-- In a component -->
<script setup>
const { data } = await useAsyncData('product', () =>
  $sdk.content.getItem('products', '1', { fields: ['*'] })
)
</script>
```

## Development

```bash
npm run dev:prepare   # Build module stub and prepare playground
npm run dev           # Start playground dev server
npm run test          # Run tests
```
