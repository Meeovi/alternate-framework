# @mframework/meeovi-newsletter

Backend-agnostic newsletter subscription module for M Framework.

Moves newsletter sign-up out of the layers and storefront apps into one
pluggable Nuxt module: a drop-in component, a headless composable, and a
Nitro endpoint that dispatches to a configurable backend **provider**.

## Features

- `<MeeoviNewsletter>` component (Vuetify) with `inline` / `card` / `compact` variants and slots
- `<NewsletterBox>` compact preset
- `useNewsletter()` composable for custom forms
- `POST {apiBase}/subscribe` Nitro handler — credentials stay server-side
- Pluggable providers: **mailchimp**, **mautic** (self-hosted), **directus**, **console** (dev / no-op)
- Register your own provider (SendGrid, HubSpot, a CRM webhook, …) at runtime
- Bot mitigation: an always-on honeypot field, plus an optional Cloudflare
  Turnstile widget (auto-enabled when the app already has a Turnstile site
  key configured)
- Directus provider records a consent timestamp + IP alongside the subscription

## Install

The module lives in this monorepo and is consumed from source — no build step.
Register it by path in `nuxt.config.ts`:

```ts
import { resolve } from 'path'

export default defineNuxtConfig({
  modules: [
    resolve(__dirname, '../../../packages/plugins/meeovi-newsletter/module.ts'),
  ],

  // optional — every value falls back to an env var (see below)
  meeoviNewsletter: {
    provider: 'mailchimp',
    doubleOptIn: true,
    ui: {
      title: 'Join our newsletter',
      description: 'Sales, events and the occasional gift.',
      buttonText: 'Subscribe',
    },
  },
})
```

## Configuration

| Option | Env fallback | Default |
|---|---|---|
| `provider` | `NEWSLETTER_PROVIDER` | `directus` |
| `apiBase` | — | `/api/newsletter` |
| `doubleOptIn` | — | `true` |
| `mailchimp.apiKey` | `NEWSLETTER_API_KEY` / `MAILCHIMP_API_KEY` | — |
| `mailchimp.serverPrefix` | `MAILCHIMP_SERVER_PREFIX` | — |
| `mailchimp.audienceId` | `MAILCHIMP_AUDIENCE_ID` | — |
| `mautic.baseUrl` | `NEWSLETTER_MAUTIC_URL` / `MAUTIC_BASE_URL` | — |
| `mautic.formId` | `NEWSLETTER_MAUTIC_FORM_ID` | — |
| `mautic.formAlias` | `NEWSLETTER_MAUTIC_FORM_NAME` | — |
| `mautic.emailField` / `firstNameField` / `lastNameField` | `NEWSLETTER_MAUTIC_EMAIL_FIELD` (email only) | `email` / `first_name` / `last_name` |
| `directus.url` | `NEWSLETTER_DIRECTUS_URL` / `DIRECTUS_URL` | — |
| `directus.token` | `NEWSLETTER_DIRECTUS_TOKEN` / `NUXTUS_DIRECTUS_STATIC_TOKEN` | — |
| `directus.collection` | `NEWSLETTER_DIRECTUS_COLLECTION` | `newsletters` |
| `directus.consentAtField` / `consentIpField` | — | `consent_at` / `consent_ip` (set `null` to skip) |
| `turnstile.enabled` | auto: `NUXT_PUBLIC_TURNSTILE_SITE_KEY` set | `false` |

Turnstile verification reuses whatever `@nuxtjs/turnstile` itself is configured
with (`runtimeConfig.turnstile.secretKey` / `NUXT_TURNSTILE_SECRET_KEY`) — no
separate credential to set up. The honeypot field needs no configuration and
is always active.

### Mautic

Mautic's own "embed code" for a form (Settings → Forms → your form → Embed)
is a self-contained snippet — its own HTML, its own `mautic-form.js`, posted
straight from the browser to Mautic. The `mautic` provider doesn't use that
snippet; it reproduces the same request (`POST {baseUrl}/form/submit?formId=…`,
the `mauticform[…]` field names its embed code uses) from the server instead,
so sign-ups keep going through `<MeeoviNewsletter>` — same styling, the
honeypot, optional Turnstile — rather than Mautic's unstyled default form.
No credentials needed: Mautic's form-submit endpoint is public by design (an
embeddable form has to be), so `baseUrl` + `formId` (read off the embed code)
are all that's required:

```
NEWSLETTER_PROVIDER=mautic
NEWSLETTER_MAUTIC_URL=https://marketing.example.com
NEWSLETTER_MAUTIC_FORM_ID=1
NEWSLETTER_MAUTIC_FORM_NAME=newsletter
```

One trade-off: because this posts from the server rather than the visitor's
own browser, Mautic's page-tracking cookie is never set on this contact, so
their pre-signup browsing history won't show up against them in Mautic —
segment/campaign actions attached to the form itself still fire normally.
If you want the literal embed instead (Mautic's own form UI + full page
tracking), skip this provider and paste Mautic's embed code directly into a
page — `<MeeoviNewsletter>` isn't involved at that point.

## Component

```vue
<template>
  <MeeoviNewsletter
    variant="card"
    source="footer"
    @subscribed="onSubscribed"
    @error="onError"
  />
</template>
```

Rich description markup:

```vue
<MeeoviNewsletter>
  <template #description>
    <h5 v-dompurify-html="block.description" />
  </template>
</MeeoviNewsletter>
```

## Composable

```ts
const { email, status, message, pending, subscribe, reset } = useNewsletter({ source: 'checkout' })

await subscribe()                 // uses the reactive `email` ref
await subscribe({ tags: ['vip'] }) // merge extra fields
```

## Adding a provider

```ts
// server/plugins/newsletter-hubspot.ts
import { registerNewsletterProvider } from '@mframework/meeovi-newsletter/providers'

export default defineNitroPlugin(() => {
  registerNewsletterProvider({
    name: 'hubspot',
    async subscribe(input, ctx) {
      await $fetch('https://api.hsforms.com/submissions/v3/integration/submit/…', {
        method: 'POST',
        body: { fields: [{ name: 'email', value: input.email }] },
      })
      return { status: ctx.doubleOptIn ? 'pending' : 'subscribed', provider: 'hubspot' }
    },
  })
})
```

Then set `NEWSLETTER_PROVIDER=hubspot`.

## Endpoint

`POST /api/newsletter/subscribe`

```json
{ "email": "a@b.com", "firstName": "Ada", "source": "footer" }
```

Response: `{ "ok": true, "status": "pending" | "subscribed" | "already_subscribed", "provider": "mailchimp" }`
