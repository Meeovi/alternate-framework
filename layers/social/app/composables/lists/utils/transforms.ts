import type { List, ListItem } from '../types'

/**
 * Normalize a raw provider list into Meeovi's List shape.
 */
export function transformList(raw: any): List {
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? 'Untitled',
    type: raw.type ?? 'list',
    items: Array.isArray(raw.items)
      ? raw.items.map(transformItem)
      : [],
    metadata: raw.metadata ?? {},
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null
  }
}

/**
 * Normalize a raw provider item into Meeovi's ListItem shape.
 */
export function transformItem(raw: any): ListItem {
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? '',
    description: raw.description ?? raw.body ?? '',
    completed: raw.completed ?? raw.done ?? false,
    position: raw.position ?? raw.order ?? 0,
    parentId: raw.parentId ?? raw.parent_id ?? null,
    metadata: raw.metadata ?? {},
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null
  }
}

/**
 * Normalize arrays safely.
 */
export function transformListArray(raw: any[]): List[] {
  return raw.map(transformList)
}