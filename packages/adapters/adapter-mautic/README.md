<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# Mautic Adapter

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt 4 module for exposing a Mautic REST API client to frontends.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/adapter-mautic?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- Registers a Mautic client through Nuxt runtime injection
- Exposes `useMautic()` for typed access inside components and composables
- Supports configuring the public Mautic base URL and API path from `nuxt.config.ts`
- Includes helpers for common Mautic resources like contacts, forms, segments, and pages

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxt module add @mframework/adapter-mautic
```

Then configure it in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@mframework/adapter-mautic'],
  mautic: {
    apiBaseUrl: 'https://mautic.example.com',
    apiPath: '/api',
  },
})
```

Use it in your app with:

```ts
const mautic = useMautic()
await mautic.get('/contacts')
await mautic.contacts.list({ search: 'newsletter' })
await mautic.forms.create({ name: 'Signup form' })
```


## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@mframework/adapter-mautic/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@mframework/adapter-mautic

[npm-downloads-src]: https://img.shields.io/npm/dm/@mframework/adapter-mautic.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@mframework/adapter-mautic

[license-src]: https://img.shields.io/npm/l/@mframework/adapter-mautic.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@mframework/adapter-mautic

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
