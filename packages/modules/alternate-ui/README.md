# alternate-ui

Framework-agnostic UI system for Alternate Framework.

## Structure

- `src/shared-ui/index.ts`: main shared-ui entrypoint
- `src/shared-ui/vuetify/*`: scoped/configurable Vuetify integration
- `src/shared-ui/storefront/*`: Storefront UI exports + scoped variables
- `src/shared-ui/tokens/*`: token entrypoints
- `src/shared-ui/composables/*`: shared composables
- `src/shared-ui/components/*`: framework-agnostic component exports
- `src/components/*`: source Vue UI primitives
- `src/styles/*`: resets and shared styles
- `src/utils/*`: framework-agnostic helpers

## Usage

### Core primitives

```ts
import { createUI, createAlternateUIPlugin } from 'alternate-ui'
import { useTheme } from 'alternate-ui/composables'

const ui = createUI()
const { tokens } = useTheme()
```

```ts
app.use(createAlternateUIPlugin())
```

```ts
import { Button } from 'alternate-ui/shared-ui/components'
import 'alternate-ui/styles.css'
```

### Vuetify wrapper for individual apps

```ts
import { createVuetifyInstance, createVuetifyOptions } from 'alternate-ui/vuetify'

const vuetify = createVuetifyInstance({
	theme: {
		defaultTheme: 'light',
		themes: {
			light: {
				colors: {
					primary: '#0f766e',
				},
			},
		},
	},
})

app.use(vuetify)
```

If an app needs the configuration object before instantiating Vuetify:

```ts
import { createVuetifyOptions } from 'alternate-ui/vuetify'

const vuetifyOptions = createVuetifyOptions({
	icons: {
		defaultSet: 'fa',
	},
})
```

### Storefront UI wrapper for individual apps

```ts
import {
	SfButton,
	createStorefrontScope,
	createStorefrontUIPlugin,
} from 'alternate-ui/storefront'
import 'alternate-ui/storefront/styles.css'

app.use(createStorefrontUIPlugin())

const storefrontRootClass = createStorefrontScope()
```

If you want globally registered Storefront components under an app-specific prefix:

```ts
app.use(createStorefrontUIPlugin({ prefix: 'Shop' }))
```

That registers components like `ShopButton`, `ShopLink`, and `ShopIconChevronDown` while preserving direct named imports such as `SfButton`.

## Independent Validation

Run module-level checks without any app context:

```bash
npm run typecheck
```

## Migration note

The shared layer keeps compatibility wrappers for migrated components, but `packages/modules/alternate-ui` is now the canonical source for reusable UI primitives.
