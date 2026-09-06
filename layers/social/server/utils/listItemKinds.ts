import { createError } from 'h3'

/**
 * A "list" can save more than just products — Spaces and Vibez (shorts)
 * are each linked to `lists` through their own M2M junction table, the
 * same way products are (see layers/auth/server/database/migrations/
 * schema.ts: `listsProducts`, `listsShorts`, `spacesLists`). This registry
 * is the single place that maps a caller-facing `kind` to:
 *  - `listsAliasField`: the relational alias already used to *read* a
 *    list's saved items for this kind (see app/pages/lists/list/
 *    [...slug].vue's `fields`, e.g. `vibez.shorts_id.*`) — reused here to
 *    scope an ownership + membership check to one query.
 *  - `junctionCollection` / `itemIdColumn`: the real junction table and
 *    the column on it (and on the nested alias filter above) that holds
 *    the related item's id.
 *
 * Add a new kind here — and nowhere else — to let the "Add to List" panel
 * save another entity type.
 */
export type ListItemKind = 'product' | 'space' | 'vibe'

export const LIST_ITEM_KINDS: Record<ListItemKind, {
  listsAliasField: string
  junctionCollection: string
  itemIdColumn: string
}> = {
  product: { listsAliasField: 'products', junctionCollection: 'lists_products', itemIdColumn: 'products_id' },
  vibe: { listsAliasField: 'vibez', junctionCollection: 'lists_shorts', itemIdColumn: 'shorts_id' },
  space: { listsAliasField: 'spaces', junctionCollection: 'spaces_lists', itemIdColumn: 'spaces_id' },
}

export function resolveListItemKind(raw: unknown) {
  const kind = (typeof raw === 'string' && raw ? raw : 'product') as ListItemKind
  const config = LIST_ITEM_KINDS[kind]
  if (!config) {
    throw createError({ statusCode: 400, statusMessage: `Unsupported list item kind: ${String(raw)}` })
  }
  return { kind, ...config }
}

// products.id/shorts.id/spaces.id are all numeric columns — some JSON
// paths (bigint columns in particular) can serialize as strings to avoid
// precision loss, so normalize to a real number wherever possible before
// it goes into a Directus filter/create payload.
export function normalizeId(raw: unknown): string | number {
  if (typeof raw === 'number') return raw
  const asString = String(raw)
  const asNumber = Number(asString)
  return asString !== '' && Number.isFinite(asNumber) ? asNumber : asString
}
