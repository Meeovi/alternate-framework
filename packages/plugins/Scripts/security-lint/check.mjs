// Dependency-free static checks for the security mistakes found in the
// 2026-10 audit (docs/instructions/web-app-security.md), so they can't
// quietly come back. Scans tracked files only.
//
//   node packages/plugins/Scripts/security-lint/check.mjs
//
// Exit code 1 when any "error" rule matches. Add an inline
//   // security-lint-ignore: <rule-id> <reason>
// on (or directly above) a line to accept a reviewed exception.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\0').filter(Boolean)
  .filter((f) => !/(^|\/)(node_modules|dist|\.output|\.nuxt|generated|playground)\//.test(f))
  .filter((f) => !/\.(lock|min\.js|map|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|pdf|snap)$|package-lock\.json$/.test(f))

/** @type {{ id: string, level: 'error'|'warn', files: RegExp, pattern: RegExp, why: string, skip?: RegExp }[]} */
const RULES = [
  {
    id: 'raw-v-html', level: 'error', files: /\.vue$/, pattern: /\sv-html=/,
    skip: /experience-builder\/runtime\/components\/runtime-components\/RichText\.vue$/,
    why: 'renders unsanitised HTML — use v-dompurify-html (shared js-xss allowlist)',
  },
  {
    id: 'app-sanitizer-override', level: 'error', files: /app\/plugins\/.*\.(ts|js)$/,
    pattern: /directive\(\s*['"]dompurify-html['"]/, skip: /^layers\/shared\//,
    why: 'an app-level v-dompurify-html overrides the shared sanitiser (the old one was a bypassable regex)',
  },
  {
    id: 'raw-sql', level: 'error', files: /\.(ts|js|mjs)$/,
    pattern: /sql\.raw\(|\.unsafe\(|\$queryRawUnsafe|\$executeRawUnsafe|knex\.raw\(/, skip: /Scripts\//,
    why: 'string-built SQL — use parameterised queries (drizzle sql`` / ORM)',
  },
  {
    id: 'sentry-pii', level: 'error', files: /sentry\..*config\.(ts|js)$/, pattern: /sendDefaultPii:\s*true/,
    why: 'sends request cookies (session tokens), headers and IPs to Sentry',
  },
  {
    id: 'hardcoded-secret', level: 'error', files: /./,
    pattern: /sk_live_[0-9A-Za-z]{10,}|rk_live_[0-9A-Za-z]{10,}|whsec_[0-9A-Za-z]{20,}|AKIA[0-9A-Z]{16}|ghp_[0-9A-Za-z]{36}|github_pat_[0-9A-Za-z_]{40,}|xox[bpa]-[0-9A-Za-z-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|re_[0-9A-Za-z]{8}_[0-9A-Za-z]{20,}/,
    why: 'credential committed to the repo — move it to env and rotate it',
  },
  {
    id: 'body-spread-write', level: 'error', files: /\/server\/.*\.(ts|js)$/,
    pattern: /(createItem|updateItem)\([^)]*\.\.\.(body|payload|input)\b/,
    why: 'request body spread into a Directus write (static token) = mass assignment / nested writes — allowlist fields',
  },
  {
    id: 'middleware-fail-open', level: 'error', files: /app\/middleware\/.*\.(ts|js)$/,
    pattern: /catch\s*(\(\w*\))?\s*\{\s*(\/\/[^\n]*\n\s*)*return\s*;?\s*\}/,
    why: 'route middleware that returns (lets the page render) when the session check errors — abortNavigation instead',
  },
  {
    id: 'upstream-error-message', level: 'warn', files: /\/server\/.*\.(ts|js)$/,
    pattern: /statusMessage:\s*(e|err|error)\??\.message/,
    why: 'upstream error text in a response (5xx are genericised by sanitize-errors.ts; 4xx are not)',
  },
  {
    id: 'cors-wildcard', level: 'warn', files: /\.(ts|js)$/,
    pattern: /['"]access-control-allow-origin['"]\s*[:,]\s*['"]\*['"]/i,
    why: 'wildcard CORS — make sure nothing credentialed is behind it',
  },
]

const findings = []
for (const file of files) {
  const rules = RULES.filter((r) => r.files.test(file) && !(r.skip && r.skip.test(file)))
  if (!rules.length) continue
  let text
  try { text = readFileSync(resolve(root, file), 'utf8') } catch { continue }
  if (text.includes('\0')) continue
  const lines = text.split('\n')
  for (const rule of rules) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', '') + 'g')
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length
      const here = `${lines[line - 2] ?? ''}\n${lines[line - 1] ?? ''}`
      if (new RegExp(`security-lint-ignore:\\s*${rule.id}\\b`).test(here)) continue
      findings.push({ ...rule, file, line, snippet: lines[line - 1].trim().slice(0, 110) })
    }
  }
}

for (const f of findings) {
  console.log(`${f.level === 'error' ? '✘' : '⚠'} [${f.id}] ${f.file}:${f.line}\n    ${f.snippet}\n    → ${f.why}`)
}
const errors = findings.filter((f) => f.level === 'error').length
console.log(`\n${files.length} files scanned — ${errors} error(s), ${findings.length - errors} warning(s)`)
process.exitCode = errors ? 1 : 0
