# @mframework/meeovi-polar

[Polar](https://polar.sh) payments for M Framework, as a Nuxt module: hosted
checkout, the customer portal, a product list, and signed webhooks handed to
your code through a Nitro hook.

Polar hosts the payment pages, so the module only creates checkouts and
portal sessions and verifies what Polar sends back. Nothing is stored: a
Polar customer is matched to your user by Polar's **external id**, which is
always your user's id.

## What you get

| Route | Who | What it does |
| --- | --- | --- |
| `GET /api/polar/checkout?products=<slug or id>[,…]` | signed in | Redirects (303) to Polar's checkout for those products, for the signed-in user's email and id |
| `GET /api/polar/checkout/:id` | anyone | `{ id, status, product }` for the success page; no buyer details |
| `GET /api/polar/products` | anyone | The products you sell, with prices (cached 60 s) |
| `GET /api/polar/portal` | signed in | Redirects (303) to Polar's customer portal; 404 if the user has never bought anything |
| `POST /webhook/polar` | Polar | Verifies the signature and calls the `polar:webhook` hook |

Plus `usePolarCheckout()`, auto-imported in the app.

## Install

The module lives in this monorepo and is consumed from source; there's no build
step.

1. Add it to the app's dependencies and register it in `nuxt.config.ts`:

   ```jsonc
   // package.json
   "@mframework/meeovi-polar": "file:../../../packages/plugins/Payments/meeovi-polar"
   ```

   ```ts
   // nuxt.config.ts
   export default defineNuxtConfig({
     modules: ['@mframework/meeovi-polar'],
   })
   ```

2. Run `npm install` at the repository root.
3. Set the environment variables below.
4. In Polar, go to **Settings → Webhooks**, add `https://<your site>/webhook/polar`, and copy its secret into `NUXT_MEEOVI_POLAR_WEBHOOK_SECRET`. Subscribe only to the events you handle.

The routes find the signed-in user through better-auth's
`/api/auth/get-session`, so the app needs the auth layer or another route that
answers the same way. See `sessionEndpoint` under [Options](#options).

## Configuration

Credentials are server-only and never reach the client bundle.

| Variable | Default | |
| --- | --- | --- |
| `NUXT_MEEOVI_POLAR_ACCESS_TOKEN` | — | An organization access token, from Polar's **Settings → Developers**. Without it, the API routes answer 503 |
| `NUXT_MEEOVI_POLAR_SERVER` | `sandbox` | `production` for live payments. Sandbox and production need their own tokens |
| `NUXT_MEEOVI_POLAR_WEBHOOK_SECRET` | — | The webhook's signing secret. Without it, the webhook answers 503 |
| `NUXT_MEEOVI_POLAR_SUCCESS_URL` | `/` | Where Polar sends the buyer after paying. Add `?checkout_id={CHECKOUT_ID}` to read the status on that page |
| `NUXT_MEEOVI_POLAR_RETURN_URL` | `/` | The back button in checkout and the portal |
| `NUXT_PUBLIC_SITE_URL` | request origin | Relative URLs are made absolute on this. Set it behind a proxy, or links may come out as `http://` |

The names the app used before this module still work as fallbacks:
`NUXT_POLAR_ACCESS_TOKEN`, `NUXT_POLAR_SERVER`, `NUXT_POLAR_WEBHOOK_SECRET` and
`POLAR_SUCCESS_URL`.

### Options

Anything can also be set in `nuxt.config.ts`. The environment variables
above override it at runtime.

```ts
export default defineNuxtConfig({
  modules: ['@mframework/meeovi-polar'],
  meeoviPolar: {
    // Only these products can be checked out, by slug or id.
    // Leave it out to allow any product of the organization.
    products: {
      'pro-monthly': '<polar product id>',
      'pro-yearly': '<polar product id>',
    },
    successUrl: '/success?checkout_id={CHECKOUT_ID}',
    apiBase: '/api/polar',         // prefix of the API routes
    webhookPath: '/webhook/polar', // the URL you give Polar
    sessionEndpoint: '/api/auth/get-session',
    enabled: true,                 // false registers nothing
  },
})
```

## Taking payment

From any page:

```vue
<script setup lang="ts">
const polar = usePolarCheckout()
const { data: products } = await useAsyncData('polar-products', () => polar.products())
</script>

<template>
  <button v-for="product in products" :key="product.id" @click="polar.checkout(product.id)">
    {{ product.name }}
  </button>
  <button @click="polar.portal()">Manage billing</button>
</template>
```

A plain link works too: `<a href="/api/polar/checkout?products=pro-monthly">`.
A signed-out visitor gets a 401, so send them to sign in first.

On the success page:

```ts
const checkoutId = String(useRoute().query.checkout_id ?? '')
const { data: checkout } = await useAsyncData('polar-checkout', () => usePolarCheckout().status(checkoutId))
// checkout.value.status: 'open' | 'confirmed' | 'succeeded' | 'failed' | 'expired'
```

The success page is for display only. Grant access from the webhook, because
the buyer can close the tab before it loads.

## Handling webhooks

Add a Nitro plugin in the app or any layer. The payload is the Polar SDK's typed
event, so `payload.type` narrows `payload.data`:

```ts
// server/plugins/polar.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('polar:webhook', async (payload) => {
    switch (payload.type) {
      case 'order.paid': {
        // Your user id; null for a customer created outside the app (e.g. in Polar's dashboard).
        const userId = payload.data.customer.externalId
        if (userId && payload.data.productId) await grantAccess(userId, payload.data.productId, payload.data.id)
        break
      }
      case 'subscription.revoked': {
        const userId = payload.data.customer.externalId
        if (userId) await revokeAccess(userId, payload.data.productId)
        break
      }
    }
  })
})
```

How the endpoint answers:

| Case | Status | Polar |
| --- | --- | --- |
| Verified and every listener finished | 202 | Done |
| A listener threw | 500 | Retries |
| A known type the SDK can't parse | 500 | Retries until `@polar-sh/sdk` is updated; the event isn't lost |
| Signed, but a type this SDK doesn't know | 202 (`handled: false`) | Done; logged and ignored |
| Bad or missing signature | 403 | — |
| No webhook secret configured | 503 | Retries |

Because Polar retries, a listener can see the same event more than once. Make
it idempotent, keyed on the object's id (for example the order id).

## Server helpers

For your own routes, import from `@mframework/meeovi-polar/server`:

```ts
import { usePolar, requirePolarUser } from '@mframework/meeovi-polar/server'

export default defineEventHandler(async (event) => {
  const user = await requirePolarUser(event) // 401 when signed out
  const { result } = await usePolar(event).subscriptions.list({ externalCustomerId: user.id, active: true })
  return result.items.map((subscription) => ({ id: subscription.id, product: subscription.product.name }))
})
```

| Export | |
| --- | --- |
| `usePolar(event)` | The configured `Polar` client from `@polar-sh/sdk` (503 without a token) |
| `polarUser(event)` / `requirePolarUser(event)` | The signed-in user `{ id, email, name }`, or null / a 401 |
| `polarConfig(event)` | The resolved configuration |
| `resolveProducts(event, value)` | Product ids from a `?products=` value, checked against `products` |
| `absoluteUrl(event, url)` | A relative URL made absolute on the site |
| `polarError(error, action)` | Rethrows a Polar API error as 404, 400 or 502, without Polar's details |

## Errors

The routes answer with h3 errors. Polar's own error details are logged
server-side, never returned.

| Status | When |
| --- | --- |
| 400 | No or malformed product or checkout id, or Polar refused the request |
| 401 | Checkout or portal while signed out |
| 404 | An unknown product (with `products` set), checkout or portal customer |
| 502 | Polar is unreachable or failed |
| 503 | No access token or webhook secret configured |

## Development

```bash
cd packages/plugins/Payments/meeovi-polar
npx vitest run     # route and webhook tests, with signed test events
npx tsc --noEmit   # type-check
```

Test against Polar's sandbox (`NUXT_MEEOVI_POLAR_SERVER=sandbox`, a sandbox
token from sandbox.polar.sh). For webhooks on a local machine, expose the dev
server with a tunnel and add its URL as a sandbox webhook.

## Extending

- **New events:** handle more `payload.type`s in your `polar:webhook`
  listener; the module needs no change.
- **New routes:** use the server helpers above in your own handlers.
- **Upgrading the SDK:** bump `@polar-sh/sdk`. New event types are then parsed
  and typed. Until then, they're accepted and ignored.
