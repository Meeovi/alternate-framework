import xss from 'xss'

/**
 * Sanitise HTML that came from users or the CMS before it reaches the DOM
 * (v-dompurify-html uses this — see plugins/sanitize-html.ts). Allowlist
 * based (js-xss, the same library nuxt-security's request validator uses),
 * and identical on the server and in the browser, so SSR output and
 * hydration match.
 *
 * Kept: ordinary formatting found in stored content — headings, lists,
 * links, images, tables, sections, `class` / `style` / `id` (Mobirise
 * section anchors). Dropped: scripts, event handlers, javascript:/data:
 * URLs, forms, objects, unknown tags (their text is kept, escaped).
 * iframes only from known embed hosts.
 */

const GLOBAL_ATTRS = ['class', 'style', 'title', 'dir', 'id', 'lang']

const TAGS: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'name'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  ol: ['start', 'type', 'reversed'],
  td: ['colspan', 'rowspan', 'align', 'valign'],
  th: ['colspan', 'rowspan', 'align', 'valign', 'scope'],
  iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'referrerpolicy'],
  ...Object.fromEntries([
    'p', 'div', 'span', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'mark',
    'sub', 'sup', 'br', 'hr', 'blockquote', 'q', 'cite', 'code', 'pre', 'kbd', 'abbr',
    'ul', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'picture', 'caption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup', 'col', 'details', 'summary',
  ].map((tag) => [tag, []])),
}

// Embeds allowed in iframes (exact host or a subdomain of it).
const EMBED_HOSTS = ['youtube.com', 'youtube-nocookie.com', 'player.vimeo.com', 'meteoblue.com', 'google.com', 'maps.google.com']

function allowedEmbed(src: string): boolean {
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:') return false
    return EMBED_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

const whiteList = Object.fromEntries(
  Object.entries(TAGS).map(([tag, attrs]) => [tag, [...GLOBAL_ATTRS, ...attrs]]),
)

const filter = new xss.FilterXSS({
  whiteList,
  stripIgnoreTag: false, // unknown tags are escaped (text survives)
  stripIgnoreTagBody: ['script', 'style', 'noscript', 'template'],
  allowCommentTag: false,
  css: true, // style values go through js-xss' CSS allowlist
  onTagAttr(tag, name, value) {
    if (tag === 'iframe' && name === 'src') {
      return allowedEmbed(value) ? `src="${xss.escapeAttrValue(value)}"` : ''
    }
    // A new tab must not get a handle on this page.
    if (tag === 'a' && name === 'target' && value === '_blank') {
      return 'target="_blank" rel="noopener noreferrer"'
    }
    return undefined // default handling (js-xss blocks javascript:/data: URLs)
  },
})

export function sanitizeUserHtml(input: unknown): string {
  if (input === null || input === undefined) return ''
  return filter.process(String(input))
}
