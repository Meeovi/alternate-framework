import xss from 'xss'
import { sanitizeCustomCss } from '../../shared/customCss'

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
 *
 * Two profiles:
 *  - sanitizeUserHtml: anything users write (posts, comments, bios). Style
 *    values go through js-xss' CSS allowlist plus the layout properties
 *    below; nothing that can lift content out of its box (position: fixed /
 *    absolute, transform, z-index), so a post can't cover the page.
 *  - sanitizeCmsHtml: pages written in Directus, which only Directus admins
 *    and Team Members can edit (the app's CMS proxy treats `pages` as
 *    admin-only too). Any CSS property and `<style>` blocks are kept, checked
 *    like the live site CSS (sanitizeCustomCss: no @import, expression(),
 *    script: URLs…), plus <video>/<audio>. Scripts and event handlers are
 *    still removed. `v-dompurify-html:cms` uses it.
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

// Media that CMS pages may embed (sources are checked by js-xss like any URL).
const CMS_TAGS: Record<string, string[]> = {
  video: ['src', 'poster', 'controls', 'autoplay', 'muted', 'loop', 'playsinline', 'preload', 'width', 'height'],
  audio: ['src', 'controls', 'autoplay', 'muted', 'loop', 'preload'],
  source: ['src', 'type', 'srcset', 'media', 'sizes'],
  track: ['src', 'kind', 'srclang', 'label', 'default'],
}
const cmsWhiteList = {
  ...whiteList,
  ...Object.fromEntries(Object.entries(CMS_TAGS).map(([tag, attrs]) => [tag, [...GLOBAL_ATTRS, ...attrs]])),
  img: [...whiteList.img!, 'srcset', 'sizes'],
}

// Layout properties js-xss' CSS allowlist lacks (it predates flexbox and
// grid gaps), so flex and grid layouts written in HTML keep their shape.
const LAYOUT_CSS = [
  'gap', 'row-gap', 'column-gap', 'justify-content', 'justify-items', 'justify-self', 'align-content', 'align-items', 'align-self',
  'place-content', 'place-items', 'place-self', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow', 'flex-shrink',
  'flex-basis', 'order', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-template', 'grid-area',
  'grid-column', 'grid-row', 'grid-auto-flow', 'grid-auto-columns', 'grid-auto-rows', 'object-fit', 'object-position',
  'aspect-ratio', 'box-sizing', 'overflow-wrap', 'word-break', 'text-decoration', 'text-transform', 'border-radius',
  'box-shadow', 'opacity',
]
const userCss = {
  whiteList: {
    ...xss.getDefaultCSSWhiteList(),
    ...Object.fromEntries(LAYOUT_CSS.map((name) => [name, true])),
    position: /^\s*(static|relative|sticky)\s*$/i,
  },
}
// CMS pages: every property, as long as the declaration passes the live
// site CSS checks.
const cmsCss = {
  whiteList: {},
  onIgnoreAttr: (name: string, value: string) => {
    const declaration = `${name}:${value}`
    const { css, refused } = sanitizeCustomCss(declaration)
    return css && !refused ? declaration : ''
  },
}

const onTagAttr = (tag: string, name: string, value: string) => {
  if (tag === 'iframe' && name === 'src') {
    return allowedEmbed(value) ? `src="${xss.escapeAttrValue(value)}"` : ''
  }
  // A new tab must not get a handle on this page.
  if (tag === 'a' && name === 'target' && value === '_blank') {
    return 'target="_blank" rel="noopener noreferrer"'
  }
  return undefined // default handling (js-xss blocks javascript:/data: URLs)
}

const options = {
  stripIgnoreTag: false, // unknown tags are escaped (text survives)
  stripIgnoreTagBody: ['script', 'style', 'noscript', 'template'],
  allowCommentTag: false,
  onTagAttr,
}
const filter = new xss.FilterXSS({ ...options, whiteList, css: userCss })
const cmsFilter = new xss.FilterXSS({ ...options, whiteList: cmsWhiteList, css: cmsCss })

export function sanitizeUserHtml(input: unknown): string {
  if (input === null || input === undefined) return ''
  return filter.process(String(input))
}

const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi

export function sanitizeCmsHtml(input: unknown): string {
  if (input === null || input === undefined) return ''
  // <style> blocks are lifted out, checked like the live site CSS, and put
  // back at the top; one that fails is dropped whole.
  const styles: string[] = []
  const html = String(input).replace(STYLE_BLOCK, (_, css: string) => {
    const { css: clean, refused } = sanitizeCustomCss(css)
    if (clean && !refused) styles.push(clean)
    return ''
  })
  const style = styles.length ? `<style>${styles.join('\n')}</style>` : ''
  return style + cmsFilter.process(html)
}
