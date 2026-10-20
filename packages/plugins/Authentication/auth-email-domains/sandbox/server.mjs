// Sign-up email domains — a sandboxed auth plugin. Runs in its own
// locked-down process: it's given only the part of an email after the @,
// its settings and its own store. Self-contained (no imports).

/** @typedef {import('./types').SandboxedAuthPlugin} SandboxedAuthPlugin */

const clean = (value) => String(value ?? '').trim().toLowerCase().replace(/^@/, '').replace(/\.$/, '')

/** Is `domain` one of `entries` ("example.com", or "*.example.com" for its subdomains)? */
export function listed(domain, entries) {
  const d = clean(domain)
  if (!d) return false
  return (Array.isArray(entries) ? entries : []).some((entry) => {
    const e = clean(entry)
    if (!e) return false
    return e.startsWith('*.') ? d.endsWith(e.slice(1)) && d.length > e.length - 1 : d === e
  })
}

/** May an address at `domain` sign up, under these settings? An empty list restricts nothing. */
export function allowed(domain, settings) {
  const domains = Array.isArray(settings?.domains) ? settings.domains.filter((d) => clean(d)) : []
  if (!domains.length) return true
  const hit = listed(domain, domains)
  return settings?.mode === 'allow' ? hit : !hit
}

const today = () => new Date().toISOString().slice(0, 10)

/** @type {SandboxedAuthPlugin} */
export default {
  hooks: {
    async 'user.create.before'({ user }, ctx) {
      if (allowed(user?.emailDomain, ctx.settings)) return
      const key = `refused:${today()}`
      await ctx.store.set(key, Number(await ctx.store.get(key) ?? 0) + 1)
      await ctx.audit('sign_up_refused', { domain: clean(user?.emailDomain) || null })
      return { deny: String(ctx.settings.message || 'Sign-ups with this email address aren\'t allowed.') }
    },
  },
  endpoints: {
    // GET /api/auth/plugin/email-domains/check?email=… — for sign-up forms.
    'GET /check'({ query }, ctx) {
      const email = String(query.email ?? '')
      const domain = email.includes('@') ? email.split('@').pop() : email
      if (!clean(domain)) return { status: 400, body: { error: 'Pass ?email=' } }
      return { allowed: allowed(domain, ctx.settings) }
    },
  },
}
