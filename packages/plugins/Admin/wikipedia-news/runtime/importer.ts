// Turns Current events items into notes in a space (Meeovi News): one note
// per event, credited to Wikipedia (CC BY-SA 4.0) with its news sources,
// tagged with its section and #news. Running it again adds only what's new:
// each note's slug comes from the day, topic and first source, and a slug
// that already exists is skipped.
import { createHash } from 'node:crypto'
import { parseCurrentEvents, portalTitle, type NewsItem } from './parse'
import { fetchDay, fetchPictures, type WikipediaSource } from './source'

type Row = Record<string, any>

export type ImportDeps = {
  source: WikipediaSource
  readItems: (collection: string, query: Record<string, unknown>) => Promise<Row[]>
  createItem: (collection: string, item: Row) => Promise<Row>
  log?: (message: string) => void
}

export type ImportOptions = {
  /** Slug of the space the notes go in. */
  space: string
  /** How many days back from `today`, today included. */
  days?: number
  /** Most notes to add in one run. */
  limit?: number
  /** Name the notes are shown under. */
  author?: string
  today?: Date
}

export type ImportResult = { added: number, skipped: number, days: string[], errors: string[] }

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** A tag's slug, as hashtags are written: lowercase letters and digits. */
export const tagSlug = (name: string) => name.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '')

export function noteSlug(item: NewsItem): string {
  const hash = createHash('sha256').update([item.date, item.title, item.sources[0]?.url ?? item.text].join('|')).digest('hex').slice(0, 10)
  return `news-${item.date}-${hash}`
}

/** The note's body: the event, its sources and the credit. */
export function noteContent(item: NewsItem, portalUrl: string): string {
  const sources = item.sources.length
    ? `<p><strong>Sources:</strong> ${item.sources.map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`).join(' · ')}</p>`
    : ''
  return `<p>${item.html}</p>${sources}<p><small>From Wikipedia's <a href="${escapeHtml(portalUrl)}" target="_blank" rel="noopener">Current events</a> portal, ${escapeHtml(item.date)}. Text available under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.</small></p>`
}

export async function importNews(deps: ImportDeps, options: ImportOptions): Promise<ImportResult> {
  const log = deps.log ?? (() => {})
  const result: ImportResult = { added: 0, skipped: 0, days: [], errors: [] }
  const limit = Math.max(1, Math.min(options.limit ?? 50, 200))
  const author = options.author ?? 'Meeovi News'

  const [space] = await deps.readItems('spaces', { fields: ['id'], filter: { slug: { _eq: options.space } }, limit: 1 })
  if (!space) throw new Error(`No space "${options.space}"`)

  const today = options.today ?? new Date()
  const days = Math.max(1, Math.min(options.days ?? 2, 14))
  const tagIds = new Map<string, number>()

  const tagId = async (name: string): Promise<number | null> => {
    const slug = tagSlug(name)
    if (!slug) return null
    if (tagIds.has(slug)) return tagIds.get(slug)!
    const [found] = await deps.readItems('tags', { fields: ['id'], filter: { slug: { _eq: slug } }, limit: 1 })
    const id = found?.id ?? (await deps.createItem('tags', { name, slug, status: 'published' })).id
    tagIds.set(slug, id)
    return id
  }

  // Oldest day first, so notes are added in the order things happened.
  for (let back = days - 1; back >= 0 && result.added < limit; back--) {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - back))
    const date = day.toISOString().slice(0, 10)
    let wikitext: string | null
    try {
      wikitext = await fetchDay(deps.source, day)
    } catch (error: any) {
      result.errors.push(`${date}: ${error?.message || error}`)
      continue
    }
    if (!wikitext) continue
    result.days.push(date)

    const items = parseCurrentEvents(wikitext, date)
    const slugs = items.map(noteSlug)
    const existing = new Set((await deps.readItems('posts', { fields: ['slug'], filter: { slug: { _in: slugs } }, limit: -1 })).map((r) => r.slug))
    const fresh = items.filter((_, i) => !existing.has(slugs[i]))
    result.skipped += items.length - fresh.length
    if (!fresh.length) continue

    const pictures = await fetchPictures(deps.source, fresh.flatMap((i) => i.topicArticles.slice(-1))).catch(() => new Map<string, string>())
    const portalUrl = `${deps.source.api.replace(/\/w\/api\.php$/, '')}/wiki/${portalTitle(day)}`

    for (const item of fresh) {
      if (result.added >= limit) break
      try {
        const tags = (await Promise.all([item.category, 'News'].map(tagId))).filter((id): id is number => id !== null)
        await deps.createItem('posts', {
          title: item.title.slice(0, 255),
          slug: noteSlug(item),
          summary: item.text,
          content: noteContent(item, portalUrl),
          image_url: pictures.get(item.topicArticles[item.topicArticles.length - 1] ?? '') ?? null,
          status: 'published',
          visibility_scope: 'public',
          content_type: 'Article',
          username: author,
          date_published: `${date}T12:00:00.000Z`,
          link_preview: { source: 'wikipedia-current-events', portal: portalUrl, sources: item.sources },
          spaces: { create: [{ spaces_id: space.id }], update: [], delete: [] },
          tags: { create: tags.map((id) => ({ tags_id: id })), update: [], delete: [] },
        })
        result.added++
      } catch (error: any) {
        result.errors.push(`${date} "${item.title}": ${error?.message || error}`)
      }
    }
    log(`[wikipedia-news] ${date}: ${fresh.length} new of ${items.length}`)
  }
  return result
}
