# @mframework/ui-forms

Backend-agnostic, schema-driven forms module for M Framework.

## Features
- JSON Schema + UISchema support
- Field/layout/control components
- Renderer registry (Vuetify + custom renderer keys)
- Validation helpers
- Nuxt layer integration

## Usage

```ts
import { useJsonForm, loadSchema, loadUiSchema } from '@mframework/ui-forms'

const schema = await loadSchema('content/article.schema.json')
const uiSchema = await loadUiSchema('content/article.uischema.json')
const form = useJsonForm({ schema, uiSchema, initialValue: {} })
```

For Nuxt layer usage, extend `@mframework/ui-forms/nuxt-layer`.
