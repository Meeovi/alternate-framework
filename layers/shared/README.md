# M Framework Shared Layer (Nuxt 4)

A production-ready, backend-agnostic shared layer providing M Framework UI primitives, localization-ready building blocks, and app-level integrations.

## What is Included

- Vuetify-based UI foundation with Tailwind CSS support
- Font Awesome icon integration
- Image optimization through `@nuxt/image`
- Commerce-ready UI primitives through `@storefront-ui/nuxt`
- VueUse integration for motion and utility composables
- Video.js integration with streaming and plugin support
- ESLint setup for JavaScript, TypeScript, and GraphQL schemas
- Nuxt SEO module suite via `@nuxtjs/seo`
- Security defaults via `nuxt-security`
- Rich-text editor support via `nuxt-tiptap-editor`
- LightGallery-powered interactive media galleries
- Built-in Pinia state management integration
- Built-in Sass support
- Drag-and-drop page builder foundation using GrapesJS

## Key Paths

- `nuxt.config.ts`: shared layer module registration (`@nuxtjs/seo`, `@nuxt/image`, `nuxt-security`, `@pinia/nuxt`, `@vueuse/nuxt`, `vuetify-nuxt-module`, `@storefront-ui/nuxt`, `nuxt-tiptap-editor`)
- `app/components/ui/PageBuilder.vue`: drag-and-drop/page-builder entrypoint (GrapesJS)
- `app/components/media/mediaPlayer.vue`: shared Video.js-based media player
- `app/components/gallery/Gallery.vue`: reusable media gallery component
- `app/components/ui/NavbarTop.vue`: shared top navigation
- `app/components/ui/NavbarBottom.vue`: shared bottom navigation
- `app/components/ui/Footer.vue`: shared footer component
- `app/components/ui/Motionable.vue`: motion-enabled wrapper component
- `app/composables/useCustomFetch.ts`: common fetch wrapper and request behavior
- `app/composables/useContent.ts`: shared content loading composable
- `app/composables/useSearch.ts`: shared search state and query handling
- `app/composables/useAlert.ts`: shared alert/notification helper
- `app/composables/globals/useLoading.ts`: app-wide loading state composable
- `app/composables/globals/useNotifications.ts`: app-wide notifications state composable
- `app/composables/media/useMediaCenter.ts`: media center orchestration
- `app/composables/media/useVideojs.ts`: Video.js setup helpers and integration
- `app/plugins/customFetch.ts`: plugin wiring for shared fetch behavior
- `app/plugins/motion.ts`: VueUse motion plugin setup
- `app/plugins/builder.ts`: builder/page-editor plugin registration
- `app/plugins/ssr-width.ts`: SSR viewport width helper plugin
- `app/types/`: shared type contracts for SDK, navigation, and core entities

## Feature Areas

- UI primitives and layout components (`app/components/ui/*`)
- Media library and playback UI (`app/components/media/*`, `app/components/gallery/*`)
- Heading and content display building blocks (`app/components/heading/*`)
- Shared composables for content, search, alerts, loading, and notifications (`app/composables/*`)
- Adapter/SDK utilities (`app/lib/adapter-loader.ts`, `app/lib/sdk.ts`)
- Media registry and typed media handlers (`app/composables/media/*`)
- Mapper and normalization utilities (`app/composables/mappers/*`)
- Centralized constants and theme options (`app/constants/*`)
- App-level plugins for motion, fetch, builder, and SSR behavior (`app/plugins/*`)
- Typed SDK/core domain models (`app/types/*`)

## Environment

Set these variables in the consuming app:

- `NUXT_PUBLIC_SITE_URL` (example: `http://localhost:3000`)
- `NUXT_PUBLIC_SITE_NAME` (site display name)
- `IMAGE_PROVIDER` (defaults to `netlify` when not set)

## Run

```bash
npm install
npm run dev
```

This layer is backend-agnostic and focused on shared UI/composable capabilities for consuming apps.

Gateway, Hive, and API runtime configuration now lives in the gateway layer.
