# @mframework/meeovi-integrations

Per-user integrations. Users install plugins from the integrations page with
an **Install** button; an installed plugin is switched on **for that user
only**, and whatever they keep in it stays attached to them.

Every integration plugin is still a Nuxt module in the app's build (there is
one shared build, so nothing is `npm install`ed per user). Installing creates a
per-user record; the plugin checks it and only turns its features on for
users who installed it.

## Discoverable plugins

At build time the module scans the plugins folder
(`packages/plugins/<Category>/<plugin>`) and lists every plugin whose
`package.json` declares an integration manifest:

```jsonc
// packages/plugins/CMS-Content/list-type-kanban/package.json
"mframework": {
  "integration": {
    "name": "Kanban board",
    "description": "Show your lists as a drag-and-drop Kanban board.",
    "category": "Productivity",
    "icon": "fas fa-table-columns",
    "admin": false
  }
}
```

- Plugins without a manifest aren't listed: core features and
  infrastructure stay always on.
- **Admin plugins** (`"admin": true`, or anything in the `Admin/` category)
  are only listed for, and installable by, signed-in admins. For everyone
  else the API answers 404, as if they didn't exist.
- A plugin that isn't registered in this app's `modules` shows as
  "Coming soon": installing it here would switch nothing on.

## Integrations are store products

Integrations are sold, or given away, through the commerce backend —
Magento, via adapter-magento — so products, prices, orders and each
seller's sale stay there. A plugin names the SKU that sells it:

```jsonc
"mframework": { "integration": { "name": "Kanban board", "sku": "ACME-KANBAN", ... } }
```

- The manifest is the trust anchor: only that SKU counts, so another seller
  can't list someone else's plugin. The SKU's product (and its Webkul seller)
  lives in Magento; sellers list it there like any product, typically in the
  Integrations category.
- **Free** (price 0): the store's button is **Install**.
- **Paid** (price above 0): **Add to Cart** → the app's Stripe checkout →
  the payment webhook places the order in Magento under the buyer's
  customer account (Webkul credits the seller). The plugin installs for
  users Magento says paid for it (invoiced, not refunded), and for its
  seller. Otherwise install answers `402` and `/installed` leaves it out.
- A plugin that names a SKU Magento doesn't have yet is "Coming soon".
  Plugins without a SKU are first-party and free.
- The store is whatever registers itself as the `IntegrationStore` under
  `Symbol.for('mframework.integrations.store')` (adapter-magento does, see
  `runtime/types.ts`). Without one, SKU plugins can't be installed.
- **Licenses:** an `IntegrationEntitlements` source registered under
  `Symbol.for('mframework.integrations.entitlements')` replaces the store's
  purchase history: a paid plugin is on for users it says are entitled
  (and for its seller). It's also told when a paid plugin is switched on
  or off, and may refuse an install (e.g. an installation limit). The
  meeovi apps register their licensing module (layers/commerce
  `server/plugins/licensing-entitlements.ts`), so a payment issues a
  license and a full refund revokes it.

## The sandbox

User integrations run **sandboxed**: an integration that users can install
must ship its UI as static files in its own folder (`"sandbox":
"sandbox/index.html"` in the manifest). Admin plugins are first-party
infrastructure managed by admins and are exempt (`requireSandbox: false`
turns the requirement off).

What the sandbox enforces:

- **Isolated origin.** The UI runs in `<iframe sandbox="allow-scripts">`, an
  opaque origin: no cookies or session, no localStorage / IndexedDB, no access
  to the page around it. No popups, forms, modals or top-level navigation.
- **Its own files only.** It's served from `/integration-sandbox/<slug>/`
  (only files in its sandbox folder, bundled into the server build) with an
  **enforced** CSP of its own: scripts, styles, images and fonts only from
  that folder; no frames, workers, `eval`, `<base>` or form targets;
  embeddable only by this app.
- **No outside domains.** `connect-src` (fetch, XHR, WebSocket, beacons) is
  `'none'` — not even this app's API — unless the manifest declares hosts:
  `"hosts": ["api.example.com", "*.cdn.example.com"]`. Users see the list
  before installing. Plugin server code uses `integrationFetch()`, which
  refuses any other host (https only, no redirects).
- **A narrow bridge.** The integration talks to the page only through the SDK
  (`<script src="__sdk.js">`, `window.MeeoviSandbox`) over a private
  MessageChannel handed over once: its own per-user data, `ui.notify`, the
  frame's height, and whatever capabilities the embedding page lends it —
  nothing else (e.g. the lists page lends `list.items` / `list.create` /
  `list.update` / `list.remove`, scoped to the list on screen, to list types
  that declare them).
- **No escape.** If the frame navigates away from its sandbox page, the host
  closes the channel and removes it ("tried to leave its sandbox"). The
  browser can't stop that navigation request itself, so treat anything you
  hand an integration as data it could send in a URL — the bridge only hands
  it the user's own data for that plugin and what the page explicitly lends.

```html
<!-- packages/plugins/<Cat>/<plugin>/sandbox/index.html -->
<link rel="stylesheet" href="app.css">
<script src="__sdk.js"></script>
<script src="app.js"></script>
```

```js
// sandbox/app.js
const context = await MeeoviSandbox.ready          // read-only, from the page
const mine = await MeeoviSandbox.data.get()         // this user's data
await MeeoviSandbox.data.update({ theme: 'dark' })
const items = await MeeoviSandbox.call('list.items') // a lent capability
```

```vue
<!-- embedding it -->
<IntegrationFrame plugin="@mframework/my-plugin" :context="{ id }" :capabilities="{ 'thing.read': readThing }" />
```

Inline `<script>` / `style=""` are blocked by the CSP: use files.

## Installs and per-user data

Directus `integration_installs`: one row per user and plugin.

| Field | |
| --- | --- |
| `user_id` | better-auth user id, always taken from the signed-in session |
| `plugin` | plugin package name |
| `status` | `installed` or `uninstalled` |
| `settings` | the user's own data for the plugin (JSON, up to 64 KB) |

Uninstalling sets `status: uninstalled` and **keeps the row**, so the user's
data stays attached to them and comes back when they reinstall. Nobody else
can read or change it: installs are only reachable through this module's
API, which always uses the session user (the shared `/api/cms` proxy denies
the collection).

Plugins that keep data in their own collections should store the owner's
user id on every row, and scope reads and writes with the user that
`requireIntegration()` returns.

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
  // pluginsDir: '../../../packages/plugins',  // default: nearest packages/plugins above the app
  // catalogPath: '/workspace/integration',    // the integrations page; a plugin is <catalogPath>/<slug>
  // catalogUrl: 'https://app.example.com/workspace/integration', // integrations page in another app
},
```

Directus URL / token default to `DIRECTUS_URL` / `NUXTUS_DIRECTUS_STATIC_TOKEN`
(override with `MEEOVI_INTEGRATIONS_DIRECTUS_URL` / `_TOKEN`). They stay
server-side. `catalogUrl` can also be set with
`NUXT_PUBLIC_MEEOVI_INTEGRATIONS_CATALOG_URL`.

The integrations page is layers/business's `/workspace/integration/[...slug]`:
the list at `/workspace/integration`, one plugin at
`/workspace/integration/<slug>` (the package name without its scope, e.g.
`list-type-kanban`).

## Making a plugin installable

1. Add the `mframework.integration` manifest to its package.json, and
   register the plugin in the app's `modules`.
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

// the user's own data for the plugin
const { data, update, save } = useIntegrationData('@mframework/my-plugin')

// pages only installers may open (others go to the plugin's integration page)
definePageMeta({ middleware: 'integration', integration: '@mframework/my-plugin' })

// server routes
import { requireIntegration, getIntegrationData, setIntegrationData } from '@mframework/meeovi-integrations/server'
export default defineEventHandler(async (event) => {
  const user = await requireIntegration(event, '@mframework/my-plugin') // 401 / 403
  const data = await getIntegrationData(event, '@mframework/my-plugin')
  // …
})
```

Code that may run in apps without this module can check
`useRuntimeConfig().public.meeoviIntegrations?.apiBase` first and call
`GET {apiBase}/installed` itself (see layers/social's list page and
meeovi-dropshipping's `requireSeller`).

## API

All writes use the signed-in session's user; a request can't name another user.

- `GET /api/integrations`: everything this user may see, each with its
  `state`: `installed`, `available`, `paid` (not bought yet) or
  `coming-soon`, plus `sku`, `productRef` (`/product/<productRef>`),
  `price` and `purchased`.
- `GET /api/integrations/:slug`: one integration (404 for unknown, or
  admin-only for non-admins).
- `GET /api/integrations/installed`: `{ plugins }` switched on for the
  signed-in user (empty when signed out).
- `POST /api/integrations/:slug/install`: install (401 signed out, 404
  unknown, 402 paid and not bought, 409 not installable). Idempotent; brings back earlier data.
- `DELETE /api/integrations/:slug/install`: uninstall, keeping the data.
- `GET | PUT | PATCH /api/integrations/:slug/data`: the user's own data for an
  installed plugin (read, replace, shallow-merge; 403 when not installed).
- `GET /integration-sandbox/:slug/*`: a sandboxed plugin's UI files.
