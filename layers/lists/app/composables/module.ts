import {
  defineAlternateModule,
  useAlternateEventBus,
  useAlternateContext,
  type AlternateContext,
  type ListsAdapter
} from '@meeovi/core'

import { getListsConfig } from './config'
import { registerListsProviderRuntime } from './registry'

export default defineAlternateModule({
  id: 'lists',
  adapters: {},

  async setup(ctx: AlternateContext) {
    const bus = useAlternateEventBus()
    const config = getListsConfig()

    // If a core adapter was registered under the `lists` key, register it
    // into the local provider registry so UI code can consume it via `useLists()`.
    // If a core adapter was registered under the `lists` key, adapt it
    // into the `ListsProvider` shape and register it into the local registry.
    try {
      const runtimeAdapter = ctx.getAdapter('lists' as any) as ListsAdapter | undefined
      if (runtimeAdapter) {
        const provider = {
          getList: (id: string) => runtimeAdapter.getList(id),
          listLists: (params?: Record<string, unknown>) => runtimeAdapter.listLists(params),
          createList: (data: Partial<Record<string, unknown>>) => runtimeAdapter.createList(data),
          updateList: (id: string, data: Partial<Record<string, unknown>>) => runtimeAdapter.updateList(id, data),
          deleteList: (id: string) => runtimeAdapter.deleteList(id),

          addItem: (listId: string, item: Partial<Record<string, unknown>>) => runtimeAdapter.addItem(listId, item),
          updateItem: (listId: string, itemId: string, data: Partial<Record<string, unknown>>) => runtimeAdapter.updateItem(listId, itemId, data),
          deleteItem: (listId: string, itemId: string) => runtimeAdapter.deleteItem(listId, itemId),

          reorderItems: runtimeAdapter.reorderItems ? (listId: string, itemIds: string[]) => runtimeAdapter.reorderItems!(listId, itemIds) : undefined
        }

        registerListsProviderRuntime('core', provider)
      }
    } catch (e) {
      // noop
    }

    // Listen for runtime adapter registrations from ModuleRegistry
    bus.on('adapter:registered' as any, (payload: any) => {
      try {
        if (payload?.key === 'lists') {
          const runtimeAdapter = ctx.getAdapter('lists' as any) as ListsAdapter | undefined
          if (runtimeAdapter) {
            const provider = {
              getList: (id: string) => runtimeAdapter.getList(id),
              listLists: (params?: Record<string, unknown>) => runtimeAdapter.listLists(params),
              createList: (data: Partial<Record<string, unknown>>) => runtimeAdapter.createList(data),
              updateList: (id: string, data: Partial<Record<string, unknown>>) => runtimeAdapter.updateList(id, data),
              deleteList: (id: string) => runtimeAdapter.deleteList(id),

              addItem: (listId: string, item: Partial<Record<string, unknown>>) => runtimeAdapter.addItem(listId, item),
              updateItem: (listId: string, itemId: string, data: Partial<Record<string, unknown>>) => runtimeAdapter.updateItem(listId, itemId, data),
              deleteItem: (listId: string, itemId: string) => runtimeAdapter.deleteItem(listId, itemId),

              reorderItems: runtimeAdapter.reorderItems ? (listId: string, itemIds: string[]) => runtimeAdapter.reorderItems!(listId, itemIds) : undefined
            }

            registerListsProviderRuntime('core', provider)
          }
        }
      } catch (e) {
        /* noop */
      }
    })
  }
})
