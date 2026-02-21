import { getListsConfig } from './config'
import { registerListsProviderRuntime } from './registry'
import { registerContentProviderRuntime } from './content/registry'
import { directusContentAdapter } from './content/providers/directus'

// Minimal runtime-safe module: translate a runtime adapter (if present)
// into the local provider registry. Avoids importing framework-specific
// tokens so this layer can be typechecked independently.
export default function ListsModule(runtimeCtx?: any) {
  try {
    const ctx = runtimeCtx || (typeof globalThis !== 'undefined' ? (globalThis as any).__MODULE_CTX : undefined)
    if (ctx && typeof ctx.getAdapter === 'function') {
      const runtimeAdapter = ctx.getAdapter('lists')
      if (runtimeAdapter) {
        const provider = {
          getList: (id: any) => runtimeAdapter.getList && runtimeAdapter.getList(id),
          listLists: (params: any) => runtimeAdapter.listLists && runtimeAdapter.listLists(params),
          createList: (data: any) => runtimeAdapter.createList && runtimeAdapter.createList(data),
          updateList: (id: any, data: any) => runtimeAdapter.updateList && runtimeAdapter.updateList(id, data),
          deleteList: (id: any) => runtimeAdapter.deleteList && runtimeAdapter.deleteList(id),

          addItem: (listId: any, item: any) => runtimeAdapter.addItem && runtimeAdapter.addItem(listId, item),
          updateItem: (listId: any, itemId: any, data: any) => runtimeAdapter.updateItem && runtimeAdapter.updateItem(listId, itemId, data),
          deleteItem: (listId: any, itemId: any) => runtimeAdapter.deleteItem && runtimeAdapter.deleteItem(listId, itemId),

          reorderItems: runtimeAdapter.reorderItems ? (listId: any, itemIds: any) => runtimeAdapter.reorderItems(listId, itemIds) : undefined
        }

        registerListsProviderRuntime('core', provider)
      }
    }
  } catch (e) {
    // noop — runtime may not provide the expected hooks in some environments
  }

  // Return a small module descriptor so importers that expect a default
  // export can still consume this file.
  return {
    id: 'lists',
    config: getListsConfig()
  }
}

// Register default content provider for the layer
try {
  registerContentProviderRuntime('directus', directusContentAdapter)
} catch (e) {
  // noop — runtime may not have composables available at build time
}
