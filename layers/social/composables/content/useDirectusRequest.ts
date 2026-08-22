// Thin wrapper around the $directus client + query-descriptor builders
// (readItem/readItems/createItem/updateItem/deleteItem) that
// layers/commerce's app plugin provides via useNuxtApp() — see
// layers/commerce/app/plugins/directus.ts. layers/social doesn't declare a
// formal dependency on layers/commerce, but in practice every app that
// extends layers/social also extends layers/commerce (confirmed:
// meeovi-frontend and every apps/office/* app), so these injections are
// always present at runtime. useCalendar.ts and GanttBoard.vue both import
// this by name; it never existed as a file, so both were unreachable dead
// imports until now.
import { useNuxtApp } from '#imports'

export function useDirectusRequest() {
  const { $directus, $readItem, $readItems, $createItem, $updateItem, $deleteItem } = useNuxtApp() as any

  return {
    readItem: (collection: string, id: string | number, query?: Record<string, any>) =>
      $directus.request($readItem(collection, id, query)),
    readItems: (collection: string, query?: Record<string, any>) =>
      $directus.request($readItems(collection, query)),
    createItem: (collection: string, data: Record<string, any>) =>
      $directus.request($createItem(collection, data)),
    updateItem: (collection: string, id: string | number, data: Record<string, any>) =>
      $directus.request($updateItem(collection, id, data)),
    deleteItem: (collection: string, id: string | number) =>
      $directus.request($deleteItem(collection, id)),
  }
}
