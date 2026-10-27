/**
 * Site-wide CSS that admins edit live in Directus (globals.custom_css) and
 * the app serves at /site/custom.css, linked after the built stylesheets so
 * its rules win. Only Directus admins can edit it, but it runs on every
 * page, so anything that could load or run code is refused:
 *
 *  - @import (would pull in stylesheets from anywhere);
 *  - old script hooks: IE `expression()` / `behavior:`, Firefox `-moz-binding`;
 *  - `javascript:` / `vbscript:` URLs;
 *  - `</style` (so it's also safe to inline).
 *
 * Checks run on a normalized copy (CSS escapes decoded, comments removed),
 * so `\65 xpression(` or `expr/**\/ession(` can't slip past. If anything is
 * found the whole stylesheet is refused, not patched: a half-applied
 * stylesheet is harder to notice than an empty one.
 */
export const MAX_CUSTOM_CSS = 200_000

const BLOCKED: [RegExp, string][] = [
  [/@import/i, '@import'],
  [/expression\s*\(/i, 'expression()'],
  [/behavior\s*:/i, 'behavior:'],
  [/-moz-binding/i, '-moz-binding'],
  [/(java|vb|live)script\s*:/i, 'script: URLs'],
  [/<\/?\s*style/i, '<style>'],
]

function normalize(css: string): string {
  return css
    .replace(/\\([0-9a-f]{1,6})\s?/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    })
    .replace(/\\(.)/g, '$1')
    .replace(/\/\*[\s\S]*?(\*\/|$)/g, '')
}

export function sanitizeCustomCss(input: unknown): { css: string, refused: string | null } {
  if (typeof input !== 'string' || !input.trim()) return { css: '', refused: null }
  if (input.length > MAX_CUSTOM_CSS) return { css: '', refused: `longer than ${MAX_CUSTOM_CSS} characters` }
  const normalized = normalize(input)
  const hit = BLOCKED.find(([re]) => re.test(normalized))
  if (hit) return { css: '', refused: `contains ${hit[1]}` }
  return { css: input.trim(), refused: null }
}
