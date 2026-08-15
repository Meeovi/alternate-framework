// Real transactional email via Resend's HTTP API — same working pattern
// already proven live in layers/commerce's Stripe webhook handler
// (server/api/payment/stripe/webhooks.post.ts). Replaces a previous
// dead-prototype file that depended on a nonexistent `sendEmail` from
// `@better-auth/infra` and a nonsensical `viem/tempo/actions` import.
export async function sendAuthEmail(params: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ error: string | null }> {
  const { to, subject, html, text } = params
  const apiKey = process.env.NUXT_RESEND_API_KEY

  if (!apiKey) {
    console.warn('[auth-email] NUXT_RESEND_API_KEY missing; skipping send to', to)
    return { error: 'NUXT_RESEND_API_KEY not configured' }
  }

  const appName = process.env.NUXT_APP_NAME || 'App'
  const fromEmail = process.env.NUXT_APP_NOTIFY_EMAIL || 'no-reply@example.com'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: `${appName} <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    return { error: `Resend ${response.status}: ${body}` }
  }

  return { error: null }
}
