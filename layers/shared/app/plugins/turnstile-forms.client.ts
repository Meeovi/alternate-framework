import { AUTH_CAPTCHA_HEADER, needsAuthCaptcha, needsTurnstile, TURNSTILE_HEADER } from '../../shared/formProtection'
import { loadTurnstile as loadApi, type TurnstileApi } from '../utils/turnstile'

/**
 * Turnstile on every form, without wiring it into each one: form
 * submissions (shared/formProtection.ts) get a fresh token in
 * `x-turnstile-token`, and better-auth's protected endpoints one in
 * `x-captcha-response` when the form didn't add its own.
 *
 * It wraps window.fetch, which $fetch/useFetch, the Directus SDK and the
 * better-auth client all go through. One widget serves every request: it
 * stays hidden unless Cloudflare wants the visitor to click, then shows
 * in the corner until they do.
 */
const TOKEN_TIMEOUT_MS = 120_000

export default defineNuxtPlugin(() => {
  const siteKey = (useRuntimeConfig().public as { turnstile?: { siteKey?: string } }).turnstile?.siteKey
  // Already installed (Sentry wraps fetch afterwards, keeping ours as __sentry_original__).
  const installed = (f: unknown): boolean => !!f && (!!(f as { __turnstileForms?: boolean }).__turnstileForms || installed((f as { __sentry_original__?: unknown }).__sentry_original__))
  if (!siteKey || typeof window === 'undefined' || installed(window.fetch)) return

  let widgetId: string | null = null
  let container: HTMLElement | null = null
  let pending: { resolve: (token: string) => void, reject: (error: Error) => void } | null = null

  async function widget(): Promise<{ turnstile: TurnstileApi, id: string }> {
    const turnstile = await loadApi()
    if (!widgetId) {
      container = document.createElement('div')
      container.setAttribute('aria-live', 'polite')
      Object.assign(container.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: '2147483000' })
      document.body.appendChild(container)
      widgetId = turnstile.render(container, {
        sitekey: siteKey,
        execution: 'execute',
        appearance: 'interaction-only',
        callback: (token: string) => { pending?.resolve(token); pending = null },
        'error-callback': () => { pending?.reject(new Error('Security check failed')); pending = null },
        'expired-callback': () => {},
        'timeout-callback': () => { pending?.reject(new Error('Security check timed out')); pending = null },
      })
    }
    return { turnstile, id: widgetId }
  }

  // One token at a time: the widget is shared.
  let queue: Promise<unknown> = Promise.resolve()
  function token(): Promise<string> {
    const next = queue.then(async () => {
      const { turnstile, id } = await widget()
      return await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => { pending = null; reject(new Error('Security check timed out')) }, TOKEN_TIMEOUT_MS)
        pending = {
          resolve: (t) => { clearTimeout(timer); resolve(t) },
          reject: (e) => { clearTimeout(timer); reject(e) },
        }
        turnstile.reset(id)
        turnstile.execute(id)
      })
    })
    queue = next.catch(() => {})
    return next
  }

  const bodyJson = (body: unknown) => {
    if (typeof body !== 'string') return null
    try { return JSON.parse(body) } catch { return null }
  }

  const originalFetch = window.fetch.bind(window)
  const guardedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = input instanceof Request ? input : null
    const url = new URL(request ? request.url : String(input), window.location.href)
    const method = (init?.method || request?.method || 'GET').toUpperCase()
    if (url.origin !== window.location.origin || method === 'GET' || method === 'HEAD') return originalFetch(input, init)

    const headers = new Headers(init?.headers || request?.headers)
    let header: string | null = null
    if (needsAuthCaptcha(method, url.pathname)) {
      if (!headers.has(AUTH_CAPTCHA_HEADER)) header = AUTH_CAPTCHA_HEADER
    } else if (await needsTurnstile(method, url.pathname, () => bodyJson(init?.body))) {
      header = TURNSTILE_HEADER
    }
    if (!header) return originalFetch(input, init)

    // Without a token the server refuses with its own message, which the
    // form shows — so a failed check never blocks the request here.
    const value = await token().catch(() => '')
    if (value) headers.set(header, value)
    return originalFetch(request ? new Request(request, { ...init, headers }) : input, { ...init, headers })
  }
  ;(guardedFetch as { __turnstileForms?: boolean }).__turnstileForms = true
  window.fetch = guardedFetch as typeof window.fetch
})
