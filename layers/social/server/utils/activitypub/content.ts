import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { Document, Hashtag, Image, Link, Note, PUBLIC_COLLECTION, Video } from '@fedify/vocab'
import type { Context } from '@fedify/fedify'
import { Temporal } from 'temporal-polyfill'
import { toPlainText } from '../federation-directus'
import { isPublicStatus, sitePaths, siteLink } from './config'

/**
 * Meeovi items as ActivityPub objects. Everything is read fresh from
 * Directus and checked again on every request: a note that was made private
 * or deleted stops being served (and the publisher sends a Delete).
 */

type Row = Record<string, any>

const directusUrl = () => String(process.env.DIRECTUS_URL || '').replace(/\/+$/, '')

// Throws on failure: callers must not mistake an error for "it's gone".
export const read = (collection: string, query: Row): Promise<Row[]> =>
  createDirectus(directusUrl()).with(rest()).with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))
    .request(readItems(collection as any, query as any)) as Promise<Row[]>

const PUBLIC_POST_FILTER = [
  { status: { _in: ['published', 'Published', 'public', 'Public'] } },
  { _or: [{ visibility_scope: { _null: true } }, { visibility_scope: { _eq: 'public' } }] },
]

export const NOTE_FIELDS = ['id', 'slug', 'title', 'summary', 'content', 'image', 'image_url', 'date_created', 'date_published', 'date_updated', 'creator_id']
export const PRODUCT_FIELDS = ['id', 'slug', 'name', 'short_description', 'content', 'meta_description', 'price', 'currency_code', 'image', 'image_url', 'created_at', 'updated_at', 'status', 'seller_username', 'seller_name']
export const VIBE_FIELDS = ['id', 'name', 'description', 'video_url', 'thumbnail_url', 'thumbnail', 'status', 'creator_id', 'date_created', 'date_updated']

// -- reads ---------------------------------------------------------------------

export async function publicNote(id: string): Promise<Row | null> {
  if (!/^\d{1,12}$/.test(id)) return null
  const [row] = await read('posts', { fields: NOTE_FIELDS, filter: { _and: [...PUBLIC_POST_FILTER, { id: { _eq: id } }] }, limit: 1 })
  return row ?? null
}

export async function publishedProduct(id: string): Promise<Row | null> {
  if (!/^\d{1,18}$/.test(id)) return null
  const [row] = await read('products', { fields: PRODUCT_FIELDS, filter: { _and: [{ status: { _eq: 'published' } }, { id: { _eq: id } }] }, limit: 1 })
  return row ?? null
}

export async function publishedVibe(id: string): Promise<Row | null> {
  if (!/^\d{1,12}$/.test(id)) return null
  const [row] = await read('shorts', { fields: VIBE_FIELDS, filter: { id: { _eq: id } }, limit: 1 })
  return row && isPublicStatus(row.status) ? row : null
}

export async function vibeProducts(id: string | number): Promise<Row[]> {
  const rows = await read('shorts_products', {
    fields: ['products_id.id', 'products_id.slug', 'products_id.name', 'products_id.status'],
    filter: { shorts_id: { _eq: id } }, limit: 20,
  }).catch(() => [])
  return rows.map((r) => r.products_id).filter((p) => p && p.status === 'published')
}

export async function listItem(id: string): Promise<Row | null> {
  if (!/^\d{1,12}$/.test(id)) return null
  const [row] = await read('list_items', {
    fields: ['id', 'title', 'description', 'link', 'list_id', 'date_created', 'post_id', 'products.products_id.id', 'products.products_id.slug', 'products.products_id.name'],
    filter: { id: { _eq: id } }, limit: 1,
  })
  return row ?? null
}

// -- text ------------------------------------------------------------------------

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Plain text as safe HTML paragraphs, hashtags linked to Meeovi's tag pages. */
export function textToHtml(text: string): string {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => {
    const html = escape(p).replace(/\n/g, '<br>')
      .replace(/(^|\s)#([\p{L}\p{N}_]+)/gu, (_m, pre, tag) => `${pre}<a href="${escape(siteLink(`/connect/hashtag/${encodeURIComponent(tag.toLowerCase())}`))}" class="mention hashtag" rel="tag">#<span>${escape(tag)}</span></a>`)
    return `<p>${html}</p>`
  }).join('')
}

export const hashtagsOf = (text: string) => [...new Set(text.match(/#[\p{L}\p{N}_]+/gu)?.map((t) => t.slice(1).toLowerCase()) ?? [])].slice(0, 20)

const tagObjects = (text: string) => hashtagsOf(text).map((tag) => new Hashtag({ name: `#${tag}`, href: new URL(siteLink(`/connect/hashtag/${encodeURIComponent(tag)}`)) }))

const linkHtml = (href: string, label: string) => `<p><a href="${escape(href)}">${escape(label)}</a></p>`

export const imageUrl = (row: Row): string | null => {
  for (const key of ['image_url', 'thumbnail_url']) {
    if (typeof row[key] === 'string' && row[key].startsWith('https://')) return row[key]
  }
  const id = typeof row.image === 'string' ? row.image : typeof row.thumbnail === 'string' ? row.thumbnail : row.image?.id
  return id && /^[\w-]{8,}$/.test(id) && directusUrl().startsWith('https://') ? `${directusUrl()}/assets/${id}` : null
}

const instant = (value: unknown): Temporal.Instant | null => {
  const t = Date.parse(String(value ?? ''))
  return Number.isFinite(t) ? Temporal.Instant.fromEpochMilliseconds(t) : null
}

const imageType = (url: string) => (/\.png(\?|$)/i.test(url) ? 'image/png' : /\.webp(\?|$)/i.test(url) ? 'image/webp' : /\.gif(\?|$)/i.test(url) ? 'image/gif' : 'image/jpeg')

export function apPriceLabel(price: unknown, currency?: unknown): string {
  const value = Number(price)
  if (!Number.isFinite(value) || value <= 0) return 'Free'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: String(currency || 'USD').toUpperCase() }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

// -- objects ----------------------------------------------------------------------

type Ctx = Context<unknown>
const audience = (ctx: Ctx, identifier: string) => ({ to: PUBLIC_COLLECTION, cc: ctx.getFollowersUri(identifier) })

/** A member's note. */
export function noteObject(ctx: Ctx, identifier: string, note: Row): Note {
  const text = toPlainText(note.content) || toPlainText(note.summary) || String(note.title || '')
  const url = siteLink(sitePaths.note(note))
  const image = imageUrl(note)
  return new Note({
    id: ctx.getObjectUri(Note, { id: String(note.id) }),
    attribution: ctx.getActorUri(identifier),
    ...audience(ctx, identifier),
    name: undefined,
    summary: undefined,
    content: textToHtml(text) + linkHtml(url, 'View on Meeovi'),
    url: new URL(url),
    published: instant(note.date_published || note.date_created),
    updated: instant(note.date_updated),
    tags: tagObjects(text),
    attachments: image ? [new Image({ url: new URL(image), mediaType: imageType(image), name: note.title || undefined })] : [],
    replies: undefined,
  })
}

/** A product, posted by its shop (or the site when it has no seller). */
export function productObject(ctx: Ctx, identifier: string, product: Row): Note {
  const name = String(product.name || 'A new product')
  const url = siteLink(sitePaths.product(product))
  const description = toPlainText(product.short_description) || toPlainText(product.content) || toPlainText(product.meta_description)
  const image = imageUrl(product)
  const head = `New on Meeovi: ${name} (${apPriceLabel(product.price, product.currency_code)})`
  return new Note({
    id: ctx.getObjectUri(Note, { id: `product-${product.id}` }),
    attribution: ctx.getActorUri(identifier),
    ...audience(ctx, identifier),
    content: `<p><strong>${escape(head)}</strong></p>` + (description ? textToHtml(description.slice(0, 1000)) : '') + linkHtml(url, 'Shop it on Meeovi'),
    url: new URL(url),
    published: instant(product.created_at),
    updated: instant(product.updated_at),
    tags: [new Hashtag({ name: '#meeovi', href: new URL(siteLink('/connect/hashtag/meeovi')) })],
    attachments: image ? [new Image({ url: new URL(image), mediaType: imageType(image), name })] : [],
  })
}

/** A vibe (short video), with links to the products tagged in it. */
export function vibeObject(ctx: Ctx, identifier: string, vibe: Row, products: Row[]): Video {
  const url = siteLink(sitePaths.vibe(vibe.id))
  const text = String(vibe.description || '').trim()
  const poster = imageUrl(vibe)
  const video = String(vibe.video_url || '')
  const shop = products.length
    ? `<p>Shop this vibe: ${products.map((p) => `<a href="${escape(siteLink(sitePaths.product(p)))}">${escape(String(p.name))}</a>`).join(', ')}</p>`
    : ''
  return new Video({
    id: ctx.getObjectUri(Video, { id: String(vibe.id) }),
    attribution: ctx.getActorUri(identifier),
    ...audience(ctx, identifier),
    name: String(vibe.name || 'A vibe'),
    content: (text ? textToHtml(text) : '') + shop + linkHtml(url, 'Watch on Meeovi'),
    // The file first (fediverse apps play it), then the page on Meeovi.
    urls: video.startsWith('https://')
      ? [new Link({ href: new URL(video), mediaType: video.endsWith('.webm') ? 'video/webm' : 'video/mp4' }), new Link({ href: new URL(url), mediaType: 'text/html' })]
      : [new URL(url)],
    attachments: video.startsWith('https://') ? [new Document({ url: new URL(video), mediaType: video.endsWith('.webm') ? 'video/webm' : 'video/mp4', name: String(vibe.name || 'A vibe') })] : [],
    icon: poster ? new Image({ url: new URL(poster), mediaType: imageType(poster) }) : undefined,
    published: instant(vibe.date_created),
    updated: instant(vibe.date_updated),
    tags: tagObjects(text),
  })
}

/** A list's new item, posted by the list's account. */
export function listItemObject(ctx: Ctx, identifier: string, list: Row, item: Row): Note {
  const product = item.products?.[0]?.products_id
  const target = product ? siteLink(sitePaths.product(product)) : typeof item.link === 'string' && /^https:\/\//.test(item.link) ? item.link : item.post_id ? siteLink(sitePaths.note({ id: item.post_id })) : siteLink(sitePaths.list(list))
  const title = String(item.title || product?.name || 'A new item')
  return new Note({
    id: ctx.getObjectUri(Note, { id: `list-item-${item.id}` }),
    attribution: ctx.getActorUri(identifier),
    ...audience(ctx, identifier),
    content: `<p>Added to <a href="${escape(siteLink(sitePaths.list(list)))}">${escape(String(list.name || 'a list'))}</a>: ${escape(title)}</p>`
      + (item.description ? textToHtml(toPlainText(item.description).slice(0, 500)) : '') + linkHtml(target, target),
    url: new URL(siteLink(sitePaths.list(list))),
    published: instant(item.date_created),
  })
}

