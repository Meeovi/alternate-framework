// Same as meeovi-ostatus/runtime/webfinger.ts; keep the two in step.
// WebFinger (RFC 7033) lookups: 'alice@example.social' → its JRD links.
import { safeJson } from './safe-fetch'

export type JrdLink = { rel: string, type?: string, href?: string, template?: string }
export type Jrd = { subject?: string, aliases?: string[], links?: JrdLink[], properties?: Record<string, unknown> }

/** 'alice@example.social', '@alice@example.social' or 'acct:alice@…' → { user, domain }. */
export function parseHandle(handle: string): { user: string, domain: string } | null {
  const m = /^(?:acct:)?@?([^@\s/]+)@([a-z0-9.-]+\.[a-z]{2,})$/i.exec(String(handle || '').trim())
  return m ? { user: m[1]!, domain: m[2]!.toLowerCase() } : null
}

export async function webfinger(handle: string): Promise<Jrd | null> {
  const parsed = parseHandle(handle)
  if (!parsed) return null
  const url = `https://${parsed.domain}/.well-known/webfinger?resource=${encodeURIComponent(`acct:${parsed.user}@${parsed.domain}`)}`
  try {
    return await safeJson<Jrd>(url, { headers: { accept: 'application/jrd+json, application/json' } })
  } catch (error: any) {
    if (error?.status === 404 || error?.status === 410) return null
    throw error
  }
}

export const findLink = (jrd: Jrd | null, rel: string, type?: string): JrdLink | undefined =>
  jrd?.links?.find((l) => l.rel === rel && (!type || l.type === type) && l.href)
