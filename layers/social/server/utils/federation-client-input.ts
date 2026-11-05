// Request parsing for /api/social/client/* (the federation client routes).
import { createError, getQuery, type H3Event } from 'h3'
import type { FederatedListInput, FederatedListItemInput } from '../../shared/types/federation'

/** ?network=&id= of a list. Ids are opaque (at:// URIs, numbers…). */
export function listRef(event: H3Event): { network: string, id: string } {
  const query = getQuery(event)
  const network = String(query.network ?? '').trim()
  const id = String(query.id ?? '').trim()
  if (!/^[a-z][a-z0-9-]{0,31}$/.test(network) || !id || id.length > 512) {
    throw createError({ statusCode: 400, statusMessage: 'network and id are required' })
  }
  return { network, id }
}

/** List fields from a body; `creating` requires the name. */
export function listInput(body: unknown, creating: boolean): Partial<FederatedListInput> {
  const b = (body ?? {}) as Record<string, unknown>
  const out: Partial<FederatedListInput> = {}
  if (b.name !== undefined || creating) {
    const name = String(b.name ?? '').trim()
    if (!name || name.length > 255) throw createError({ statusCode: 400, statusMessage: 'A list needs a name of up to 255 characters' })
    out.name = name
  }
  if (b.description !== undefined) out.description = String(b.description).slice(0, 5000)
  if (b.visibility !== undefined) {
    if (b.visibility !== 'public' && b.visibility !== 'private') throw createError({ statusCode: 400, statusMessage: 'Visibility must be public or private' })
    out.visibility = b.visibility
  }
  if (b.type !== undefined) out.type = String(b.type)
  return out
}

export function listItemInput(body: unknown): FederatedListItemInput {
  const b = (body ?? {}) as Record<string, unknown>
  const kind = String(b.kind ?? '').trim()
  if (kind === 'account' && b.actor) return { kind, actor: String(b.actor).slice(0, 512) }
  if (kind === 'note' && b.post) return { kind, post: String(b.post).slice(0, 512) }
  if (/^[a-z][a-z-]{0,31}$/.test(kind) && kind !== 'account' && kind !== 'note' && b.id !== undefined && b.id !== '') {
    return { kind, id: typeof b.id === 'number' ? b.id : String(b.id).slice(0, 160) }
  }
  throw createError({ statusCode: 400, statusMessage: 'What should be added?' })
}
