// Reading the Current events portal and article pictures from the
// MediaWiki API. Wikimedia asks every API client to identify itself with a
// User-Agent naming the site and a contact; requests are few and serial.
import { portalTitle } from './parse'

export type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{ ok: boolean, status: number, json(): Promise<any> }>

export type WikipediaSource = {
  /** e.g. https://en.wikipedia.org/w/api.php */
  api: string
  userAgent: string
  fetch?: FetchLike
}

async function call(source: WikipediaSource, params: Record<string, string>): Promise<any> {
  const url = `${source.api}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`
  const res = await (source.fetch ?? (fetch as unknown as FetchLike))(url, { headers: { 'User-Agent': source.userAgent, 'Api-User-Agent': source.userAgent } })
  if (!res.ok) throw new Error(`Wikipedia answered ${res.status}`)
  const body = await res.json()
  if (body?.error) throw new Error(`Wikipedia: ${body.error.info || body.error.code}`)
  return body
}

/** A day's portal wikitext, or null when the page doesn't exist (yet). */
export async function fetchDay(source: WikipediaSource, day: Date): Promise<string | null> {
  const body = await call(source, { action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', titles: portalTitle(day) })
  const page = body?.query?.pages?.[0]
  if (!page || page.missing) return null
  return page.revisions?.[0]?.slots?.main?.content ?? null
}

/** Lead pictures (thumbnail URLs) of articles, by title. Up to 50 titles. */
export async function fetchPictures(source: WikipediaSource, titles: string[], size = 800): Promise<Map<string, string>> {
  const unique = [...new Set(titles.filter(Boolean))].slice(0, 50)
  const pictures = new Map<string, string>()
  if (!unique.length) return pictures
  const body = await call(source, { action: 'query', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: String(size), redirects: '1', titles: unique.join('|') })
  // Map redirected / normalised titles back to what was asked for.
  const aliases = new Map<string, string>()
  for (const n of [...(body?.query?.normalized ?? []), ...(body?.query?.redirects ?? [])]) aliases.set(n.to, aliases.get(n.from) ?? n.from)
  for (const page of body?.query?.pages ?? []) {
    if (page?.thumbnail?.source) pictures.set(aliases.get(page.title) ?? page.title, page.thumbnail.source)
  }
  return pictures
}
