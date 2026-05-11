export function htmlToText(html: string | null | undefined) {
  const source = String(html || '')
  if (!source)
    return ''

  return source
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export function convertMastodonHTML(html: string | null | undefined) {
  return String(html || '')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .trim()
}
