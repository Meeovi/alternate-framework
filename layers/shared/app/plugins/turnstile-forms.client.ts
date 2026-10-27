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
 * stays hidden unless Cloudflare wants the visitor to click, then shows in
 * a small centred dialog until they do (or cancel).
 */
const TOKEN_TIMEOUT_MS = 120_000

export default defineNuxtPlugin(() => {
  const siteKey = (useRuntimeConfig().public as { turnstile?: { siteKey?: string } }).turnstile?.siteKey
  // Already installed (Sentry wraps fetch afterwards, keeping ours as __sentry_original__).
  const installed = (f: unknown): boolean => !!f && (!!(f as { __turnstileForms?: boolean }).__turnstileForms || installed((f as { __sentry_original__?: unknown }).__sentry_original__))
  if (!siteKey || typeof window === 'undefined' || installed(window.fetch)) return

  let widgetId: string | null = null
  let overlay: HTMLElement | null = null
  let pending: { resolve: (token: string) => void, reject: (error: Error) => void } | null = null

  // Kept in the page but invisible while the check runs on its own (the
  // widget can't run inside display:none); shown only when Cloudflare asks
  // the visitor to click. Styles go through the CSSOM, which the CSP allows.
  function dialog(): { overlay: HTMLElement, slot: HTMLElement } {
    overlay = document.createElement('div')
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '2147483000', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '16px',
      background: 'rgba(0, 0, 0, 0.45)', visibility: 'hidden', pointerEvents: 'none',
    })
    const card = document.createElement('div')
    card.setAttribute('role', 'dialog')
    card.setAttribute('aria-modal', 'true')
    card.setAttribute('aria-labelledby', 'turnstile-dialog-title')
    Object.assign(card.style, {
      background: 'rgb(var(--v-theme-surface, 255, 255, 255))', color: 'rgb(var(--v-theme-on-surface, 33, 33, 33))',
      borderRadius: '12px', padding: '20px 24px', maxWidth: '360px', width: '100%', boxSizing: 'border-box',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', textAlign: 'center', fontFamily: 'inherit',
    })
    const title = document.createElement('h2')
    title.id = 'turnstile-dialog-title'
    title.textContent = 'Quick security check'
    Object.assign(title.style, { fontSize: '1.15rem', fontWeight: '600', margin: '0 0 6px' })
    const text = document.createElement('p')
    text.textContent = 'Tick the box to continue.'
    Object.assign(text.style, { margin: '0 0 14px', fontSize: '0.95rem' })
    const slot = document.createElement('div')
    Object.assign(slot.style, { display: 'flex', justifyContent: 'center', minHeight: '65px' })
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.textContent = 'Cancel'
    Object.assign(cancel.style, {
      marginTop: '12px', padding: '6px 16px', border: '0', background: 'transparent',
      color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem',
    })
    // The request goes on without a token, so the form shows the server's
    // own "security check" message instead of waiting out the timeout.
    cancel.addEventListener('click', () => {
      pending?.reject(new Error('Security check cancelled'))
      pending = null
      hide()
    })
    card.append(title, text, slot, cancel)
    overlay.append(card)
    document.body.appendChild(overlay)
    return { overlay, slot }
  }

  function show() {
    if (!overlay) return
    Object.assign(overlay.style, { visibility: 'visible', pointerEvents: 'auto' })
  }
  function hide() {
    if (!overlay) return
    Object.assign(overlay.style, { visibility: 'hidden', pointerEvents: 'none' })
  }

  async function widget(): Promise<{ turnstile: TurnstileApi, id: string }> {
    const turnstile = await loadApi()
    if (!widgetId) {
      const { slot } = dialog()
      widgetId = turnstile.render(slot, {
        sitekey: siteKey,
        execution: 'execute',
        appearance: 'interaction-only',
        'before-interactive-callback': show,
        'after-interactive-callback': hide,
        callback: (token: string) => { hide(); pending?.resolve(token); pending = null },
        'error-callback': () => { hide(); pending?.reject(new Error('Security check failed')); pending = null },
        'expired-callback': () => {},
        'timeout-callback': () => { hide(); pending?.reject(new Error('Security check timed out')); pending = null },
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
        const timer = setTimeout(() => { pending = null; hide(); reject(new Error('Security check timed out')) }, TOKEN_TIMEOUT_MS)
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
