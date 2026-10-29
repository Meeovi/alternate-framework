// Wikipedia's Current events portal (Portal:Current_events/<year>_<Month>_<day>)
// as news items. A day's wikitext looks like:
//
//   '''Disasters and accidents'''                 ← category
//   *[[2026 Toledo train collision]]               ← topic (links only)
//   **At least 68 people are killed … [https://news.sky.com/… (Sky News)]
//                                                  ← event: a sentence + sources
//
// Topics nest (*, **, ***); an event is any bullet with words of its own,
// not only links. Each event becomes one item; its title is the nearest
// topic (or the start of the sentence when it has none).

export type NewsSource = { url: string, name: string }

export type NewsItem = {
  /** YYYY-MM-DD, the portal day it was listed on. */
  date: string
  /** The portal's section: "Armed conflicts and attacks", "Politics and elections"… */
  category: string
  /** The topics it sits under, outermost first (link text). */
  topics: string[]
  /** Wikipedia article titles of those topics (for a picture). */
  topicArticles: string[]
  title: string
  /** The sentence as plain text. */
  text: string
  /** The sentence as HTML, with its Wikipedia links. */
  html: string
  sources: NewsSource[]
}

const WIKI = 'https://en.wikipedia.org/wiki/'

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const articleUrl = (title: string, wiki = WIKI) => wiki + encodeURIComponent(title.trim().replace(/ /g, '_')).replace(/%2F/g, '/').replace(/%3A/g, ':')

/** Comments, references and templates out; what's left is links and text. */
function stripMarkup(line: string): string {
  return line
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/<[^>]+>/g, '')
}

/** External links [url (Name)] → sources; the rest stays. */
function takeSources(line: string): { rest: string, sources: NewsSource[] } {
  const sources: NewsSource[] = []
  const rest = line.replace(/\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]*))?\]/g, (_, url: string, label?: string) => {
    const name = (label || '').replace(/'{2,}/g, '').replace(/^\(|\)$/g, '').trim()
    try {
      sources.push({ url, name: name || new URL(url).hostname.replace(/^www\./, '') })
    } catch { /* not a URL */ }
    return ''
  })
  return { rest, sources }
}

/** Inline wikitext → plain text and HTML (links to Wikipedia). */
export function renderInline(wikitext: string, wiki = WIKI): { text: string, html: string, links: string[] } {
  const links: string[] = []
  let text = ''
  let html = ''
  const re = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]([a-z]*)/g
  let last = 0
  for (const match of wikitext.matchAll(re)) {
    const before = wikitext.slice(last, match.index)
    text += before
    html += escapeHtml(before)
    const target = match[1]!.trim()
    const label = (match[2] ?? target).trim() + (match[3] ?? '')
    // File and category links aren't part of the sentence.
    if (/^(file|image|category):/i.test(target)) {
      last = match.index! + match[0].length
      continue
    }
    links.push(target.replace(/#.*$/, ''))
    text += label
    html += `<a href="${escapeHtml(articleUrl(target, wiki))}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`
    last = match.index! + match[0].length
  }
  text += wikitext.slice(last)
  html += escapeHtml(wikitext.slice(last))
  const tidy = (s: string) => s.replace(/'{2,}/g, '').replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim()
  return { text: tidy(text), html: tidy(html), links }
}

/** A bullet that is only links (and punctuation) is a topic, not an event. */
const isTopicOnly = (body: string) => !stripMarkup(body).replace(/\[\[[^\]]*\]\]/g, '').replace(/[\s,;:–—\-/&()'"]|and/g, '').length

/** Title from the event's own sentence, when it has no topic above it:
 *  the start of it, cut at a word ("U.S." would end a naive sentence split). */
const titleFromText = (text: string) => {
  const clean = text.replace(/\.$/, '')
  return clean.length > 90 ? `${clean.slice(0, 87).replace(/\s+\S*$/, '')}…` : clean
}

export function parseCurrentEvents(wikitext: string, date: string): NewsItem[] {
  const items: NewsItem[] = []
  let category = ''
  // topics[depth - 1] for bullets of each depth.
  const stack: Array<{ labels: string[], articles: string[] }> = []

  const lines = wikitext.split('\n').map((l) => l.trim()).filter(Boolean)
  const depthOf = (l: string | undefined) => /^(\*+)/.exec(l ?? '')?.[1]!.length ?? 0

  for (const [index, line] of lines.entries()) {
    const heading = /^'''(.+?)'''\s*$/.exec(line) || /^;\s*(.+)$/.exec(line)
    if (heading) {
      category = renderInline(stripMarkup(heading[1]!)).text
      stack.length = 0
      continue
    }
    const bullet = /^(\*+)\s*(.*)$/.exec(line)
    if (!bullet || !category) continue
    const depth = bullet[1]!.length
    const body = stripMarkup(bullet[2]!)
    stack.length = Math.min(stack.length, depth - 1)

    // A topic: only links, or words without sources heading deeper bullets
    // ("Aftermath of the [[2026 Brazilian general election]]").
    const hasSources = /\[https?:\/\//.test(body)
    if (isTopicOnly(body) || (!hasSources && depthOf(lines[index + 1]) > depth)) {
      const { text, links } = renderInline(body)
      stack[depth - 1] = { labels: text.split(/\s*,\s*/).filter(Boolean), articles: links }
      continue
    }

    const { rest, sources } = takeSources(body)
    const { text, html } = renderInline(rest)
    if (!text) continue
    const parents = stack.slice(0, depth - 1).filter(Boolean)
    const topics = parents.flatMap((p) => p.labels)
    const innermost = parents[parents.length - 1]
    items.push({
      date,
      category,
      topics,
      topicArticles: parents.flatMap((p) => p.articles),
      title: innermost?.labels[0] || titleFromText(text),
      text,
      html,
      sources,
    })
  }
  return items
}

/** Portal page title for a day: Portal:Current_events/2026_October_28. */
export function portalTitle(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
  return `Portal:Current_events/${date.getUTCFullYear()}_${month}_${date.getUTCDate()}`
}
