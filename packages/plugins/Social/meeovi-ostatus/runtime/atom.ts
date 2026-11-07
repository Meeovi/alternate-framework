// OStatus feeds: Atom with Activity Streams 1.0 and Portable Contacts
// extensions (what GNU social, postActiv and other OStatus servers publish
// at a profile's "updates-from" link).
import { XMLParser } from 'fast-xml-parser'

export type AtomAuthor = {
  uri?: string
  name?: string
  /** poco:preferredUsername */
  username?: string
  /** poco:displayName */
  displayName?: string
  /** poco:note */
  note?: string
  avatar?: string
  profileUrl?: string
}

export type AtomEntry = {
  id: string
  title?: string
  /** HTML (or text escaped to HTML) */
  html: string
  published?: string
  updated?: string
  url?: string
  verb?: string
  objectType?: string
  inReplyTo?: string
  author?: AtomAuthor
  enclosures: { href: string, type?: string }[]
  categories: string[]
}

export type AtomFeed = { title?: string, author?: AtomAuthor, entries: AtomEntry[] }

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  removeNSPrefix: false,
  textNodeName: '#text',
  isArray: (name) => ['entry', 'link', 'category'].includes(name),
  processEntities: true,
  htmlEntities: true,
})

const text = (v: unknown): string | undefined => {
  if (v == null) return undefined
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && '#text' in (v as any)) return String((v as any)['#text'])
  return undefined
}
const asArray = <T>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v])
const links = (node: any): { rel?: string, type?: string, href?: string, mediaType?: string }[] =>
  asArray(node?.link).map((l: any) => ({ rel: l?.['@rel'], type: l?.['@type'], href: l?.['@href'], mediaType: l?.['@media:type'] }))

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ESC[c]!)

const shortVerb = (v?: string) => v?.replace(/^https?:\/\/activitystrea\.ms\/schema\/1\.0\//, '').replace(/^http:\/\/ostatus\.org\/schema\/1\.0\//, '')

function readAuthor(node: any): AtomAuthor | undefined {
  if (!node) return undefined
  const ls = links(node)
  return {
    uri: text(node.uri) ?? text(node.id),
    name: text(node.name),
    username: text(node['poco:preferredUsername']),
    displayName: text(node['poco:displayName']),
    note: text(node['poco:note']),
    avatar: ls.find((l) => l.rel === 'avatar')?.href,
    profileUrl: ls.find((l) => l.rel === 'alternate' && (!l.type || l.type === 'text/html'))?.href,
  }
}

function readContent(node: any): string {
  const content = node?.content
  const raw = text(content) ?? ''
  const type = typeof content === 'object' ? content?.['@type'] : undefined
  return type === 'html' || type === 'xhtml' ? raw : escapeHtml(raw).replace(/\n/g, '<br>')
}

export function parseAtom(xml: string): AtomFeed {
  const doc = parser.parse(xml)
  const feed = doc?.feed
  if (!feed) throw new Error('Not an Atom feed')
  const feedAuthor = readAuthor(feed.author ?? feed['activity:subject'])
  return {
    title: text(feed.title),
    author: feedAuthor,
    entries: asArray(feed.entry).map((e: any): AtomEntry => {
      const ls = links(e)
      return {
        id: text(e.id) ?? '',
        title: text(e.title),
        html: readContent(e),
        published: text(e.published),
        updated: text(e.updated),
        url: ls.find((l) => l.rel === 'alternate' && (!l.type || l.type === 'text/html'))?.href,
        verb: shortVerb(text(e['activity:verb'])),
        objectType: shortVerb(text(e['activity:object-type'])),
        inReplyTo: asArray(e['thr:in-reply-to'])[0]?.['@ref'],
        author: readAuthor(e.author) ?? feedAuthor,
        enclosures: ls.filter((l) => l.rel === 'enclosure' && l.href).map((l) => ({ href: l.href!, type: l.type })),
        categories: asArray(e.category).map((c: any) => c?.['@term']).filter((t: unknown): t is string => typeof t === 'string'),
      }
    }).filter((e) => e.id),
  }
}
