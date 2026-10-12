# @mframework/meeovi-integrations

Per-user integrations. Users install integrations from a catalog with an
**Install** button; an installed plugin is switched on **for that user only**.

Every integration plugin is still a Nuxt module in the app's build (there is
one shared build, so nothing is `npm install`ed per user). Installing creates a
per-user record; the plugin checks it and only turns its features on for
users who installed it.

- **Catalog**: Directus `integrations`. An entry is installable when it is
  `published`, free, and its `plugin` field names the plugin package
  (e.g. `@mframework/list-type-kanban`). Paid entries and entries without a
  plugin show as "Coming soon".
- **Installs**: Directus `integration_installs` — `user_id` (better-auth user
  id), `integration` (catalog id), `plugin`, `settings`, `date_created`.
  Written only by this module's API, from the signed-in session.
- Unpublishing an entry, or clearing its `plugin`, switches it off for
  everyone who installed it.

## Setup

```jsonc
// app package.json
"dependencies": {
  "@mframework/meeovi-integrations": "file:../../../packages/plugins/Admin/meeovi-integrations"
}
```

```ts
// nuxt.config.ts
modules: ['@mframework/meeovi-integrations'],

meeoviIntegrations: {
  // all optional
  // apiBase: '/api/integrations',
  // catalogPath: '/dashboard/integrations',  // where the `integration` middleware redirects
  // catalogUrl: 'https://workspace.example.com/dashboard/integrations', // catalog in another app
},
```

Directus URL / token default to `DIRECTUS_URL` / `NUXTUS_DIRECTUS_STATIC_TOKEN`
(override with `MEEOVI_INTEGRATIONS_DIRECTUS_URL` / `_TOKEN`). They stay
server-side. `catalogUrl` can also be set with
`NUXT_PUBLIC_MEEOVI_INTEGRATIONS_CATALOG_URL`.

## Making a plugin installable

1. Add (or link) its catalog entry in Directus `integrations`: set `plugin`
   to the package name, `is_cost` to `free`, `status` to `published`.
2. Gate its features on the user's install:

```vue
<!-- components -->
<IntegrationGate plugin="@mframework/my-plugin">
  <MyFeature />
  <template #fallback>Install My Plugin to use this.</template>
</IntegrationGate>
```

```ts
// composables
const { isInstalled } = useIntegrations()
if (isInstalled('@mframework/my-plugin')) { /* … */ }

// pages only installers may open (others go to the catalog)
definePageMeta({ middleware: 'integration', integration: '@mframework/my-plugin' })

// server routes
import { requireIntegration } from '@mframework/meeovi-integrations/server'
export default defineEventHandler(async (event) => {
  const user = await requireIntegration(event, '@mframework/my-plugin') // 401 / 403
  // …
})
```

Code that may run in apps without this module can check
`useRuntimeConfig().public.meeoviIntegrations?.apiBase` first and call
`GET {apiBase}/installed` itself (see layers/social's list page).

## API

- `GET /api/integrations`: the catalog, each entry with its `state` for the
  signed-in user: `installed`, `available`, `paid` or `coming-soon`.
- `GET /api/integrations/installed`: `{ plugins, integrations }` for the
  signed-in user (empty when signed out).
- `POST /api/integrations/:id/install`: install (401 signed out, 404 unknown,
  409 not installable). Installing twice has no extra effect.
- `DELETE /api/integrations/:id/install`: uninstall, for the signed-in user only.
