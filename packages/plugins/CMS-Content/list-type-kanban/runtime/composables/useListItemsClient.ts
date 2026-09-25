import { useNuxtApp } from '#imports'

/**
 * Minimal Directus CRUD for list items. Relies on the host app providing
 * `$directus` plus the `$readItems`/`$createItem`/`$updateItem`/
 * `$deleteItem` builders (layers/shared's Directus plugin does) — kept
 * inside each list-type plugin so it installs without the social layer.
 */
export function useListItemsClient() {
  const app = useNuxtApp() as any

  function call(builder: string, ...args: unknown[]) {
    const client = app.$directus
    const build = app[`$${builder}`]
    if (!client || typeof client.request !== 'function' || typeof build !== 'function') {
      throw new Error(`[list-types] $directus / $${builder} is not available — register a Directus client plugin`)
    }
    return client.request(build(...args))
  }

  return {
    readItems: (collection: string, query?: Record<string, any>) =>
      call('readItems', collection, query) as Promise<Record<string, any>[]>,
    createItem: (collection: string, data: Record<string, any>) =>
      call('createItem', collection, data) as Promise<Record<string, any>>,
    updateItem: (collection: string, id: string | number, data: Record<string, any>) =>
      call('updateItem', collection, id, data) as Promise<Record<string, any>>,
    deleteItem: (collection: string, id: string | number) =>
      call('deleteItem', collection, id),
  }
}
