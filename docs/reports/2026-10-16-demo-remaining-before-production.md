# demo.meeovicms.com: what's left before production

**Date:** 16 October 2026, updated 18 October 2026
**Follows:** [Production readiness: layers and meeovi-frontend](2026-10-16-production-readiness.md)
**Path to production:** meeovi-frontend is finished and tested on demo.meeovicms.com, then moves to meeovi.com, with commerce data from commerce.meeovicms.com (Mage-OS 3.6.0).

## Remaining blockers

1. **Enforce the CSP.** It is report-only today. Exercise checkout (Stripe and PayPal), sign-in (Turnstile), search, notifications and ads on the demo, make sure no violations are reported, then switch it to enforce.
2. **Browser check of the Turnstile flows.** Scripts can't pass the captcha, so these are covered by hand only: sign-up, password and username sign-in (including the cookie flags and the 2FA step), password reset, resending the verification email and Bluesky sign-in.
3. **Rotate keys and sign out all sessions.** Scheduled for the end of the project; do it last, before the move to meeovi.com:
   - JWKS, the OAuth client secret, API keys and Directus tokens (the app now uses the "Meeovi app server" token; remove the static token from the "Meeovi Administrator" account, kept in `/root/directus-admin-token` until then);
   - the Magento Integration tokens: reauthorize "Meeovi App" and update `demo.env` and the local `.env`;
   - the Stripe Tax secret key stored in commerce's Magento config: its encrypted value was printed during the 17 October checks;
   - the Bluesky app password "meeovi-app" (revoke it on the account and create a new one).
4. **Switch Novu to `NODE_ENV=production`.** It runs as `local` on purpose until launch. Change it in `/root/novu-3.19/api.env`, then run `docker compose up -d api` from that folder.

## Before the move to meeovi.com

- **Live meeovi.com Magento** needs approval before anything changes there. Alternatively, meeovi.com keeps using commerce.meeovicms.com as its backend, as planned. If live stays in use, it:
  - still has the orphaned extension attributes that crashed the commerce admin;
  - lacks the `Meeovi_MarketplaceApi` additions (external orders, order history, product sellers);
  - probably has the same Stripe Tax setup (a live key in the "test" slot) and the same Bss "Also Bought" PHP error that blocked every order on commerce;
  - still has the old 85% marketplace commission.
- **meeovi.com app configuration:**
  - its own Stripe webhook endpoint for `/api/payment/stripe/webhooks`, with that endpoint's secret in its env;
  - Novu: `NOVU_API_HOSTNAME=https://novu.meeovicms.com/api` and `NOVU_WEBSOCKET_HOSTNAME=https://novu.meeovicms.com`;
  - Bluesky: `ATPROTO_IDENTIFIER` and `ATPROTO_APP_PASSWORD`.
- **Magento-side tax.** Stripe tax and discount codes are switched off for Magento lines, and Stripe Tax is now off on commerce. Decide whether Magento or Stripe calculates tax for backend products.
- **Indexing on commerce.** The cron job that applies the indexer backlog (`indexer_update_all_views`) hasn't run since the Mage-OS 3.6 upgrade, so new products don't reach the storefront until someone reindexes by hand.
- **Magento full-page cache.** The commerce homepage is sent as `no-cache`, so it is never cached. Find the block or setting that makes it uncacheable.
- **Directus latency.** Directus runs on Supabase in Frankfurt while the server is in Canada, so uncached pages take about 10 s. Turn on Directus caching, or move the database closer.

## Should do before launch

- **Fediverse:** set `ACTIVITYPUB_ACCESS_TOKEN`; without it, ActivityPub is limited to anonymous hashtag search.
- **Env clean-up:** the app's `.env` still carries `NUXTUS_DIRECTUS_ADMIN_EMAIL` / `NUXTUS_DIRECTUS_ADMIN_PASSWORD` (Directus admin login), which no code reads; remove them.

## After launch

- **Commerce:**
  - grow the backend contract to cover cart and catalog writes, and move pages onto composables;
  - remove `CommerceClient` and `/api/commerce/driver`, which is the source of the known test failure.
- **Social:** move feeds, posts, profiles and follows onto the federation API.
- **Tests:** add them for business (workspace) and ui-shell.
- **Indexing:** index Magento products into OpenSearch, or query Magento's own index.
- **Dropshipping:** port it to the sandbox and deploy it, as planned for after launch.
- **Localization:** a full extraction pass if more languages are added.
- **officiallyjust3 test:** `test/unit/alternate-search-layer.test.ts` imports `packages/modules/alternate-search`, which was deleted in an older commit; remove or rewrite the test.
- **Novu analytics:** the API logs ClickHouse connection errors because none is installed. Only activity analytics are affected; add ClickHouse if those are wanted.

## Waiting on you

| Item | Needed for |
| --- | --- |
| Approval for any change on live meeovi.com Magento, or confirming meeovi.com uses commerce | Moving to meeovi.com |
| Tax decision for Magento products | Moving to meeovi.com |
| An ActivityPub (Mastodon) access token | Fediverse search |

## Done

### 16 October

- The working tree is committed on `beta/production-readiness` (not pushed yet).
- Production tests were rerun against the redeployed demo:
  - shared (31), ui-shell (9), search (10), social (22), security (15) and business (16) pass;
  - business has 1 check deliberately skipped, because it would change real shop data or request a payout;
  - commerce has one known failure (`/api/commerce/driver`, see "After launch");
  - auth: 9 checks are blocked by Turnstile and 1 by the sign-in rate limit, not by bugs.
- English only: the French locale is removed.
- Notifications: Novu is the only system. The broken `/api/notifications/*` routes and the `@betternotify` packages are gone.
- Order history comes from the commerce backend (adapter-magento → `Meeovi_MarketplaceApi`), read through `/api/commerce/orders`, so the commerce layer stays backend-agnostic.
- Magento Integration "Meeovi App" on commerce: granted `external_orders`, `seller_dashboard` and `catalog_sync` only; its keys are in the demo env, and as `DEV_MAGENTO_*` for local dev.
- commerce.meeovicms.com: upgraded to Mage-OS 3.6.0, Redis cache restored through a composer patch, orphaned extension attributes removed.
- The kanban list type is built on `@svar-ui/vue-kanban` inside the sandbox.

### 17 October

- **Search:**
  - each provider has a timeout (`ALTERNATE_SEARCH_PROVIDER_TIMEOUT_MS`, default 5 s);
  - the Magento and AT Protocol providers live in adapter-magento and meeovi-atproto;
  - the search layer no longer depends on either package.
- **Social:**
  - Directus is a federation network ("Meeovi": the site's members and their published, public posts);
  - federation routes stop waiting for a network after 8 s.
- **Auth:** SSO, SCIM, generic OAuth, phone-number and anonymous sign-in are packages under `packages/plugins/Authentication/` (`@mframework/auth-*`). meeovi-frontend doesn't register them, so they're off for launch.
- **User clean-up:** 57 accounts deleted. Joanne Doe, Max Doe and QA Admin (the only admin) remain. Backup: `/root/backups/users-cleanup-2026-10-17T0416/backup.json`.
- **Staging test purchase passed end to end.** Habit Tracker is a paid integration ($4.99, SKU `meeovi-habit-tracker`, sold by Max Doe). QA Admin bought it with Stripe's test card:
  - install was refused (402) before buying and worked after;
  - Magento order 000000005 was created and invoiced;
  - Webkul credited the seller;
  - Orders shows it as paid.
- **Fixes made along the way:**
  - a test-mode Stripe webhook endpoint for the demo;
  - checkout skips address and shipping when nothing in the cart ships;
  - the order module no longer re-validates the billing address Stripe collected;
  - Stripe Tax switched off on commerce (it held a live key in its test slot);
  - the Bss "Also Bought" PHP 8.4 error that failed every commerce order is fixed.
- **Commission:** sellers keep 85% and Meeovi 15% on commerce (the global setting and every seller's rate).
- **Product page:**
  - the seller shows as "By: Max Doe", linked to their profile;
  - the list check no longer returns 500 for Magento products;
  - the notification bell, which never loaded because of a plain-http address, now works.
- **Novu:**
  - served at https://novu.meeovicms.com: dashboard at `/`, API at `/api`, live connection at `/socket.io`;
  - containers rebuilt from their running settings in `/root/novu-3.19`, with ports 3090, 3092 and 4000 closed to the internet;
  - the demo and local dev both point at the new host.
- **Bluesky:**
  - service account `meeovi.sky.meeovicms.com` (support@meeovi.com), with its main password in `/home/meebuzo/.meeovi-demo/bluesky-service-account.json`;
  - the "meeovi-app" app password is in `demo.env` and the local `.env`;
  - site search returns Bluesky posts.
- **Lists:** products from any commerce backend (e.g. `magento:<sku>`) can be saved to lists. They're stored in the new Directus collection `lists_backend_products` with a snapshot from their backend, and the list page has a "Saved products" section for both kinds. Verified end to end on the demo.
- **Auth:** the unused alternate-sdk auth path is gone (the adapters' `AuthAdapterRegistry` registrations and the auth layer's dead `runtimeConfig.mframework`). better-auth is the only auth.
- **officiallyjust3:** its layer and plugin paths are fixed (three levels up, not four), so `nuxt prepare` and the repo-wide `npm install` post-install step work again.
- **Bluesky server:** the three old test accounts (`claudetest1`–`3`) were deleted; only `meeovi.sky.meeovicms.com` remains.
- **Directus token restricted:** the app uses a new "Meeovi app server" account (policy: all 478 content collections, files, read-only schema; no access to the 32 auth tables, settings or roles). Live on the demo and in local dev; verified (auth tables refused, content and lists flows work, no permission errors in the test run).
- **Plugins:** every plugin is registered by name (`acc7dc85`); meeovi-forms and experience-builder moved from the shared layer into the apps that use them.
- **Turnstile** now guards every unauthenticated auth flow in code (`77bcee50`): password, username and email-code sign-in, Bluesky sign-in and sign-up, and resending the verification email, besides sign-up, password reset and magic link.

### 18 October

- **Turnstile deployed** on the demo: `/api/auth/sign-in/email` without a captcha token returns `400 Missing CAPTCHA response`, and the login page shows the widget.
- **QA accounts recreated:** QA user and QA seller (email verified, linked to Magento customers 111 and 112); details in `/home/meebuzo/.meeovi-demo/qa-accounts.json`.
- **Production tests** open sessions directly in the database (signed like better-auth's own cookie) instead of signing in, and report sign-in checks as "blocked — verify in a browser". Results against the demo:
  - social (22), search (10), shared (31), ui-shell (9) pass;
  - security: 14 pass, 1 blocked (K1, cookie flags; browser check);
  - business: 16 pass, 1 skipped on purpose (real shop or payout changes);
  - commerce: 20 pass, 1 known failure (`/api/commerce/driver`, see "After launch");
  - auth: 42 pass, 14 blocked by Turnstile; T3 (2FA step) was rate-limited and is now reported as blocked.
- **ui-shell owns every layout.** `auth` (from the auth layer) and `search` (from the search layer, with its header menus) moved into ui-shell. Social's own `nolive` was deleted: it used components the starter apps don't register. Apps now list the layouts they use (`uiShell.layouts`), and starter apps serve `nolive` with the starter shell (`uiShell.aliases`). The app-level CSS stays as it is, since it's part of the design.
