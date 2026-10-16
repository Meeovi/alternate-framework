# @mframework/list-type-kanban

Kanban board with To Do / In Progress / Done columns mapped to `list_items.status`. Also serves the legacy `Board` list type.

A [SVAR Kanban](https://docs.svar.dev/vue/kanban/) board (`@svar-ui/vue-kanban`: drag and drop, card editor, context menu, toolbar search/sort) run in the integrations sandbox, with no outside connections: the lists page embeds it with `<IntegrationFrame>` and lends it `list.items` / `list.create` / `list.update` / `list.remove`, scoped to the list on screen.

The sandbox UI is built from `sandbox-src/` (Vue + SVAR) into `sandbox/app.js` + `sandbox/app.css`:

```bash
npm run build:sandbox -w @mframework/list-type-kanban
```

Rebuild and commit `sandbox/` after changing `sandbox-src/` or upgrading SVAR. The build is a single classic script (the sandbox is an opaque origin) with SVAR's icon font inlined (its CDN is blocked by the sandbox CSP); `sandbox/index.html` is hand-written.

One of the plug-and-play `list-type-*` plugins. Each renders one kind of
list on the social layer's `/lists/list/[slug]` page and is enabled just by
registering it — no layer code changes.

## Install

Register by path in the app's `nuxt.config.ts`:

```ts
modules: [
  resolve(__dirname, '../../../packages/plugins/CMS-Content/list-type-kanban/module.ts'),
],
```

## Options (`listTypeKanban`)

| Option | Default | |
| --- | --- | --- |
| `types` | `['Kanban', 'Board']` | Directus `list_types.name` values this plugin renders |
| `collection` | `'list_items'` | Directus collection holding the items |

## How it plugs in

The module registers a global component and adds an entry to
`appConfig.listTypes[<type name>]` (`{ component, label, icon, plugin, fallback? }`
— see `runtime/types.ts`). The list page looks the list's type up there and
renders `<component :is="entry.component" :list-id :items />`. A lookup miss
falls back to the entry marked `fallback` (the task list), or a
"no plugin installed" notice.

Data goes through the host app's `$directus` client and
`$readItems`/`$createItem`/`$updateItem`/`$deleteItem` builders
(provided by `layers/shared`).
