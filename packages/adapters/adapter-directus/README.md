# @mframework/directus-client

A framework-agnostic, type-safe Directus client with optional bindings for Vue 3, Nuxt 3, and React. Includes schema introspection, auto-form and auto-table generators, validation utilities, and visual-editing / live-preview helpers.

Designed for modular, provider-agnostic platforms like Meeovi, but usable in any Directus-powered project.

## Features

- Framework-agnostic Directus client
- Vue 3 bindings (`useDirectus`, `DirectusVueProvider`)
- React bindings (`useDirectus`, `DirectusReactProvider`)
- Schema introspection
- Auto-form engine
- Auto-table engine
- Validation engine
- Widget registry
- Visual editing utilities
- Live preview utilities
- Fully typed and tree-shakeable

## Installation

```bash
npm install @mframework/directus-client
# or
pnpm add @mframework/directus-client
```

## Package structure

```
src/
  client/
    createClient.ts
  vue/
    DirectusProvider.ts
    useDirectus.ts
  react/
    DirectusProvider.tsx
    useDirectus.ts
  schema/
    types.ts
    introspect.ts
  utils/
    collections.ts
    fields.ts
  generators/
    form-engine.ts
    table-engine.ts
    validation-engine.ts
    widget-registry.ts
  visual-editing.ts
  live-preview.ts
  index.ts
```

## Usage

### 1) Framework-agnostic

```ts
import { createMeeoviDirectusClient } from '@mframework/directus-client';

const directus = createMeeoviDirectusClient('https://your-directus-url.com');

// Example request
const products = await directus.client.request(directus.readItems('products'));
```

### 2) Vue 3

Wrap your app:

```ts
import { DirectusVueProvider, createMeeoviDirectusClient } from '@mframework/directus-client';

const directus = createMeeoviDirectusClient('https://cms.example.com');
```

```vue
<template>
  <DirectusVueProvider :client="directus">
    <App />
  </DirectusVueProvider>
</template>
```

Use inside components:

```ts
import { useDirectus } from '@mframework/directus-client';

const directus = useDirectus();
const items = await directus.client.request(directus.readItems('articles'));
```

### 3) Nuxt 3

Create a plugin:

```ts
// plugins/directus.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';
import { createMeeoviDirectusClient, DirectusVueProvider } from '@mframework/directus-client';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const directus = createMeeoviDirectusClient(config.public.directus.url);

  nuxtApp.provide('directus', directus);
  nuxtApp.vueApp.component('DirectusVueProvider', DirectusVueProvider);
});
```

Use it:

```ts
const { $directus } = useNuxtApp();
const posts = await $directus.client.request($directus.readItems('posts'));
```

### 4) React

Wrap your app:

```tsx
import { DirectusReactProvider, createMeeoviDirectusClient } from '@mframework/directus-client';

const directus = createMeeoviDirectusClient('https://cms.example.com');

export function App() {
  return (
    <DirectusReactProvider client={directus}>
      <YourRoutes />
    </DirectusReactProvider>
  );
}
```

Use inside components:

```tsx
import { useDirectus } from '@mframework/directus-client';
const directus = useDirectus();
const items = await directus.client.request(directus.readItems('products'));
```

## Schema introspection

```ts
import { introspectSchema } from '@mframework/directus-client';

const schema = await introspectSchema(directus.client);
console.log(schema.directus_fields);
```

## Auto-Form Engine

```ts
import { createFormEngine } from '@mframework/directus-client';

const engine = createFormEngine('products', fields, directus);
engine.form.title = 'New Product';
const result = await engine.submit();
```

## Auto-Table Engine

```ts
import { generateTableSchema } from '@mframework/directus-client';
const table = generateTableSchema(fields);
console.log(table);
```

## Validation Engine

```ts
import { validateField } from '@mframework/directus-client';
const error = validateField(field, value);
if (error) console.error(error);
```

## Widget Registry

```ts
import { widgetRegistry } from '@mframework/directus-client';
console.log(widgetRegistry.text.component);
```

## Visual Editing (framework-agnostic)

```ts
import { createVisualEditing } from '@mframework/directus-client';

const visual = createVisualEditing({
  enableVisualEditing: true,
  directusUrl: 'https://cms.example.com',
  query: { 'visual-editing': 'true' },

Note: adapter credentials and endpoints can be centrally configured in your main app's `.env` file. See the repository `.env.example` for recommended variable names.
});

visual.apply({ elements: document.querySelectorAll('[data-editable]') });
```

## Live Preview (framework-agnostic)

```ts
import { createLivePreview } from '@mframework/directus-client';

const preview = createLivePreview({
  query: Object.fromEntries(new URLSearchParams(location.search)),
});

if (preview.enabled) {
  console.log('Preview token:', preview.state.token);
}
```

## TypeScript support

Everything is fully typed: Directus schema, client methods, form/table generators, visual editing, live preview, and framework bindings.

## Build

If you’re working inside a monorepo:

```bash
npm --workspace @mframework/directus-client run build
# or
pnpm --filter @mframework/directus-client build
```

## Contributing

PRs are welcome. This package is designed to be modular, extensible, and framework-agnostic — contributions that improve developer experience or expand framework bindings are encouraged.

## License

MIT © Meeovi