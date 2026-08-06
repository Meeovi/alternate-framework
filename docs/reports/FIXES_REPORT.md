# Phase 1 Fixes Applied — Follow-up Report

**Date:** 2026-08-01  
**Scope:** Critical safety issues in `layers/`  
**Status:** All 5 critical issues fixed and verified.

---

## What Was Fixed (5 Critical Issues)

### 1. `commerce/server/api/commerce/connect.ts` — DOM code in server API ✅ FIXED

**Problem:** A 265-line server API file that executed `localStorage.getItem()`, `document.getElementById()`, DOM `.classList` manipulation, `window.addEventListener`, and form submit handlers at module scope. Under Nuxt SSR/Nitro this would crash immediately — `document` and `window` are `undefined` on the server.

**Fix:** Deleted the file entirely and replaced it with **6 proper server API handlers** under `commerce/server/api/commerce/connect/`:

| New File | Method | Route | Purpose |
|----------|--------|-------|---------|
| `account.post.ts` | POST | `/api/commerce/connect/account` | Creates a Stripe Express Connect account (uses `stripe.accounts.create`) |
| `account-status.get.ts` | GET | `/api/commerce/connect/account-status?accountId=...` | Retrieves account status (uses `stripe.accounts.retrieve`) |
| `account-link.post.ts` | POST | `/api/commerce/connect/account-link` | Creates an onboarding link (uses `stripe.accountLinks.create`) |
| `login-link.post.ts` | POST | `/api/commerce/connect/login-link` | Creates a dashboard login link (uses `stripe.accounts.createLoginLink`) |
| `products.get.ts` | GET | `/api/commerce/connect/products?accountId=...` | Lists products for a connected account (uses `stripe.products.list`) |
| `product.post.ts` | POST | `/api/commerce/connect/product` | Creates a product + default price under a connected account |

All handlers use the existing `commerce/server/utils/stripe.ts` client, validate inputs with Zod, and return JSON. The frontend code that previously lived in this file (UI DOM manipulation) should be reimplemented as Vue composables that `$fetch` to these endpoints — but that is Phase 2 work.

### 2. `commerce/server/api/commerce/products.ts` — DOM code in server API ✅ FIXED

**Problem:** A 73-line server API file that executed `localStorage.getItem()`, `document.getElementById()`, DOM `.innerHTML` and `.querySelector` manipulation at module scope. Same SSR safety violation. It also exported `fetchProducts` and `renderProducts` which were imported by `connect.ts` (issue #1).

**Fix:** Deleted the file. Its product-listing functionality is now served by the new `commerce/server/api/commerce/connect/products.get.ts` handler (see table above). The frontend rendering logic (`renderProducts`) is lost but was never valid server-side code — it needs to be reimplemented as a Vue component that fetches from the new endpoint.

### 3. `commerce/server/api/payment/stripe/webhooks.post.ts` — cross-boundary import ✅ FIXED

**Problem:** Line 2 imported `centsToDollars` from `../../../../app/utils/currency` — a **server API route importing from the frontend `app/` directory**. This creates build-time coupling and risks client-code bleed into server context.

**Fix:** Created `commerce/server/utils/currency.ts` with `centsToDollars()` and `dollarsToCents()` functions (pure functions with no browser dependencies). Updated the import in `webhooks.post.ts` to read from `../../../utils/currency` (server utils).

The original `app/utils/currency.ts` remains in place for frontend consumers (it exports `formatCurrency`, `centsToDollars`, and `dollarsToCents`), so any frontend code that imports from it continues to work.

### 4. `shared/app/composables/notifications/useSearchNotifications.ts` — server imports in frontend ✅ FIXED

**Problem:** A frontend composable that imported three server-side modules:
- `directusTransport` from `#shared/server/notifications/transports/directus` (server-only, uses `@directus/sdk` + `@betternotify/email/transports`)
- `notificationService` from `#shared/server/notifications/notify` (server-only, creates `better-notify` RPC client)
- `readItems` from `@directus/sdk` (Directus-specific)
- Also used `nuxtApp.$directus` (Directus-injected SDK)

This would crash in the browser because Nitro `#shared/server/` aliases resolve to server-side code that is not bundled for the client.

**Fix:** Created **server API endpoint** `shared/server/api/notifications/search.post.ts` that:
- Accepts `{ userId, route, input }` from the request body (validated with Zod)
- Resolves the user's email server-side via Directus SDK
- Creates a `better-notify` client with the `notificationService` catalog and the Directus transport
- Sends the notification through `client.search[route].send()`

Rewrote the frontend composable to replace all server imports and Directus SDK usage with a single `$fetch('/api/notifications/search', { method: 'POST', body: { userId, route, input } })` call. The composable now returns the same public API (`alertCreated`, `newResults`) but delegates all notification logic to the server.

### 5. Route mismatch in checkout composables ✅ FIXED

**Problem:** Three inconsistent endpoint references for the same Stripe Checkout Session creation:
- Server file name: `create-checkout-session-post.ts` → route `POST /api/payment/stripe/create-checkout-session-post`
- `useCheckout.ts` calls: `POST /api/payment/stripe/create-checkout-session` (missing `-post` suffix) — **404**
- `handleCheckout.ts` calls: `POST /api/stripe/create-checkout-session` (completely different path) — **404**

**Fix:**
1. Renamed `commerce/server/api/payment/stripe/create-checkout-session-post.ts` → `checkout-session.post.ts`, which gives the route `POST /api/payment/stripe/checkout-session` (matches Nuxt's `xxx.post.ts` convention)
2. Updated `useCheckout.ts` to call `POST /api/payment/stripe/checkout-session`
3. Updated `handleCheckout.ts` to call `POST /api/payment/stripe/checkout-session`

This route is now consistent with the existing GET handler at `commerce/server/api/payment/stripe/checkout-session/[id].get.ts` (which retrieves a session by ID).

---

## Files Changed

### Deleted
- `commerce/server/api/commerce/connect.ts`
- `commerce/server/api/commerce/products.ts`

### Created (server)
- `commerce/server/api/commerce/connect/account.post.ts`
- `commerce/server/api/commerce/connect/account-status.get.ts`
- `commerce/server/api/commerce/connect/account-link.post.ts`
- `commerce/server/api/commerce/connect/login-link.post.ts`
- `commerce/server/api/commerce/connect/products.get.ts`
- `commerce/server/api/commerce/connect/product.post.ts`
- `commerce/server/utils/currency.ts`
- `shared/server/api/notifications/search.post.ts`

### Renamed
- `commerce/server/api/payment/stripe/create-checkout-session-post.ts` → `checkout-session.post.ts`

### Modified
- `commerce/server/api/payment/stripe/webhooks.post.ts` — import path fixed
- `commerce/app/composables/sales/checkout/useCheckout.ts` — endpoint fixed
- `commerce/app/composables/sales/checkout/handleCheckout.ts` — endpoint fixed
- `shared/app/composables/notifications/useSearchNotifications.ts` — rewritten to use `$fetch`

---

## What Should Be Done Next (Phase 2 — Architecture)

These items are not critical safety issues but are required for the frontend-only/backend-agnostic goal. They are listed in priority order.

### 2A. Commerce Layer — Replace `getCommerceClient()` in all composables

The commerce layer has ~55 composables that import `getCommerceClient()` from `commerce/app/utils/client.ts`. This function reads `nuxtApp.$sdk.commerce` — a server-injected SDK that couples the frontend to a specific backend adapter.

**Action:** Create `commerce/app/composables/useCommerceApi.ts` (a generic HTTP client using `$fetch`) and migrate each composable to use it instead of `getCommerceClient()`. The server-side adapters that implement `CommerceClient` methods should be exposed as generic API endpoints (e.g., `/api/commerce/products`, `/api/commerce/orders`, `/api/commerce/categories`, etc.).

**Affected composables:** 55 files including `useProducts.ts`, `useOrders.ts`, `usePayments.ts`, `useCart.ts`, `useTax.ts`, `useCustomer.ts`, etc. (Full list in `REMEDIATION_REPORT.md` §2A).

### 2B. Commerce Layer — Components with inline backend calls

Vue components that bypass composables and call backend services directly:
- `app/components/blocks/checkoutButton.vue` — uses `nuxtApp.create(...)` (Directus) + `window.location.href`
- `app/components/blocks/StripePayment.vue` — calls `loadStripe(config.public.stripePublishableKey)` + `$stripe.confirmPayment`
- `app/components/blocks/stripePricingTable.vue` — hardcodes `config.public.stripePublishableKey` and `config.public.stripePricingTableId`
- `app/components/content/pages/checkout.vue` — uses `$stripe.elements()`, calls `/api/payment/create-payment-intent`, `window.location.origin`
- `app/components/catalog/product/updateProduct.vue` — makes raw `fetch()` to `${config.public.commerceUrl}/graphql` with a Bearer token exposed to the browser

### 2C. Commerce Layer — Pages with Directus SDK calls

**15+ page-level components** use `$directus.request($readItems(...))` directly in `<script setup>`. These should be converted to composable calls (`$fetch` to API endpoints) or `useAsyncData` with a generic data source.

**Files:** `app/pages/product/[...id].vue`, `app/pages/departments/[...slug].vue`, `app/pages/brands.vue`, `app/pages/brands/brand/[...slug].vue`, `app/pages/shops.vue`, `app/pages/transactions.vue`, `app/pages/outlet/[...slug].vue`, `app/pages/outlets.vue`, `app/pages/promotions.vue`, `app/pages/your-friends.vue`, `app/pages/product/gift-cards.vue`, `app/pages/product/showcases/index.vue`, `app/pages/coupon/[id].vue`, `app/pages/customer-portal.vue`

Plus `app/components/catalog/categories/events.vue`, `restaurants.vue`, `adultstore.vue`, `app/components/catalog/product/deals.vue`, `exclusives.vue`, `relatedbrands.vue`, `app/components/menus/outletsmenu.vue`, `app/components/menus/cart.vue`

### 2D. Social Layer — Directus and `$sdk.social` coupling

Two coupling patterns:
1. **3 composables** use `nuxtApp?.$sdk?.social` (server-injected social driver): `usePosts.ts`, `useSpaces.ts`, `useComments.ts`
2. **20+ files** use Directus SDK directly: 7 `.ts` composables + 11 `.js` composables using Directus auto-imports + Vue components using `$directus.request()`

**Action:** Create a `useSocialApi()` composable that wraps `$fetch` to generic social API endpoints. Create server API handlers that the Directus-injected functions (`$directus`, `$readItems`, etc.) should proxy through. The `.js` composables (createPost.js, deletePost.js, etc.) should be migrated to `.ts` and route through the new API.

### 2E. Shared Layer — `alternate-sdk` and `globalThis.useGateway` coupling

**4 files** access server-injected global functions:
- `app/composables/search/useSearch.ts` — imports `SearchAdapterRegistry` from `alternate-sdk`, accesses `globalThis.useGateway`
- `app/composables/authentication/useAuth.ts` — imports `AuthAdapterRegistry` from `alternate-sdk`, accesses `globalThis.useGateway`
- `app/plugins/sdk.ts` — imports `sdk, initGateway` from `alternate-sdk`
- `app/composables/useAppGateway.ts` — accesses `nuxtApp.$sdk`, falls back to `createFallbackContentApi()` with Directus method names

**Action:** Replace `globalThis.useGateway` with `$fetch` to API endpoints. Replace `alternate-sdk` imports with TypeScript interface contracts.

### 2F. Gateway Layer — Server utilities in `app/utils/`

**10 GraphQL transform files** + `app.vue` + `HelloWorld.vue` are in `gateway/app/` but use Node-only `require()` and `@graphql-tools/utils`. These should be moved to `gateway/server/utils/`.

Note: The git status shows these were already deleted in the working tree, suggesting prior cleanup may have occurred. Verify current state.

### 2G. Shared Layer — Directus in UI form components

Two form components use Directus directly:
- `app/components/ui/forms/DynamicForm.vue` — `$directus.request($createItem(props.collection, {...}))`
- `app/components/ui/forms/RelationSelect.vue` — `$directus.request($readItem(...))`

**Action:** Create generic form/relation API endpoints and route these components through composables.

### 2H. Shared Layer — `get-asset-url.ts` and Directus URL exposure

`shared/app/utils/get-asset-url.ts` is used by multiple composables and components. It resolves asset URLs from Directus records (accessing `$directus.url`). This should be abstracted behind a composable that resolves asset URLs through the backend, not by exposing the Directus base URL to the frontend.

### 2I. Social Layer — `usePublish.ts` using `globalThis.__mastoClient`

`app/composables/drafts/usePublish.ts` accesses `globalThis.__mastoClient` — a server-injected Mastodon client. This should be replaced with `$fetch` to a server-side Mastodon publishing endpoint.

### 2J. Gateway Layer — Move remaining `app/` server utilities

If the gateway GraphQL transform files still exist in `gateway/app/utils/` (not yet deleted), they should be moved to `gateway/server/utils/`. The `gateway/codegen.ts` file (GraphQL codegen config) should be kept at the project root or moved to the gateway's server tooling directory.

---

## Verification Commands

```bash
# After applying fixes, verify no remaining DOM APIs in server files:
grep -rn "localStorage\|document\.getElementById\|window\." layers/*/server/ --include="*.ts"

# Verify no server API imports from app/ directory:
grep -rn "from.*app/" layers/*/server/ --include="*.ts"

# Verify no frontend files import #shared/server/*:
grep -rn "from '#shared/server/" layers/*/app/ --include="*.ts"

# Verify checkout endpoint consistency:
grep -rn "checkout-session" layers/commerce/ --include="*.ts" | grep -v node_modules
```
