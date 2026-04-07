# alternate-locate

Framework-agnostic i18n auto-detect engine that wraps Nuxt i18n usage while keeping detection and locale utilities portable.

## Features

- Locale auto-detection from query, cookie, headers, browser languages, and optional geo-country mapping.
- Reusable core runtime via `createLocate(...)`.
- Nuxt adapter utilities for plugin setup and locale detector wiring.
- Vue composable (`useLocate`) for framework-agnostic access to locale state and translation function.

## Structure

- `src/createLocate.ts`: runtime creation + detector orchestration.
- `src/detectors/*`: browser/header/cookie/geo detector implementations.
- `src/adapters/nuxt/plugin.ts`: Nuxt adapter helpers.
- `src/adapters/vue/composable.ts`: composable wrapper.
- `src/types/index.ts`: shared types.
- `src/utils/index.ts`: locale parsing and normalization helpers.

## Usage

### Core Runtime

```ts
import { createLocate } from 'alternate-locate'

const locate = createLocate({
  locales: ['en-US', 'es-ES'],
  defaultLocale: 'en-US',
  cookieKey: 'i18n_locale',
  queryKey: 'lang',
  geoToLocale: { US: 'en-US', ES: 'es-ES' },
})

const detection = locate.detect({
  query: { lang: 'es' },
  headers: { 'accept-language': 'en-US,en;q=0.9' },
})
```

### Nuxt Plugin

```ts
import { defineNuxtPlugin } from '#app'
import { createNuxtLocatePlugin } from 'alternate-locate/adapters/nuxt/plugin'

export default defineNuxtPlugin(createNuxtLocatePlugin())
```

### Vue Composable

```ts
import { useLocate } from 'alternate-locate/adapters/vue/composable'

const { t, locale, availableLocales, setLocale } = useLocate()
```
