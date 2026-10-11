# @mframework/meeovi-tables

Dynamic data tables for M Framework apps: a [SVAR Vue DataGrid](https://svar.dev/vue/datagrid/)
over whatever data the app has.

- **Sources** — every installed `adapter-*` that registers a commerce backend in
  alternate-sdk (e.g. `adapter-magento` → `products`, `orders`) is used
  automatically, first. **Directus is the fallback** when no adapter serves a
  collection, or when the adapter fails (`auto` mode).
- **Schema** — columns come from the collection's **Directus field
  definitions** (types, select choices, hidden fields), for adapter rows too:
  adapters return Directus-shaped rows. Without a Directus schema, columns are
  derived from the rows.
- Paging, sorting and search run on the server.

## Setup

It's a Nuxt module installed as a package and registered by name.

```jsonc
// app package.json — Vercel installs each app's own dependencies
"dependencies": {
  "@mframework/meeovi-tables": "file:../../../packages/plugins/Marketing-SEO/meeovi-tables"
}
```

```ts
// nuxt.config.ts
modules: ['@mframework/meeovi-tables'],

meeoviTables: {
  collections: {
    // Only listed collections are readable; anything else is a 404.
    products: {
      label: 'Products',
      roles: ['admin', 'seller'],          // better-auth roles; omit for any signed-in user
      // access: 'public',                  // allow guests (only without `roles`)
      fields: ['id', 'sku', 'name', 'price', 'stock', 'status'], // recommended
      sort: 'name',                         // default sort ('-field' = desc)
      // source: 'directus',                // force a source; default 'auto'
    },
  },
},
```

Directus URL / token default to `DIRECTUS_URL` / `NUXTUS_DIRECTUS_STATIC_TOKEN`
(override with `MEEOVI_TABLES_DIRECTUS_URL` / `MEEOVI_TABLES_DIRECTUS_TOKEN` or
`meeoviTables.directus`). They stay server-side.

## Usage

```vue
<MeeoviTable
  collection="products"
  height="560px"
  :page-size="25"
  sort="-price"
  :hide="['status']"
  :columns="[{ id: 'name', header: 'Product' }]"
  @select="(row) => console.log(row)"
/>
```

| Prop | |
| --- | --- |
| `collection` | allowlisted collection name (required) |
| `source` | force `'directus'`, `'magento'`, … (a switcher shows when several can serve it) |
| `pageSize`, `sort` | initial paging / sort |
| `columns` | SVAR column tweaks merged by `id` (`width`, `header`, `template`, …) |
| `hide` | columns that start hidden (still in the header right-click menu) |
| `toolbar` | title / count / source / search bar (default `true`) |
| `words` | SVAR locale words (default English) |
| `height` | default `560px` |

`useMeeoviTable(collection, { source, pageSize, sort })` gives the same data
(`rows`, `schema`, `total`, `page`, `pageSize`, `sort`, `search`, `source`, …)
for a custom UI.

## API

- `GET /api/tables` — tables this visitor may open, with the sources for each.
- `GET /api/tables/:collection?page=&pageSize=&sort=&search=&source=` — rows,
  `total`, the column `schema`, the source used and every available source.

Access: non-public collections ask the app's session endpoint
(`/api/auth/get-session`, better-auth; configurable as `sessionEndpoint`) with
the visitor's cookie — 401 when signed out, 403 when the user lacks every
listed `role` (better-auth's comma-separated `user.role`). Password / concealed Directus fields are always stripped;
configured `fields` that don't exist in Directus are ignored (Directus would
otherwise answer 403).

## Adding a source

```ts
// server/plugins/my-table-source.ts
import { registerTableSource } from '@mframework/meeovi-tables/sources'

export default defineNitroPlugin(() => {
  registerTableSource({
    id: 'my-backend',
    label: 'My backend',
    handles: (collection) => collection === 'invoices',
    async list({ collection, page, pageSize, sort, search, fields }) {
      return { rows: [], total: 0 }
    },
    // optional — otherwise the Directus schema (or the rows) is used
    async schema(collection) { return null },
  })
})
```

Custom sources take priority over adapters, which take priority over Directus.
Sources that return whole collections can use `queryRows()` (same export) for
in-memory search / sort / paging.

## Notes

- Read-only for now (adapters' commerce backends are GET-only).
- SVAR's `<Willow>` theme component isn't used: it always renders a
  `<Teleport to="head">`, which breaks hydration under Nuxt SSR. The component
  provides the theme context + `wx-willow-theme` class itself and loads the
  SVAR icon / Open Sans fonts through `useHead`.
