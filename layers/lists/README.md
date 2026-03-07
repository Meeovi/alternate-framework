# @mframework/layer-lists

This layer provides first-class lists and task management functionality for the M Framework. It's provider-driven: you can plug in different backends (Directus, memory, ATProto, etc.) without changing UI code. The default production-ready fallback is the `@mframework/adapter-directus` provider.

Key goals:
- Provider-agnostic API used by the UI (`useLists()` composable).
- Advanced task features (due dates, reminders, priority, sharing, search, archive) exposed as optional provider methods.
- Production-ready defaults: Directus provider, health checks, graceful fallbacks.

Quick start

Install the layer into your project (monorepo/local install):

```bash
npm install @mframework/layer-lists
# also install your chosen provider (Directus example)
npm install @mframework/adapter-directus
```

Register the layer and configure the provider in your M Framework app (Directus example):

```ts
import lists from '@mframework/layer-lists'

const app = createM FrameworkApp({
  config: {
    lists: {
      provider: 'directus',
      directus: {
        baseUrl: 'https://cms.example.com',
        apiKey: process.env.DIRECTUS_KEY
      }
    }
  },
  modules: [lists]
})

await app.start()
```

Using in a Nuxt (modules) app

1. Install the packages into your Nuxt app project.
2. Add the layer module to your Nuxt mframework app bootstrap (see above).
3. In Vue components or composables, use the `useLists()` composable the same way as in the M Framework UI:

```ts
const { listLists, createList, addItem, updateItem } = useLists()

const lists = await listLists()
await createList({ title: 'Groceries' })
await addItem('list-id', { title: 'Buy milk', metadata: { dueDate: '2026-02-01' } })
```

Advanced features

Providers may implement optional advanced methods:
- `toggleComplete(listId, itemId, completed)`
- `setDueDate(listId, itemId, dueDate)`
- `setReminder(listId, itemId, reminder)`
- `setPriority(listId, itemId, priority)`
- `shareList(listId, userId, role)`
- `searchItems(listId, query)`
- `archiveList(listId)`

If a provider doesn't implement these methods, the `memory` provider includes sensible defaults and the `directus` provider attempts fallbacks to existing endpoints when possible.

Creating a provider

Implement a `ListsProvider` and register it with `registerListsProvider(name, provider)`.

Example skeleton (register at runtime):

```ts
import { registerListsProvider } from '@mframework/layer-lists/app/composables/registry'

const MyProvider = {
  async getList(id) { /* ... */ },
  async listLists() { /* ... */ },
  async createList(data) { /* ... */ },
  async addItem(listId, item) { /* ... */ },
  // ... implement optional methods as desired
}

registerListsProvider('my-provider', MyProvider)
```

Runtime registration

Other modules can register providers at runtime using `registerListsProviderRuntime(name, provider)`.

Health checks

Use the provided `checkListsProviderHealth()` helper to validate that the configured provider is reachable (it performs a lightweight `listLists()` call). Example:

```ts
import { checkListsProviderHealth } from '@mframework/layer-lists/app/composables/utils/health'

const healthy = await checkListsProviderHealth()
if (!healthy) {
  // fallback or alert
}
```

What's next

- Add server-side sync/notifications (webhooks) for reminders.
- Add tests and CI for providers and bridges.
- Provide an Express example wiring server-side endpoints to the Directus client.

License: MIT
