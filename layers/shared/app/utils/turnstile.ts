/**
 * Cloudflare Turnstile's browser API, loaded once (explicit rendering) and
 * shared by <NuxtTurnstile> (components/NuxtTurnstile.vue) and the forms
 * plugin (plugins/turnstile-forms.client.ts).
 */
export type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  execute: (id: string) => void
  reset: (id: string) => void
  remove: (id: string) => void
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let api: Promise<TurnstileApi> | null = null

export function loadTurnstile(): Promise<TurnstileApi> {
  return (api ??= new Promise<TurnstileApi>((resolve, reject) => {
    const ready = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile
    if (ready()) return resolve(ready()!)
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => (ready() ? resolve(ready()!) : reject(new Error('Turnstile did not load')))
    script.onerror = () => { api = null; script.remove(); reject(new Error('Turnstile did not load')) }
    document.head.appendChild(script)
  }))
}
