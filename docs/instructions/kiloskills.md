📘 Architecture Migration: Move All Backend Logic to SDK
Nuxt 4 + alternate‑sdk Integration Guide
This document explains the required migration across all Nuxt 4 apps and layers to ensure:

Layers no longer import backend modules (alternate-*)

Layers no longer import backend adapters (adapter-*)

Frontend apps never call backend modules directly

All data access flows through alternate-sdk

The shared layer provides a single SDK plugin

All apps and layers inherit SDK access automatically

This is the new, correct architecture.

1. High‑Level Architecture
Code
Frontend Apps (Nuxt 4)
        ▲
        │ uses
        │
Nuxt Layers (auth, search, commerce, social, lists, etc.)
        ▲
        │ imports ONLY:
        │   import { $sdk } from useNuxtApp()
        │
Shared Layer (global plugin)
        ▲
        │ provides $sdk
        │
alternate-sdk (client API)
        ▲
        │ loads adapters internally
        │
adapter-* (backend bridges)
        ▲
        │ call backend logic
        │
alternate-* backend modules
2. Required Change
❌ Remove from ALL layers and apps:
import { something } from 'alternate-communication'

import { something } from 'alternate-security'

import { something } from 'alternate-search'

import { something } from 'alternate-media'

import { something } from 'alternate-content'

import { something } from 'alternate-notify'

import { something } from 'adapter-directus'

import { something } from 'adapter-meilisearch'

import { something } from 'adapter-magento'

import { something } from 'adapter-s3'

import { something } from 'adapter-google'

These must never appear in:

/layers/*

/shared/*

/nuxt4app/app/*

/components/*

/composables/*

3. The Only Allowed Data Access Pattern
Every app and layer must use:

ts
const { $sdk } = useNuxtApp()
All backend operations must be rewritten to:

sdk.content

sdk.commerce

sdk.media

sdk.search

sdk.notify

sdk.auth

4. Nuxt 4 Directory Structure (Reference)
Code
nuxt4app/
   app/
      components/
      composables/
      pages/
      plugins/
      layouts/
      middleware/
   public/
   nuxt.config.ts
Layers follow the same structure:

Code
layers/
   shared/
      app/
         plugins/
         composables/
         components/
   auth-layer/
   search-layer/
   commerce-layer/
   social-layer/
   lists-layer/
5. Shared Layer: SDK Plugin (Required)
Create:

Code
layers/shared/app/plugins/sdk.ts
ts
import { sdk } from 'alternate-sdk'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      sdk
    }
  }
})
All apps and layers now automatically have:

ts
const { $sdk } = useNuxtApp()
6. SDK Usage Examples
6.1 Content (replaces Directus, Ghost, etc.)
ts
const { $sdk } = useNuxtApp()

const page = await $sdk.content.getItem('pages', 'home', {
  fields: ['*', 'media.*']
})
6.2 Commerce (replaces Magento adapter)
ts
const { $sdk } = useNuxtApp()

const product = await $sdk.commerce.getProduct('123')
const cart = await $sdk.commerce.getCart()
6.3 Media (replaces Directus assets, S3, Cloudflare)
ts
const url = $sdk.media.getAssetUrl(file)
6.4 Search (replaces Meilisearch, Algolia)
ts
const results = await $sdk.search.query('shoes', {
  limit: 20
})
6.5 Notifications (replaces alternate-notify)
ts
const list = await $sdk.notify.list()
await $sdk.notify.markAsRead(id)
6.6 Auth (replaces alternate-auth)
ts
const user = await $sdk.auth.getSession()
await $sdk.auth.login({ email, password })
7. Required Component Migration
Before (invalid)
ts
import { useDirectusUrl } from '#imports'
import { $directus, $readItem } from useNuxtApp()
After (correct)
ts
const { $sdk } = useNuxtApp()
8. Required Composable Migration
Before (invalid)
ts
import { useNotifications } from '#shared/app/composables/globals/useNotify'
After (correct)
ts
import { useSdkNotifications } from '#shared/app/composables/notifications/useSdkNotifications'
9. Required Layer Cleanup
Every layer must:

❌ remove all backend imports

❌ remove all adapter imports

❌ remove all Directus/Magento/Meilisearch logic

✔ use $sdk exclusively

✔ rely on shared layer plugin

10. Summary
Layers → SDK only

SDK → Adapters only

Adapters → alternate- only*

Frontend apps → never touch backend modules

Shared layer provides the SDK plugin

All content/commerce/media/search/notify/auth must use $sdk

Do not change the current structure of any apps or layers!!!!!!!!!!!

This is the final, correct architecture.