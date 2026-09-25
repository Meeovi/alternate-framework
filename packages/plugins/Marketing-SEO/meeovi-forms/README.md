# @mframework/meeovi-forms

Backend-agnostic, schema-driven forms module for M Framework.

## Features

- JSON Schema + UISchema support
- Field/layout/control components
- Renderer registry (Vuetify + custom renderer keys)
- Validation helpers
- Nuxt module with dynamic API-backed form generation

## Installation

```bash
npm install @mframework/meeovi-forms
```

## Nuxt Module Usage

Register the module in `nuxt.config.ts` with an array of API form configurations:

```ts
export default defineNuxtConfig({
  modules: ['@mframework/meeovi-forms'],

  meeoviForms: {
    apiBase: '/api',
    apis: [
      {
        name: 'contact',
        schema: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', title: 'Full Name' },
            email: { type: 'string', title: 'Email', format: 'email' },
            message: { type: 'string', title: 'Message', format: 'richtext' }
          }
        },
        submitEndpoint: '/contact',
        submitMethod: 'POST'
      },
      {
        name: 'feedback',
        schema: {
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'number', title: 'Rating' },
            comment: { type: 'string', title: 'Comment' }
          }
        },
        submitEndpoint: '/feedback',
        submitMethod: 'POST'
      }
    ]
  }
})
```

### Dynamic Form Component

Render a registered API form by name:

```vue
<template>
  <DynamicApiForm
    api="contact"
    :model-value="initialData"
    @submitted="onSubmitted"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { DynamicApiForm } from '@mframework/meeovi-forms'

function onSubmitted (result: any) {
  console.log('Form submitted:', result)
}

function onError (error: any) {
  console.error('Form error:', error)
}
</script>
```

### Composable Usage

```ts
import { useApiForm } from '@mframework/meeovi-forms'

const { form, submitting, submit, validate } = useApiForm({
  apiName: 'contact',
  initialValue: { name: '', email: '' }
})

async function handleSubmit () {
  const validation = validate()
  if (!validation.valid) return

  const result = await submit()
  console.log(result)
}
```

## Low-Level Usage

For manual schema-driven forms without the API registry:

```ts
import { useJsonForm } from '@mframework/meeovi-forms'

const form = useJsonForm({
  schema: { type: 'object', properties: { title: { type: 'string' } } },
  initialValue: { title: '' }
})

// form.model, form.submit, form.validate, form.reset, form.setValue
```

### Components

All field components are auto-imported when the module is registered:

- `TextField`
- `NumberField`
- `SelectField`
- `DateField`
- `RichTextField`
- `FileUploadField`
- `RepeaterField`
- `JsonFormRenderer`
- `DynamicApiForm`

## Renderer Registry

```ts
import { createDefaultRendererRegistry } from '@mframework/meeovi-forms'

const { renderers, cells } = createDefaultRendererRegistry()
```

## API Config Reference

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Unique identifier for the form |
| `schema` | `JSON Schema` | Form field definitions |
| `uiSchema` | `UISchema` | Optional layout configuration |
| `defaults` | `object` | Default values for fields |
| `submitEndpoint` | `string` | Relative path for form submission |
| `submitMethod` | `POST \| PUT \| PATCH` | HTTP method (default: `POST`) |
