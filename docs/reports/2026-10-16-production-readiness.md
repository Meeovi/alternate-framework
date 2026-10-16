# Production readiness: layers and meeovi-frontend

**Date:** 16 October 2026
**Scope:** `layers/*` and `apps/ecosystem/meeovi-frontend`, checked against the target architecture.
**Deployment path:** meeovi-frontend is tested at demo.meeovicms.com. When it's finished it moves to meeovi.com, with commerce data coming from commerce.meeovicms.com (Mage-OS 3.6.0).

## Summary

| Layer | Target | Where it stands | Ready? |
| --- | --- | --- | --- |
| auth | Built on better-auth | Yes. One better-auth instance with about 30 plugins; Postgres through drizzle. | **Nearly**: trim unused plugins, decide on the SDK auth path |
| search | OpenSearch, with backends swappable through adapters | Yes. OpenSearch is the primary provider; the provider contract and plugin registry work (Algolia, Meilisearch, Typesense). | **Nearly**: per-provider timeouts, move backend-specific providers out of the layer |
| commerce | Backend-agnostic through adapters (adapter-magento) | Partly. Products and categories can come from a backend; cart, checkout, orders and most pages are Directus-specific; two competing abstractions. | **No**: the biggest gap |
| shared | Shared localization, notifications, etc. | Partly. Modules are shared, but localization is barely started and there are two notification systems. | **No**: localization and notifications |
| social | Federation, with AT Protocol and ActivityPub adapters and a Directus fallback | Partly. The federation core and both network plugins exist, but the pages use Directus directly and the networks have no credentials. | **No**: the UI isn't on federation |
| ui-shell | One layout shell for every layer and app | Mostly. Seven layouts and app selection work, but three layers still ship their own layouts. | **Nearly**: remove the duplicate layouts |
| business (workspace) | n/a (not in the brief) | Workspace pages, tables and integrations work; no tests. | **Nearly** |
| meeovi-frontend | Consumes the layers | Builds and runs on the demo; last full production test run had 174 passes and 4 failures. | **Nearly**: commit, retest, CSS and registration clean-up |

**Release blockers** are in the [launch checklist](#launch-checklist) at the end.

---

## auth: built on better-auth

**What's there**
- A single `betterAuth()` instance (`layers/auth/server/utils/auth.ts`) with all plugins in `layers/auth/shared/utils/plugins.ts`. They include:
  - organization, admin roles (comma-separated `auth_role`), two-factor, passkey, magic link, email OTP;
  - SSO, SCIM, API keys, JWT, an OIDC provider (Pixanomy), AT Protocol sign-in, Stripe, Have I Been Pwned, and others.
- Production settings in place:
  - email verification required, rate limits, trusted origins, a 60-second session cookie cache;
  - phone OTP refuses in production instead of logging codes.
- Route middleware (`auth`, `seller`, roles) and the login, register, reset and verify pages are in the layer.
- Production tests: 55 passed, 1 blocked (sign-up email delivery, now fixed).

**Gaps**
1. **A second, unused auth path.**
   - adapter-directus and adapter-magento register auth adapters in alternate-sdk's `AuthAdapterRegistry`, but nothing uses them (the app's `useSdkAuthAdapter` import is commented out).
   - Either delete these registrations or document that better-auth is the only auth.
2. **Plugins with nothing behind them.**
   - SSO, SCIM, generic OAuth, phone number and anonymous sign-in are enabled without a real identity provider, SMS provider or use.
   - Each adds endpoints to the attack surface. Turn off what isn't launching.
3. **Code that isn't auth.**
   - The layer hosts Stripe Connect routes, `/api/notifications/auth` and profile lookups.
   - Stripe Connect belongs in commerce; notifications belong in shared.
4. **Open security items.** These are tracked in the security checklist and are due at the end of the project:
   - rotate keys (JWKS, OAuth client secret, API keys, Directus tokens), then sign out all sessions;
   - restrict the Directus token's role so it can't read the auth tables at all.

## search: OpenSearch, swappable through adapters

**What's there**
- A federated search with a typed `SearchProvider` contract (`server/providers/types.ts`). Results from every enabled provider are merged through `Promise.allSettled`, so a failing backend doesn't break search.
- OpenSearch is the primary provider, on by default (`ALTERNATE_SEARCH_OPENSEARCH_ENABLED`).
- Third-party backends are plugins that register under `Symbol.for('mframework.search.providers')`: `search-algolia`, `search-meilisearch` and `search-typesense`.
- Production tests: 10 of 10 passed.

**Gaps**
1. **No per-provider timeout.** The slowest provider decides the response time. The Postgres provider adds about 1.5 s per search. Wrap each `provider.search()` in a timeout and report timed-out backends in `backends`.
2. **Backend providers built into the layer.** Magento, Directus, AT Protocol, MySQL, Postgres and in-memory providers live in `layers/search/server/providers/`.
   - That's the opposite of "plugged in through adapters".
   - The Magento provider should come from adapter-magento and the AT Protocol one from meeovi-atproto. Keep only OpenSearch, plus memory for tests, in the layer.
3. **Indexing isn't owned by the app.** Directus flows ("Opensearch Create/Update/Delete") write the index; nothing indexes Magento products.
   - Once the catalog is in Magento, either add a Magento → OpenSearch indexer, or let the Magento provider query Magento's own OpenSearch index.
4. **A notifications route that isn't search's.** `/api/notifications/search` belongs in shared (see below).

## commerce: backend-agnostic through adapters

**What's there**
- `CommerceBackendRegistry` (alternate-sdk) has adapter-magento registered on the server and the client.
  - The `$directus` facade sends **GET** requests for `products` and `orders` to the active backend.
  - A category with a backend `uid` lists that backend's products.
- New today:
  - products from a backend are keyed `magento:<sku>` in the cart, checkout and product pages, and priced from the backend;
  - the Stripe webhook records those lines as a Magento order (`placePaidOrder`), so Webkul credits the seller.
- Payments: Stripe Checkout (main), PayPal and Polar.
- Production tests: 20 passed, 1 failed (the `/api/commerce/driver` route, see gap 2).

**Gaps** (the largest of any layer)
1. **Most of the layer is written against Directus.** 53 files call `$directus` / `readItems` directly:
   - 29 products reads, 9 orders reads, plus departments, brands, shops, coupons, transactions and invoices;
   - cart and wishlist use Postgres tables through drizzle;
   - orders, `os_payments` and digital downloads are written to Directus by the webhook.

   The facade only swaps product and order *reads*. Writes, filters and expanded fields (`products.products_id.*`) don't carry over to another backend. As it stands, "swapping the backend" only covers catalog reads.
2. **Two competing abstractions.**
   - `CommerceClient` (`app/utils/client.ts`, about 60 methods) has no registered driver, so `/api/commerce/driver` always returns 503 and its callers silently fall back.
   - `CommerceBackendRegistry` is what actually runs.

   Pick one and delete the other. **Recommendation:** grow the backend contract into a real commerce interface:
   - catalog (by key, list, by category, search);
   - cart (Magento has quote/cart APIs);
   - checkout and paid orders (`placePaidOrder` already exists);
   - customer orders, and refund hooks.

   Then move pages onto composables (`useCatalog`, `useCart`, `useOrders`) instead of `$directus`.
3. **The source of truth for orders.** Today a paid cart writes a Directus order *and*, for Magento lines, a Magento order.
   - Decide where order history lives. Since ecommerce stays in the backend, that should be Magento.
   - Then have the Orders and Order pages read from the backend.
4. **Magento orders reads aren't implemented** (the adapter returns `[]` for `orders`). An admin-scoped "orders by customer" route in `Meeovi_MarketplaceApi` would close this.
5. **Checkout edge cases.**
   - 16 of 60 users have no linked Magento customer and can't buy Magento products; they need a backfill.
   - Stripe tax and discount codes are turned off for backend lines; Magento-side tax needs a decision.
6. **The Meeovi Magento module** is deployed only on commerce.meeovicms.com. The Integration still needs the `Meeovi_MarketplaceApi::external_orders` permission granted.

## shared: shared localization, notifications, etc.

**What's there**
- Shared Nuxt modules: `@nuxtjs/i18n` (`en`, `fr`; `prefix_except_default`), SEO, Image, Turnstile, Leaflet, Scripts, the MCP toolkit.
- Novu notifications, the in-app bell (`triggerNovuWorkflow`).
- The CMS proxy (`/api/cms`) with deny lists and owner scoping, a shared HTML sanitizer, and shared asset helpers.
- Production tests: 30 of 30 passed.

**Gaps**
1. **Localization has barely started.**
   - `en.json` and `fr.json` contain **4 keys** each.
   - **126 of 131 pages** across the layers never call `t()`, so the UI is hard-coded English.
   - The auth layer keeps its own `i18n.json`.

   For launch, either ship English only (and remove the `fr` locale and its routes), or budget a full extraction pass, layer by layer, into `shared/i18n/locales`.
2. **Two notification systems.**
   - Novu (current) runs alongside a `@betternotify` catalog with a Directus transport.
   - The second system is copied into three layers: `/api/notifications/{auth,commerce,search}`.
   - **Bug:** those three routes look the user's email up in `directus_users`, which holds only Directus's own 3 accounts. Every real app user gets a 404, so login alerts never send. It's the same mismatch fixed today for `orders.user_id`.

   Consolidate on Novu with one shared server utility (`notify(userId, workflow, payload)`), and delete the per-layer routes and the Directus transport.
3. **Settings scattered across layers.** Some shared concerns are still configured per layer (for example `nuxt-security` options and CSS). Keep cross-layer config in shared.

## social: federation with AT Protocol and ActivityPub adapters and a Directus fallback

**What's there**
- The federation core in the layer:
  - a `FederationNetwork` contract and a registry under `Symbol.for('meeovi.federation.networks')`;
  - `/api/social/federation[/:network/{profile,feed,search}]`.
- Network plugins: `@mframework/meeovi-atproto` (which also handles AT Protocol sign-in) and `@mframework/meeovi-activitypub`. Both are registered by name.
- Ratings, discussions (Rocket.Chat), lists and list-type integrations (sandboxed).
- Production tests: 22 of 22 passed.

**Gaps**
1. **The UI isn't on federation.** 57 files in the layer talk to Directus directly; only one component uses the federation API. Feeds, posts, profiles and follows are Directus-first.
2. **There's no Directus fallback *inside* the federation.**
   - Directus is the parallel primary store, not a registered `directus` network.
   - **Target:** register Directus as a `FederationNetwork` (local posts, profiles and follows). Pages then call `/api/social/federation/...` and merge AT Protocol, ActivityPub and local results, falling back to Directus when the others are unconfigured or down.
3. **The networks have no credentials.**
   - meeovi-frontend has no `ATPROTO_IDENTIFIER` / `ATPROTO_APP_PASSWORD`, so the Bluesky timeline and search come back empty.
   - It has no `ACTIVITYPUB_ACCESS_TOKEN`, so ActivityPub is limited to anonymous hashtag search.
   - Mastodon isn't set up on the server yet.
4. **Contract copies.** Each network plugin keeps a structural copy of the federation contract. A shared types package (or an alternate-sdk contract) would stop them drifting apart.

## ui-shell: the unified layout shell

**What's there**
- Seven layouts: `default`, `workspace`, `settings`, `nolive`, `starter`, `pixanomy` and `elitenovels`. Apps choose one through `appConfig.uiShell`.
- Header, sidebar and workspace chrome, plus PWA and service-worker cache rules.
- Production tests: 9 of 9 passed.

**Gaps**
1. **Layers still ship their own chrome.**
   - `layers/social/app/layouts/nolive.vue` is a full duplicate (131 lines) of ui-shell's `nolive.vue`, and which copy wins depends on layer order.
   - `layers/auth/app/layouts/auth.vue` and `layers/search/app/layouts/search.vue` are separate shells too.

   Move them into ui-shell, as `auth` and `search` variants, and delete the copies.
2. **Mixed styling stacks.**
   - meeovi-frontend loads Bootstrap, Mobirise, Vuetify and Tailwind, plus several app-level stylesheets (`search.css`, `styles.css` and others).
   - These have caused dark-mode, centring and overflow bugs before.

   ui-shell should own the base styling; the app-level CSS should shrink to brand overrides.

## business (workspace)

- Workspace admin pages are under `/workspace` with `MeeoviTable` (meeovi-tables), role-gated through `meta.roles`, with a `BUSINESS_BACKEND` driver switch, and the integrations catalog.
- **Gaps:**
  - no tests;
  - 3 failing production checks from 15 October: page errors for user and seller, and a redirect target that didn't exist. The integrations redirect was fixed since, so it needs a retest.
  - Seller tables rely on Magento Integration permissions that haven't been granted yet.

## meeovi-frontend (the app)

- It builds (about 22 minutes, capped at 12 GB) and runs as the `meeovi-demo` systemd unit behind Apache and Cloudflare. As of today it points at commerce.meeovicms.com.
- **Gaps:**
  1. **205 uncommitted files**, including today's integrations, sandbox, Magento-commerce and order fixes. Commit on a branch before anything else.
  2. **Plugins registered by absolute path.** 11 are registered with `resolve(__dirname, '../../../packages/plugins/...')`, for example the list types and the search plugins. That goes against the "plugins are named packages" rule. Register them by name, as workspace and app dependencies.
  3. **Unused dependency.** `@svar-ui/vue-kanban` is no longer used by `list-type-kanban`; removing it needs your OK.
  4. **Dropshipping is registered** but intentionally can't be installed until it's ported to the sandbox (it's waiting for launch).
  5. **The site CSP is still report-only.** Enforce it once the reports are clean.

## Backend dependencies (commerce.meeovicms.com)

- Upgraded today to **Mage-OS 3.6.0** (Magento 2.4.9); backups are in `/root/backups/commerce-upgrade-3.6-*`.
- **Cache is on files, not Redis.**
  - Mage-OS 3.6's Redis adapter ignores the Redis username, so the dedicated `magento` login fails.
  - Fix: a composer patch adding username support, reported upstream as well.
- Orphaned extension attributes were removed on commerce. **Live meeovi.com still has them.**
- Directus (meeDirectus) runs on Supabase in Frankfurt while the server is in Canada, so uncached pages render in about 10 s. The homepage is cached (`swr`); Directus caching is still off.

## Launch checklist

**Blockers**
1. Commit the working tree (205 files) on a branch; rerun the production test suites against the demo.
2. Commerce:
   - grant the `external_orders` and `seller_dashboard` permissions on the Magento Integration;
   - decide where order history lives (Magento);
   - backfill Magento customer links for the 16 unlinked users.
3. Notifications: move the three `/api/notifications/*` routes to Novu (they 404 for every real user).
4. Localization: decide English-only for launch, or do the extraction pass.
5. Security:
   - enforce the CSP;
   - restrict the Directus token role;
   - rotate keys and sign out all sessions (scheduled for the end of the project).
6. Magento: restore Redis caching (patch); do a test purchase end to end on staging with a paid integration product.

**Should do before launch**
- Search: per-provider timeouts; move the Magento and AT Protocol providers into their adapters.
- ui-shell: absorb the auth, search and social layouts; trim the app-level CSS.
- Auth: disable SSO, SCIM, generic OAuth, phone and anonymous sign-in unless they're launching; remove the dead SDK auth registrations.
- Social: AT Protocol service account credentials; register Directus as a federation network.
- Register the remaining 11 plugins by name.

**After launch**
- Commerce: one backend contract (cart, orders), pages on composables, and remove `CommerceClient` and `/api/commerce/driver`.
- Social: move pages onto the federation API.
- Tests for business and ui-shell; OpenSearch indexing for Magento products; Directus caching.
