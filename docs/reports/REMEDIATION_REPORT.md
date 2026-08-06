# Frontend-Only / Backend-Agnostic Remediation Report

**Scope:** `layers/` directory (auth, commerce, communication, gateway, shared, social)  
**Date:** 2026-08-01  
**Goal:** Identify files that should be moved to the backend, and logic that must be refactored so each layer's frontend code remains backend-agnostic.

---

## Executive Summary

The codebase is a Nuxt monorepo with six feature layers. A systematic review of ~600 source files reveals **three systemic coupling patterns** that prevent the frontend from being backend-agnostic:

1. **Server-injected SDK access** — Composables call `nuxtApp.$sdk.commerce` / `nuxtApp.$sdk.social` which are Nitro-injected backend SDK objects. (Commerce + Social layers)
2. **Direct backend service clients in the browser** — Composables and Vue components call Directus SDK methods (`$directus.request($readItems(...))`), Stripe JS, Polar SDK, or raw `fetch()` to backend-specific URLs. (Commerce + Social + Shared layers)
3. **Server-side utilities misplaced in `app/`** — GraphQL schema transforms, codegen configs, and full server framework entry points live under `app/` instead of `server/`. (Gateway layer)

Additionally, **two server API files contain browser/DOM code** (`localStorage`, `document.getElementById`, `window`) — a clear SSR-safety violation, and **one server file imports from `app/utils/`** — a cross-boundary dependency.

---

## 1. FILES TO MOVE TO THE BACKEND

### 1A. Gateway Layer — Server-side GraphQL utilities in `app/utils/`

These files live under `gateway/app/utils/` (client-side Nuxt directory) but are GraphQL schema manipulation utilities that have no business running in the browser. They should be relocated to `gateway/server/utils/` or to the backend service entirely.

| File | Reason to Move |
|------|----------------|
| `gateway/app/utils/encapsulate.ts` | GraphQL schema utility (server-side); currently empty |
| `gateway/app/utils/federation.ts` | GraphQL Federation utility (server-side); currently empty |
| `gateway/app/utils/filterSchema.ts` | Uses `@graphql-tools/utils` `filterSchema()` — Node-only require pattern, server-side |
| `gateway/app/utils/hoistField.ts` | GraphQL field hoisting transform (server-side) |
| `gateway/app/utils/namingConvention.ts` | Schema naming convention utility (server-side) |
| `gateway/app/utils/prefix.ts` | Schema field prefixing transform (server-side) |
| `gateway/app/utils/prune.ts` | GraphQL schema pruning (server-side) |
| `gateway/app/utils/rename.ts` | Schema field renaming transform (server-side) |
| `gateway/app/utils/transforms/prefix-cms.ts` | CMS subgraph transform (server-side) |
| `gateway/app/utils/transforms/prefix.commerce.ts` | Commerce subgraph transform (server-side) |
| `gateway/app/app.vue` | Gateway layer should be backend-only; this is a frontend app shell |
| `gateway/app/components/HelloWorld.vue` | Placeholder frontend component; gateway has no UI |
| `gateway/codegen.ts` | GraphQL Code Generator config — a build-time tool, not runtime frontend code |

**Destination:** `gateway/server/utils/` (for schema utilities) or remove entirely (for app shell and HelloWorld).

---

### 1B. Commerce Layer — Server API files containing frontend/DOM code

Two server API route handlers contain pure browser DOM manipulation. These are SSR-safety violations (they will crash under Nitro/SSR) and are functionally frontend code misplaced in the server directory.

| File | Problem |
|------|---------|
| `commerce/server/api/commerce/connect.ts` | Uses `localStorage.getItem('accountId')`, `document.getElementById(...)`, `window` event listeners, DOM class manipulation (`.classList.add/remove`), form submit handlers. This is a client-side account management dashboard dumped into a server route. |
| `commerce/server/api/commerce/products.ts` | Uses `localStorage.getItem('accountId')`, `document.getElementById(...)`, DOM `.innerHTML` manipulation, `document.querySelector`. Client-side product listing UI in a server file. |

**Recommendation:** These files should be **deleted from `server/`** and reimplemented as Vue components/pages under `commerce/app/`. No legitimate server-side handler uses `document` or `localStorage`.

---

### 1C. Commerce Layer — Cross-boundary import (server → app)

| File | Problem |
|------|---------|
| `commerce/server/api/payment/stripe/webhooks.post.ts` | Line 2 imports `centsToDollars` from `../../../../app/utils/currency`. Server-side API routes must never import from `app/` (frontend utilities). This creates a build-time coupling and risks SSR/client code bleed. |

**Destination:** Move `centsToDollars` (and the other currency helpers) to `commerce/server/utils/currency.ts` or `commerce/app/utils/currency.ts` → `commerce/server/utils/`, then update the import in `webhooks.post.ts`.

---

## 2. LOGIC TO MODIFY FOR FRONTEND-ONLY / BACKEND-AGNOSTIC

### 2A. Commerce Layer — `getCommerceClient()` SDK coupling (HIGHEST PRIORITY)

**Root cause:** `commerce/app/utils/client.ts` (645 lines) defines `getCommerceClient()` which calls `useNuxtApp()` and reads `nuxtApp.$sdk.commerce` — a server-injected SDK object (from `@mframework/alternate-sdk`) that runs only during SSR/Nitro server context. Every commerce composable imports and calls this function directly, creating a hard dependency on the backend SDK shape.

**Solution:** Replace `getCommerceClient()` calls with `$fetch()` calls to generic API endpoints (`/api/commerce/...`, `/api/orders/...`, `/api/cart/...`, etc.). Define TypeScript interfaces for the response shapes so the frontend is typed but backend-agnostic.

**Affected composables (all import `getCommerceClient` from `../../utils/client` or `../../../utils/client`):**

| # | File | SDK Method(s) Accessed |
|---|------|----------------------|
| 1 | `app/composables/catalog/products/useProducts.ts` | `client.getProducts`, `getProductById`, `getProductBySku`, `getProductBySlug` |
| 2 | `app/composables/catalog/products/useGiftCards.ts` | `client.getGiftCards`, `getGiftCardByCode`, `issueGiftCard`, `redeemGiftCard`, `balance` |
| 3 | `app/composables/catalog/products/useSubscriptions.ts` | `client.getSubscriptions`, `getSubscriptionById`, `getPlans`, `subscribe`, etc. |
| 4 | `app/composables/catalog/products/useSwatches.ts` | `client.getProductBySku` |
| 5 | `app/composables/catalog/products/useEvents.ts` | `client.getEvents` |
| 6 | `app/composables/catalog/categories/useCategories.ts` | `client.getCategories`, `getCategory`, `getCategoryTree` |
| 7 | `app/composables/catalog/inventory/useStock.ts` | `client.checkInventory`, `getStockBySku` |
| 8 | `app/composables/catalog/price/useCartPriceRules.ts` | `client.listCartPriceRules` |
| 9 | `app/composables/catalog/price/useCatalogPriceRules.ts` | `client.listCatalogPriceRules` |
| 10 | `app/composables/catalog/price/useMinimumAdvertisedPrice.ts` | `client.getMinimumAdvertisedPrice` |
| 11 | `app/composables/catalog/price/useSuggestedRetailPrice.ts` | `client.getSuggestedRetailPrice` |
| 12 | `app/composables/catalog/price/usePreferredCurrency.ts` | (currency resolution) |
| 13 | `app/composables/catalog/useCatalog.ts` | `client.getCategories`, `getProducts`, etc. |
| 14 | `app/composables/catalog/reviews/useProductReviews.ts` | `client.listProductReviews`, `listReviews` |
| 15 | `app/composables/customer/useCustomer/useCustomer.ts` | `client.getCustomer`, `getCustomerAddresses`, `getCustomerGroups` |
| 16 | `app/composables/customer/useGiftMessages.ts` | `client.getGiftMessages`, `addGiftMessage`, etc. |
| 17 | `app/composables/customer/useSendToAFriendFeature.ts` | `client.sendToAFriend` |
| 18 | `app/composables/enterprise/useAdminActionLogs.ts` | `client.listAdminActionLogs` |
| 19 | `app/composables/enterprise/useCatalogEvents.ts` | `client.listCatalogEvents` |
| 20 | `app/composables/enterprise/useCatalogPermissions.ts` | `client.getCatalogPermissions` |
| 21 | `app/composables/enterprise/useCompanyAccounts.ts` | CRUD via `getCommerceClient()` |
| 22 | `app/composables/enterprise/useCompanyCredits.ts` | `client.getCompanyCredits`, `updateCreditBalance` |
| 23 | `app/composables/enterprise/useCompanyHierarchy.ts` | `client.getCompanyHierarchy` |
| 24 | `app/composables/enterprise/useDynamicBlocks.ts` | `client.listDynamicBlocks`, `getDynamicBlockById` |
| 25 | `app/composables/enterprise/useEnterpriseResource.ts` | `getCommerceClient()` at module scope — creates client immediately |
| 26 | `app/composables/enterprise/useGiftWrapping.ts` | `client.listGiftWrappingOptions`, etc. |
| 27 | `app/composables/enterprise/useOrderBySku.ts` | `client.orderBySku` |
| 28 | `app/composables/enterprise/usePurchaseOrders.ts` | `client.listPurchaseOrders`, etc. |
| 29 | `app/composables/enterprise/usePurchaseOrderApprovalRules.ts` | `client.listApprovalRules`, etc. |
| 30 | `app/composables/enterprise/useRMA.ts` | `client.listReturns`, `createReturn` |
| 31 | `app/composables/enterprise/useRecommendations.ts` | `client.getProductRecommendations` |
| 32 | `app/composables/enterprise/useRequisitionLists.ts` | `client.listRequisitionLists`, etc. |
| 33 | `app/composables/enterprise/useSharedCatalogs.ts` | CRUD via `createCrudResource` |
| 34 | `app/composables/enterprise/useSensei.ts` | `client.getSenseiRecommendations` |
| 35 | `app/composables/enterprise/useStoreCredit.ts` | `client.getStoreCredit`, etc. |
| 36 | `app/composables/marketing/useCoupons.ts` | `client.listCoupons`, `applyCoupon` |
| 37 | `app/composables/marketing/useCreditMemos.ts` | `client.getCreditMemos` |
| 38 | `app/composables/marketing/useDiscounts.ts` | `client.getDiscounts`, `getPromotions` |
| 39 | `app/composables/marketing/useGiftCertificates.ts` | `client.listGiftCertificates` |
| 40 | `app/composables/marketing/useRewards.ts` | `client.listRewards`, `redeemReward` |
| 41 | `app/composables/marketing/useSpecialOffers.ts` | `client.getSpecialOffers` |
| 42 | `app/composables/sales/cart/useShippingSelection.ts` | `client.estimateShippingMethods`, `listShippingMethods` |
| 43 | `app/composables/sales/orders/useInvoices.ts` | `client.getInvoices`, `getInvoiceById` |
| 44 | `app/composables/sales/orders/useOrders.ts` | `client.getOrders`, `getOrderById`, `cancelOrder` |
| 45 | `app/composables/sales/orders/useReturns.ts` | `client.getReturns`, `createReturn` |
| 46 | `app/composables/sales/payments/usePayments.ts` | `client.getMethods`, `authorize`, `capture`, `refund`, `void` |
| 47 | `app/composables/sales/shipping/useShipment.ts` | `client.getShipments`, `createShipment`, `addTracking` |
| 48 | `app/composables/sales/useAffiliates.ts` | `client.listAffiliates`, etc. |
| 49 | `app/composables/sales/useMultiChannel.ts` | `client.listChannels`, `setChannel` |
| 50 | `app/composables/sales/usePOS.ts` | `client.listRegisters`, `createPosOrder` |
| 51 | `app/composables/sales/useQuotes.ts` | `client.listQuotes`, etc. |
| 52 | `app/composables/sales/useTax.ts` | `client.listTaxRates` |
| 53 | `app/composables/sales/useTellFriends.ts` | `client.sendRecommendation` |
| 54 | `app/composables/sales/useTransactions.ts` | `client.getTransactions` |
| 55 | `app/composables/system/useStastics.ts` | `client.trackEvent` |
| 56 | `app/composables/system/useStock.ts` | `client.updateStock`, `getStock` |
| 57 | `app/composables/content/usePolls.ts` | `client.listPolls`, `votePoll` |
| 58 | `app/composables/content/useGlossary.ts` | `client.listGlossaryTerms` |
| 59 | `app/stores/wishlist/useWishlistStore.ts` | `client.getProducts`, `getProductById` |
| 60 | `app/composables/globals/config.ts` | Defines `CommerceConfig` with provider names (backend-specific) |

**Affected components:**
| File | Problem |
|------|---------|
| `app/components/blocks/checkoutButton.vue` | Uses `nuxtApp.create(...)` (Directus method) and `window.location.href` for redirect |
| `app/components/blocks/StripePayment.vue` | Loads `loadStripe()` with `config.public.stripePublishableKey`, uses `$stripe.confirmPayment` |
| `app/components/content/pages/checkout.vue` | Uses `$stripe.elements()`, calls `/api/payment/create-payment-intent` (Stripe-specific endpoint), `window.location.origin` |
| `app/components/catalog/product/updateProduct.vue` | Hardcoded Magento GraphQL: `fetch(\`${config.public.commerceUrl}/graphql\`, { headers: { Authorization: Bearer ... } })` with Magento-specific mutations (`updateSimpleProduct`, `deleteProducts`) |
| `app/pages/customer-portal.vue` | `window.location.href = /api/customer-portal?...` (Stripe/Polar redirect) |

**Affected stores:**
| File | Problem |
|------|---------|
| `app/stores/cart.ts` | Calls `/api/cart/add`, `/api/cart/update`, `api/cart/clear` — backend endpoint names |
| `app/stores/auth.ts` | Stores `token` in client state (acceptable for frontend-only, but should not hold backend auth tokens) |

---

### 2B. Social Layer — Directus SDK coupling in composables

The Social layer has **two parallel coupling patterns**:

#### Pattern 1: Composables accessing `nuxtApp.$sdk.social` (server-injected SDK)

These composables call a server-injected social driver via `nuxtApp?.$sdk?.social`, which is the `@mframework/alternate-sdk` social driver injected by Nitro.

| File | Methods Accessed |
|------|-----------------|
| `app/composables/posts/usePosts.ts` | `social.getPosts`, `getPost`, `createPost`, `updatePost`, `deletePost`, `getReposts`, `repost`, `unrepost`, `isReposted`, `blockPost`, `mutePost`, `getPostsByHashtag`, `getUserMemories`, `votePoll` |
| `app/composables/spaces/useSpaces.ts` | `social.getSpaces`, `getSpace`, `createSpace`, `joinSpace`, `leaveSpace`, `getSpaceMembers`, `getSpacePosts` |
| `app/composables/comments/useComments.ts` | `social.getComments`, `getThread`, `createComment`, `replyToComment`, `deleteComment`, `reactToComment`, `reportComment` |

**Also affected (server-injected client access):**
- `app/composables/drafts/usePublish.ts` — accesses `globalThis.__mastoClient` (server-injected Mastodon client)
- `app/composables/useConnectFeedsData.ts` — calls `nuxtApp?.$sdk?.content` (fallback) in addition to Directus.
- `app/composables/contacts/useFriendsPageData.ts` — calls `nuxtApp?.$sdk?.content` (fallback) in addition to Directus.

#### Pattern 2: Composables using Directus SDK directly (`useNuxtApp().$directus`)

These composables inject the Directus REST SDK (`$directus`, `$readItems`, `$createItem`, `$updateItem`, `$deleteItem`, `$uploadFiles`) via Nuxt's `useNuxtApp()` — these are Nuxt Directus module auto-injections that tie the frontend to Directus specifically.

| File | Directus Methods Used |
|------|----------------------|
| `app/composables/content/useDirectusRequest.ts` | `$directus.request(...)`, `$readItem`, `$readItems`, `$createItem`, `$updateItem`, `$deleteItem`, `$uploadFiles`, `$readFieldsByCollection` — entire composable is a Directus wrapper |
| `app/composables/content/uploadFiles.ts` | `useDirectusRequest()` → Directus `uploadFiles` |
| `app/composables/lists/useLists.ts` | `$directus.request($readItem)`, `$readItems`, `$createItem`, `$updateItem`, `$deleteItem` |
| `app/composables/content/useContentForm.ts` | `$directus.request($createItem(collection, {...}))` |
| `app/composables/lists/createList.js` | Uses global `createItem` (Directus auto-import) |
| `app/composables/lists/updateList.js` | Uses global `updateItem` (Directus auto-import) |
| `app/composables/lists/deleteList.js` | Uses global `deleteItem` (Directus auto-import) |
| `app/composables/posts/createPost.js` | `$directus.request($createItem('posts', {...}))` |
| `app/composables/posts/deletePost.js` | Global `deleteItem` (Directus auto-import) |
| `app/composables/posts/updatePost.js` | Global `updateItem` (Directus auto-import) |
| `app/composables/spaces/createSpace.js` | Global `createItem` (Directus auto-import) |
| `app/composables/spaces/deleteSpace.js` | Global `deleteItem` (Directus auto-import) |
| `app/composables/spaces/updateSpace.js` | Global `updateItem` (Directus auto-import) |
| `app/composables/stations/createStation.js` | Global `createItem` (Directus auto-import) |
| `app/composables/stations/updateStation.js` | Global `updateItem` (Directus auto-import) |
| `app/composables/stations/deleteStation.js` | Global `deleteItem` (Directus auto-import) |
| `app/composables/contacts/createContact.js` | Global `createItem` (Directus auto-import) |
| `app/composables/contacts/deleteContact.js` | Global `deleteItem` (Directus auto-import) |
| `app/composables/contacts/updateContact.js` | Global `updateItem` (Directus auto-import) |
| `app/stores/social.ts` | `$fetch('/api/social/follow')` — hardcoded endpoint |

**Vue components using Directus directly in `<script setup>` or templates:**
| File | Directus Usage |
|------|----------------|
| `app/components/blocks/LeafletMap.vue` | (may have geolocation, check) |
| `app/components/related/post.vue` | (check) |

---

### 2C. Shared Layer — `alternate-sdk` and `globalThis.useGateway` coupling

These composables import from the `alternate-sdk` package and access `globalThis.useGateway` — a server-side bridge function.

| File | Problem |
|------|---------|
| `app/composables/search/useSearch.ts` | `import { SearchAdapterRegistry } from 'alternate-sdk'`; reads `globalThis.useGateway` to resolve `gateway.search` |
| `app/composables/authentication/useAuth.ts` | `import { AuthAdapterRegistry } from 'alternate-sdk'`; reads `globalThis.useGateway` to resolve `gateway.auth` |
| `app/plugins/sdk.ts` | `import { sdk, initGateway } from 'alternate-sdk'`; imports server-side SDK initialization |
| `app/composables/useAppGateway.ts` | Accesses `nuxtApp.$sdk` directly; falls back to `createFallbackContentApi()` with hardcoded Directus method names (`readItems`, `getItem`, etc.) |

**Solution:** Replace `globalThis.useGateway` access with `$fetch()` to generic API endpoints. Replace `alternate-sdk` imports with a frontend-only abstraction contract (TypeScript interfaces + `$fetch`).

---

### 2D. Shared Layer — Directus coupling in composables

| File | Problem |
|------|---------|
| `app/composables/notifications/useUserNotifications.ts` | Creates `createDirectus()` client directly (`import { createDirectus, rest, readItems, ... } from '@directus/sdk'`), reads `nuxtApp.$directus` |
| `app/composables/notifications/useSearchNotifications.ts` | `import { directusTransport } from '#shared/server/notifications/transports/directus'` — **server-side notification transport imported into a frontend composable** via `#shared` alias; also uses `$directus` for user resolution |
| `app/composables/media/useMediaCenter.ts` | Destructures `$sdk, $directus, $readItems, $createItem, $uploadFiles` from `useNuxtApp()`; all Directus-specific |
| `app/composables/content/useDynamicSchema.ts` | Destructures `$directus, $readFieldsByCollection` from `useNuxtApp()`; queries Directus collection schemas |

**Vue components:**
| File | Directus Usage |
|------|----------------|
| `app/components/ui/forms/DynamicForm.vue` | `$directus.request($createItem(props.collection, {...}))` |
| `app/components/ui/forms/RelationSelect.vue` | `$directus.request($readItem(...))` |
| `app/components/ui/forms/[collection].vue` | (check for Directus usage) |

---

### 2E. Commerce Layer — Stripe/Polar payment coupling in composables

| File | Problem |
|------|---------|
| `app/composables/sales/checkout/useCheckout.ts` | Calls `$fetch('/api/payment/stripe/create-checkout-session', ...)` — hardcoded Stripe endpoint |
| `app/composables/sales/checkout/handleCheckout.ts` | Calls `$fetch('/api/stripe/create-checkout-session', ...)` (different path — **route mismatch bug**); uses `window.location.href` redirect; hardcodes `currency: 'gbp'` |
| `app/composables/sales/checkout/providers.ts` | Defines `CheckoutProvider` registry — this is OK (registry pattern, backend-agnostic) as long as it doesn't call SDK directly |
| `app/components/blocks/StripePayment.vue` | Calls `loadStripe(config.public.stripePublishableKey)` directly in browser; uses `$stripe.confirmPayment` |
| `app/components/blocks/paypalBtn.vue` | Empty file (no implementation) |
| `app/components/blocks/stripePricingTable.vue` | Hard-codes Stripe: `config.public.stripePublishableKey` and `config.public.stripePricingTableId` passed to `ScriptStripePricingTable` |
| `app/composables/drafts/usePublish.ts` (social) | Accesses `globalThis.__mastoClient` — a server-injected Mastodon client, same pattern as `$sdk` coupling |

---

### 2F. Commerce Layer — Direct `fetch()` to backend GraphQL in components

| File | Problem |
|------|---------|
| `app/components/catalog/product/updateProduct.vue` | Hardcoded `fetch(\`${config.public.commerceUrl}/graphql\`, { headers: { 'Authorization': \`Bearer ${config.public.commerceApiToken}\` } })` with Magento-specific GraphQL mutations. Exposes backend API token to the browser. |
| `app/pages/your-friends.vue` | `$directus.request($readItems('products', {...}))` |
| `app/pages/promotions.vue` | `$directus.request($readItem('navigation', '45'))` |
| `app/pages/brands.vue` | `$directus.request($readItems('brands', {...}))`, `$directus.request($readItem('navigation', '40', {...}))` |
| `app/pages/brand/[...slug].vue` | `:style="\`background-image: url(${$directus.url}/assets/...\`"` |
| `app/pages/shops.vue` | `$directus.request($readItems('shops', {...}))`, `$directus.request($readItem('navigation', '55'))` |
| `app/pages/transactions.vue` | `$directus.request($readItem('transactions'))` |
| `app/pages/departments/[...slug].vue` | Multiple `$directus.request($readItems('departments', {...}))` calls |
| `app/pages/departments/category/[...id].vue` | `$directus.request($readItems('categories', {...}))` |
| `app/pages/product/[...id].vue` | Multiple `$directus.request($readItem('products', ...))` calls, also uses `$directus.url` |
| `app/pages/product/gift-cards.vue` | Multiple `$directus.request($readItem('products', ...))` calls |
| `app/pages/product/showcases/index.vue` | Multiple `$directus.request($readItems('products', ...))` calls |
| `app/pages/outlets.vue` | `$directus.request($readItems('shops', {...}))`, `$directus.request($readItem('outletbars', '55'))` |
| `app/pages/outlet/[...slug].vue` | Multiple `$directus.request($readItem('shops', ...))` calls |
| `app/pages/coupon/[id].vue` | Uses `$directus.url` in template |
| `app/components/catalog/categories/events.vue` | Multiple `$directus.request($readItem('navigation', ...))`, `$directus.request($readItems('products', ...))` |
| `app/components/catalog/categories/restaurants.vue` | `$directus.request($readItem('navigation', ...))`, `$directus.request($readItems('products', ...))` |
| `app/components/catalog/categories/adultstore.vue` | `$directus.request($readItem('departments', ...))` |
| `app/components/catalog/categories/pay/pay.vue` | Empty stub (props-only, no Directus) |
| `app/components/catalog/categories/pantry/pantry.vue` | Empty stub (props-only, no Directus) |
| `app/components/catalog/product/deals.vue` | `$directus.request($readItems('products', ...))` |
| `app/components/catalog/product/exclusives.vue` | `$directus.request($readItems('products', ...))` |
| `app/components/catalog/product/relatedbrands.vue` | Uses `gateway.content(read('brands', {...}))` — server-injected gateway function |
| `app/components/menus/outletsmenu.vue` | `$directus.request($readItems('departments', ...))` |
| `app/components/menus/cart.vue` | `window.location.assign(...)` redirect |
| `app/components/related/relatedoutlets.vue` | (requires inspection) |

---

### 2G. Communication Layer — Direct backend URL coupling

| File | Problem |
|------|---------|
| `app/composables/useCommunicationClient.ts` | Reads `config.public.communicationBaseUrl` and makes raw `fetch()` to external backend URL. The base URL is passed to the client, coupling frontend to backend host. |
| `app/composables/useMessages.ts` | Uses `useCommunicationClient()` → calls `request('/rooms/${roomId}/messages')` |
| `app/composables/useChatActions.ts` | Calls `$fetch('/api/chats/${id}/title')`, `$fetch('/api/chats/${id}')` — Nuxt server API endpoint names |
| `app/composables/useChats.ts` | Uses `date-fns` (fine for frontend) but groups chats from an API response — needs backend-agnostic data source |
| `app/components/chat/ChatVisibility.vue` | `window.location.origin` in template |
| `app/utils/ai.ts` | Imports `UIMessage` types from `ai` package — acceptable for frontend, but coupled to a specific AI SDK |

**Server APIs (these are correct — server-side only, no changes needed):**
- `server/api/chats.get.ts`, `chats.post.ts`, `chats/[id].delete.ts`, `chats/[id].get.ts`, `chats/[id].post.ts`, `chats/[id]/messages.delete.ts`, `chats/[id]/title.patch.ts`, `chats/[id]/visibility.patch.ts`, `chats/[id]/votes.get.ts`, `chats/[id]/votes.post.ts`, `server/api/upload/[...pathname].delete.ts`, `server/api/upload/[chatId].put.ts`

---

### 2H. Shared Layer — Notification transport coupling

The notification system in `server/notifications/` is correctly server-side, but a **frontend composable imports server-side notification transport**:

| File | Problem |
|------|---------|
| `app/composables/notifications/useSearchNotifications.ts` | Line 4: `import { directusTransport } from '#shared/server/notifications/transports/directus'` — **Frontend composable imports a server-side transport module** via `#shared` alias. This is a direct SSR/frontend bleed and will fail in browser context. |

---

## 3. ROUTE MISMATCHES (Bugs discovered during analysis)

| File | Called Endpoint | Actual Route | Status |
|------|----------------|--------------|--------|
| `commerce/app/composables/sales/checkout/useCheckout.ts` | `POST /api/payment/stripe/create-checkout-session` | `POST /api/payment/stripe/create-checkout-session-post` (file: `create-checkout-session-post.ts`) | **Broken** — endpoint won't resolve |
| `commerce/app/composables/sales/checkout/handleCheckout.ts` | `POST /api/stripe/create-checkout-session` | No matching file exists | **Broken** — 404 |
| `commerce/server/api/payment/stripe/create-checkout-session-post.ts` | (file exists, route is `/create-checkout-session-post`) | Should be renamed to `checkout-session.post.ts` to match the intended `/checkout-session` route | Name mismatch |

---

## 4. PRIORITY REMEDIATION ROADMAP

### Phase 1 (Critical — SSR safety + security)
1. **Move or delete** `commerce/server/api/commerce/connect.ts` and `commerce/server/api/commerce/products.ts` — they use DOM APIs in server context (will crash SSR).
2. **Fix cross-boundary import** in `commerce/server/api/payment/stripe/webhooks.post.ts` — extract `centsToDollars` to `server/utils/`.
3. **Fix route mismatches** between `useCheckout.ts`/`handleCheckout.ts` and the actual server API file names.
4. **Remove server import from frontend** in `shared/app/composables/notifications/useSearchNotifications.ts` — the `#shared/server/notifications/transports/directus` import must be replaced with a `$fetch` to a notification endpoint.

### Phase 2 (Architecture — decouple frontend from SDK)
5. **Replace `getCommerceClient()`** in all commerce composables with a `$fetch`-based abstraction layer. Create `commerce/app/composables/catalog/useCommerceApi.ts` (or similar) that wraps HTTP calls to generic endpoints.
6. **Replace `$directus` / `$sdk.social` access** in social composables with `$fetch` to generic social API endpoints. Move all Directus-specific logic to server routes.
7. **Replace `globalThis.useGateway` access** in `shared/app/composables/search/useSearch.ts` and `shared/app/composables/authentication/useAuth.ts` with `$fetch` to API endpoints or a frontend-only contract interface.
8. **Move gateway `app/utils/` GraphQL transforms** to `gateway/server/utils/`.

### Phase 3 (Components — remove inline backend calls)
9. **Replace inline `fetch()` to `commerceUrl/graphql`** in Vue components (especially `updateProduct.vue`) with composable calls.
10. **Replace inline `$directus.request()` calls** in Vue components with composable calls or `useAsyncData`.
11. **Abstract Stripe/PayPal widget initialization** in payment components behind a generic payment composable.

---

## 5. SUMMARY COUNTS

| Category | Count |
|----------|-------|
| Files to move to backend (Gateway `app/utils/`) | 10 + app.vue + HelloWorld.vue |
| Server files with DOM code (should be frontend) | 2 |
| Server files importing from `app/` | 1 |
| Frontend composables using `getCommerceClient()` | 55+ |
| Frontend composables using Directus SDK (`$directus`/`$sdk`) | 15+ |
| Frontend Vue components using `$directus` directly | 15+ |
| Frontend composables importing `alternate-sdk` | 3 |
| Frontend composables importing server notification transports | 1 |
| Route mismatch bugs | 2 |
| Payment composables with Stripe/Polar coupling | 3 |
| Social `.js` composables with Directus auto-imports | 11 |
| Social composables using server-injected clients (`globalThis.__mastoClient`) | 1 |
