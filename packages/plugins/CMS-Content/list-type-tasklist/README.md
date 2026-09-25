# @mframework/list-type-tasklist

Task-list view: add / edit / delete / tick off items in a list.

One of the plug-and-play `list-type-*` plugins. Each renders one kind of
list on the social layer's `/lists/list/[slug]` page and is enabled just by
registering it — no layer code changes.

## Install

Register by path in the app's `nuxt.config.ts`:

```ts
modules: [
  resolve(__dirname, '../../../packages/plugins/CMS-Content/list-type-tasklist/module.ts'),
],
```

## Options (`listTypeTaskList`)

| Option | Default | |
| --- | --- | --- |
| `types` | `['Task List']` | Directus `list_types.name` values this plugin renders |
| `collection` | `'list_items'` | Directus collection holding the items |
| `fallback` | `true` | Also render list types no other plugin claims |

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
