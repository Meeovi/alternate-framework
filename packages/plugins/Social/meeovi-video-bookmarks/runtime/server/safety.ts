/**
 * The adult-content filter for linked videos. A link is refused when its
 * host, its address or anything the platform says about the video (title,
 * description, channel, tags) looks adult, on top of each platform's own
 * flag (Dailymotion `explicit`, PeerTube `nsfw` and NSFW instances, YouTube's
 * age restriction when a YOUTUBE_API_KEY is set — see providers.ts).
 *
 * Matching is done on normalised text: accents stripped, lower case, common
 * look-alikes undone (p0rn, pr0n, s3x, n.s.f.w, "p o r n"). Weak words only
 * match as whole words, so place names and ordinary words that contain them
 * ("Sussex", "analysis", "Scunthorpe", "cum laude") pass.
 *
 * The lists are deliberately strict: a false refusal costs a member one
 * link, a miss puts adult content on the site. Sites add terms and hosts
 * with the module's `blockedTerms` / `blockedHosts` options or the
 * VIDEO_BOOKMARKS_BLOCKED_TERMS / VIDEO_BOOKMARKS_BLOCKED_HOSTS env vars.
 */

/** Found anywhere inside a word ("pornography", "hentaihaven"). */
const STRONG = [
  'porn', 'xvideo', 'xhamster', 'xnxx', 'redtube', 'youporn', 'hentai', 'onlyfans', 'fansly',
  'chaturbate', 'stripchat', 'livejasmin', 'brazzers', 'bangbros', 'spankbang', 'rule34', 'nsfw', 'nhentai',
  'camsoda', 'bongacams', 'myfreecams', 'manyvids', 'clips4sale', 'masturbat',
  'blowjob', 'handjob', 'creampie', 'gangbang', 'bukkake', 'deepthroat', 'dildo', 'cumshot',
]

/** Whole words or phrases only. */
const WORDS = [
  'xxx', 'sex tape', 'sextape', 'sex video', 'sex videos', 'sex scene', 'sex scenes', 'sex cam', 'sex cams', 'sex chat',
  'live sex', 'free sex', 'having sex', 'oral sex', 'anal sex', 'nude', 'nudes', 'nudity', 'naked', 'topless',
  'erotic', 'erotica', 'fetish', 'bdsm', 'milf', 'milfs', 'camgirl', 'camgirls', 'cam girl', 'cam girls', 'webcam girl',
  'striptease', 'strip tease', 'stripper', 'strippers', 'lap dance', 'orgasm', 'orgasms', 'horny', 'lewd', 'boobs',
  'titties', 'pussy', 'booty video', 'twerk nude', 'escort service', 'escort girl', 'escort girls', 'adults only', 'adult only',
  'adult content', 'adult video', 'adult videos', 'adult film', 'adult films', 'explicit content', 'uncensored',
  'only fans', 'ahegao', 'yiff', 'futanari', 'ecchi', 'pron', 'smut', 'softcore', 'hardcore sex', 'erome',
]

/** Ordinary phrases that contain a blocked word, removed before matching. */
const ALLOWED_PHRASES = [
  'nude lip', 'nude lips', 'nude lipstick', 'nude lipsticks', 'nude makeup', 'nude make up', 'nude nails', 'nude nail',
  'nude color', 'nude colors', 'nude colour', 'nude colours', 'nude heels', 'nude shoes', 'nude eyeshadow', 'nude palette',
  'naked gun', 'naked chef', 'naked eye', 'naked and afraid', 'naked truth', 'naked brothers band', 'naked palette',
  'naked city', 'naked lunch', 'naked singularity', 'naked mole rat', 'naked mole rats',
]

/** Adult sites by host, beyond the words above (their names are ordinary words or names). */
const ADULT_HOSTS = ['motherless.com', 'erome.com', 'eporner.com', 'tube8.com', 'beeg.com', 'tnaflix.com', 'heavy-r.com', 'thisvid.com', 'efukt.com', 'literotica.com']

/** Host labels that mark a site as adult (whole labels or label parts: "sexcams", "xxx-videos"). */
const HOST_WORDS = ['sex', 'xxx', 'adult', 'nude', 'naked', 'erotic', 'fetish', 'escort', 'cams', 'milf']

export type SafetyConfig = { terms?: string[], hosts?: string[] }

export type SafetyVerdict = { ok: true } | { ok: false, reason: 'adult-host' | 'adult-text' | 'adult-flag' }

/** "Pörn  V1DEOS!" → "porn videos" (letters, digits, + and single spaces). */
export function normalize(input: string): string {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[0134578@$]/g, (c) => ({ 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's' } as Record<string, string>)[c]!)
    // "p.o.r.n", "p o r n", "n-s-f-w" → "porn", "nsfw"
    .replace(/\b(?:[a-z][\s._*\-|/\\]+){2,}[a-z]\b/g, (m) => m.replace(/[^a-z]/g, ''))
    .replace(/[^a-z+]+/g, ' ')
    .trim()
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function compile(words: string[]): RegExp {
  return new RegExp(`(?:^| )(?:${words.map((w) => escape(normalize(w))).filter(Boolean).join('|')})(?= |$)`)
}

const WORDS_RE = compile(WORDS)
const ALLOWED_RE = new RegExp(`(?:^| )(?:${ALLOWED_PHRASES.map((w) => escape(normalize(w))).join('|')})(?= |$)`, 'g')
// "18+" and "+18" survive normalisation only as raw text.
const AGE_RE = /(^|[^\d])(18|21)\s*\+|\+\s*(18|21)(?!\d)|\bover\s*18\b|\b18\s*(?:and|&)\s*(?:over|up)\b/i

/** True when the text reads as adult content. */
export function isAdultText(text: string, config: SafetyConfig = {}): boolean {
  if (!text) return false
  if (AGE_RE.test(text)) return true
  const normal = normalize(text).replace(ALLOWED_RE, ' ').replace(/ +/g, ' ').trim()
  if (!normal) return false
  const tokens = normal.split(' ')
  const strong = [...STRONG, ...(config.terms ?? []).filter((t) => !t.includes(' ') && t.length >= 5)].map(normalize)
  if (tokens.some((token) => strong.some((s) => s && token.includes(s)))) return true
  if (WORDS_RE.test(normal)) return true
  const extra = (config.terms ?? []).map(normalize).filter(Boolean)
  return extra.length > 0 && compile(extra).test(normal)
}

/** True when the hostname belongs to (or looks like) an adult site. */
export function isAdultHost(hostname: string, config: SafetyConfig = {}): boolean {
  const host = String(hostname || '').toLowerCase().replace(/\.$/, '')
  if (!host) return false
  if ([...ADULT_HOSTS, ...(config.hosts ?? [])].some((h) => { const b = h.toLowerCase().replace(/^\*?\./, ''); return host === b || host.endsWith(`.${b}`) })) return true
  // .xxx, .porn, .sex, .adult are adult-only top-level domains.
  if (/\.(xxx|porn|sex|adult|sexy)$/.test(host)) return true
  const labels = host.split('.').slice(0, -1)
  const parts = labels.flatMap((label) => label.split('-'))
  if (parts.some((part) => STRONG.some((s) => part.includes(s)))) return true
  return parts.some((part) => HOST_WORDS.some((w) => part === w || (part.length > w.length && (part.startsWith(w) || part.endsWith(w)) && w.length >= 4)))
}

/** The URL's host, then its path and query words. */
export function checkUrl(url: URL, config: SafetyConfig = {}): SafetyVerdict {
  if (isAdultHost(url.hostname, config)) return { ok: false, reason: 'adult-host' }
  let path = url.pathname + ' ' + url.search
  try { path = decodeURIComponent(path) } catch { /* keep raw */ }
  if (isAdultText(path.replace(/[-_/?=&.]+/g, ' '), config)) return { ok: false, reason: 'adult-text' }
  return { ok: true }
}

/** Everything the platform and the member said about the video. */
export function checkText(parts: Array<string | null | undefined | string[]>, config: SafetyConfig = {}): SafetyVerdict {
  const text = parts.flat().filter(Boolean).join(' \n ')
  return isAdultText(text, config) ? { ok: false, reason: 'adult-text' } : { ok: true }
}

/** "a, b ,c" → ['a', 'b', 'c'] */
export const listFromEnv = (value?: string) => String(value || '').split(',').map((s) => s.trim()).filter(Boolean)
