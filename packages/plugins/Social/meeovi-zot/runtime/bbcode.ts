// Hubzilla / Streams post bodies are BBCode. This turns the common tags into
// simple HTML for Meeovi (which sanitizes remote HTML before showing it) and
// into plain text.
const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ESC[c]!)
const safeHref = (href: string) => (/^https?:\/\//i.test(href.trim()) ? escapeHtml(href.trim()) : '#')

/** BBCode → HTML (links, images, emphasis, quotes, code, lists, line breaks). */
export function bbcodeToHtml(bbcode: string | null | undefined): string {
  let s = escapeHtml(String(bbcode ?? ''))
  const codes: string[] = []
  s = s.replace(/\[code(?:=[^\]]*)?\]([\s\S]*?)\[\/code\]/gi, (_, body: string) => `\u0000${codes.push(`<pre><code>${body}</code></pre>`) - 1}\u0000`)
  s = s
    .replace(/\[(?:url|zrl)=([^\]]+)\]([\s\S]*?)\[\/(?:url|zrl)\]/gi, (_, href: string, label: string) => `<a href="${safeHref(href)}">${label}</a>`)
    .replace(/\[(?:url|zrl)\]([\s\S]*?)\[\/(?:url|zrl)\]/gi, (_, href: string) => `<a href="${safeHref(href)}">${href}</a>`)
    .replace(/\[(?:img|zmg)(?:=[^\]]*)?\]([\s\S]*?)\[\/(?:img|zmg)\]/gi, (_, src: string) => `<img src="${safeHref(src)}" alt="">`)
    .replace(/\[(b|i|u|s)\]([\s\S]*?)\[\/\1\]/gi, (_, tag: string, body: string) => `<${tag.toLowerCase()}>${body}</${tag.toLowerCase()}>`)
    .replace(/\[quote(?:=[^\]]*)?\]([\s\S]*?)\[\/quote\]/gi, '<blockquote>$1</blockquote>')
    .replace(/\[h([1-6])\]([\s\S]*?)\[\/h\1\]/gi, '<h$1>$2</h$1>')
    .replace(/\[list(?:=[^\]]*)?\]([\s\S]*?)\[\/list\]/gi, (_, body: string) => `<ul>${body.split(/\[\*\]/).map((i) => i.trim()).filter(Boolean).map((i) => `<li>${i}</li>`).join('')}</ul>`)
    // Anything else ([share], [observer], [video]…): keep the text, drop the tag.
    .replace(/\[\/?[a-z*][a-z0-9_]*(?:=[^\]]*)?\]/gi, '')
    .replace(/\r?\n/g, '<br>')
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)]!)
}

/** BBCode → plain text. */
export function bbcodeToText(bbcode: string | null | undefined): string {
  return String(bbcode ?? '')
    .replace(/\[(?:img|zmg)(?:=[^\]]*)?\][\s\S]*?\[\/(?:img|zmg)\]/gi, '')
    .replace(/\[(?:url|zrl)=[^\]]+\]([\s\S]*?)\[\/(?:url|zrl)\]/gi, '$1')
    .replace(/\[\/?[a-z*][a-z0-9_]*(?:=[^\]]*)?\]/gi, '')
    .trim()
}

/** Image URLs in a body ([img]/[zmg]). */
export function bbcodeImages(bbcode: string | null | undefined): string[] {
  return [...String(bbcode ?? '').matchAll(/\[(?:img|zmg)(?:=[^\]]*)?\]([\s\S]*?)\[\/(?:img|zmg)\]/gi)].map((m) => m[1]!.trim()).filter((u) => /^https:\/\//i.test(u))
}
