# Production readiness: what's done

**Date:** 16 to 24 October 2026
**Companion to:** [Production readiness: what's open](2026-10-16-production-readiness.md), which lists only what's still to do.
**Scope:** `layers/*` and `apps/ecosystem/meeovi-frontend`. The app is tested at demo.meeovicms.com and moves to meeovi.com when it's finished, with commerce data from commerce.meeovicms.com (Mage-OS 3.6.0) through Directus.

## auth

- better-auth is the only auth path; the unused alternate-sdk auth registrations are gone.
- SSO, SCIM, generic OAuth, phone-number and anonymous sign-in are `@mframework/auth-*` packages. meeovi-frontend doesn't register them, so they're off for launch.
- Turnstile is on every unauthenticated auth flow, sign-in included. Every step after the checkbox was checked in Chrome against a copy of the demo build with Cloudflare's test keys.
- 2FA sign-in works. The `/2fa` page didn't exist before; it now takes an authenticator code, an emailed code or a backup code.
- The Directus token is restricted. The app uses the "Meeovi app server" account, which can't see the 32 auth tables, settings or roles.
- User clean-up: only Joanne Doe, Max Doe and the QA accounts remain. The backup is in `/root/backups/users-cleanup-2026-10-17T0416/`.

## search

- Each provider has a timeout: `ALTERNATE_SEARCH_PROVIDER_TIMEOUT_MS`, 5 s by default.
- The Magento and AT Protocol providers live in adapter-magento and meeovi-atproto; the search layer depends on neither.
- **24 October, the results page (built, not yet deployed):**
  - the endless request loop on `/results` is fixed (inline `[]` props rebuilt the widgets on every render);
  - the search term reaches InstantSearch, and paging no longer asks for page 1 twice;
  - the site's own public spaces, posts, shops, lists and brands are searched through Directus, with the same privacy rules as the CMS proxy;
  - results are a real grid, with styled pagination and rating stars;
  - Bluesky posts and profiles labelled adult, graphic or taken down are filtered out, as are authors who opt out of being shown to signed-out visitors;
  - cards without a price no longer show "$0.00", the query no longer shows as a filter chip, and the rating filter shows its stars.
- **Store search goes through Directus** (`/commerce/search`) when `NUXT_PUBLIC_MAGENTO_VIA=directus`, like the rest of the store data.
- **OpenSearch and Postgres search are off** for meeovi-frontend. OpenSearch's configured index didn't exist, and Postgres read Directus's products table raw: drafts included, store products listed twice, about 1.5 s per search. Directus's own published products are searched through Directus instead.

## commerce

- **Directus is the gateway to the store.**
  - The `directus-extension-mageos-commerce` extension serves `/commerce/*`: catalogue, search, customers, paid orders, customer orders, gift cards, the Webkul seller dashboard and store admin.
  - The app talks to it through the Directus SDK (`@mframework/mageos-commerce-sdk`); `NUXT_PUBLIC_MAGENTO_VIA=directus` is the default.
  - The browser only reaches an allowlist of public routes through `/api/cms`; admin and customer data stay server-side.
- **Mage-OS → Directus sync.**
  - Products, categories, orders and customers are mirrored into Directus; customers go into a new admin-only collection.
  - The `Meeovi_DirectusSync` module pings Directus after each save, so a new order reaches Directus in about 6 s.
  - Scheduled Flows catch anything missed: orders every 5 minutes, the catalogue every 15 minutes, customers hourly.
  - The ping is checked against `MAGEOS_NOTIFY_SECRET`.
- **PayPal replaced Stripe** after Stripe disabled the account on 20 October.
  - All Stripe code is removed; checkout runs on the PayPal JS SDK v6 with signed webhooks.
  - Fulfilment doesn't depend on the provider: Magento orders, licences, `os_payments`, Shippo, Novu and download emails.
  - Workspace refunds go through PayPal. The demo uses a PayPal sandbox app and webhook.
- **Order history** comes from the store, through `/api/commerce/orders`.
- **Gift cards** are read from Ecomteck through the `Meeovi_GiftCards` module on the store.
- **Lists** can save products from any backend (`lists_backend_products`).
- **The product page** shows the seller ("By: Max Doe") and the store's description.
- **Seller products** wait for an admin's approval on the store (`product_approval` = 1).
- **Gift cards are kept out of the cart** (409) until checkout can take the amount and recipient; the gift-cards page says so. Before, PayPal could take the money for a card the store couldn't issue.
- **`CommerceClient` and `/api/commerce/driver` are removed** (they never had a driver; test D1). The product page's last lookup asks the commerce backends directly.
- **Staging purchase** passed end to end on 17 October (with Stripe, before the switch): Magento order 000000005, invoiced, with the seller credited.
- **Tax comes from the store** (25 October; built and tested, deploy pending). The app works out no tax itself:
  - `Meeovi_MarketplaceApi` has a tax quote (`POST /V1/meeovi-marketplace/tax/quote`), served by the Directus extension at `/commerce/tax/quote` and `quoteTax()` in the commerce SDK.
  - Store products are quoted in the same quote the paid order is placed from, so the payment always matches the recorded order. Directus products and shipping use the store's default tax classes.
  - The address is the one the buyer enters, then their billing address in the store, then the store's default. A state typed as a name ("Michigan") works as well as a code.
  - Checkout shows items, shipping, tax and total before PayPal opens (`POST /api/payment/quote`, behind Turnstile). It refuses to take payment if the store can't quote, or its price has changed.
  - Tested against the real store with nothing saved: Michigan 8.25% on $14.97 is $1.24, matching Magento's own total.
- **Shipping checkouts were refused** because the address form sends `email`, which the order request didn't allow (400). Fixed with the shared checkout schema.
- **Test data is gone** (25 October): orders #000000005–#000000008 and their Webkul sales (seller 97's totals reset), the five QA customers on the store, the three QA app accounts with their sessions, carts, licences and list memberships, the mirrored orders in Directus, and the QA user's uploads (in Nextcloud's trash). Backups: `/root/backups/qa-accounts-app-db-20261025.json` and `qa-accounts-magento-20261025.json`. Later the same day: the QA accounts' Rocket.Chat users and Novu subscribers, one more orphaned subscriber, and the accounts file that held their passwords.
- **No test account stays anywhere.** The production tests make their own accounts at the start of each run and delete them at the end, along with the Rocket.Chat user, Novu subscriber and upload folder the app creates for them. An account left by a crashed run is removed at the start of the next run.

## shared

- English only: the French locale is gone.
- Novu is the only notification system. The broken `/api/notifications/*` routes and `@betternotify` are removed. Novu is served at https://novu.meeovicms.com, and the demo proxies it over HTTPS.
- The CSP is enforced on the demo since 18 October. `NUXT_CSP_REPORT_ONLY=true` switches it back without a rebuild.
- Every form is gated by one Turnstile rule list; posts and Rocket.Chat comments go through a spam filter.
- Private rows stay private, including when they're nested through relations.

## social

- Directus is a federation network ("Meeovi": members and their public posts). Federation routes stop waiting for a network after 8 s.
- Bluesky works: the service account is `meeovi.sky.meeovicms.com`, and site search returns Bluesky posts.
- meeovi-atproto and meeovi-activitypub live in `packages/plugins/Social`.
- Nothing under `/connect` opens for a signed-out visitor: every `/connect` URL goes to the login page, whichever layer or app provides the page, and so does an address that matches no page.

## ui-shell

- ui-shell owns every layout: `auth` and `search` moved in, and social's duplicate `nolive` is deleted. Apps list the layouts they use (`uiShell.layouts`).
- **Performance (21 October):** the mobile home page's first paint went from 35 s to 6.5 s, the home page is lazily hydrated, and only 10% of sessions record Sentry replays.

## business (workspace)

- `/workspace` is the Mage-OS admin for store admins: customers (create, edit, delete), orders, credit memos, PayPal refunds and licences.
- The Mage-OS Integration has the Customer and Sales permissions it needs.
- Seller dashboards read Webkul data.
- **No sample data behind a real backend.** Where the store has no data for a seller, the dashboard is empty instead of showing made-up orders, payouts and reviews; payout requests are refused (501) until payouts exist. Sample data only answers with `BUSINESS_BACKEND=mock` or in local dev.

## meeovi-frontend

- Everything up to 24 October is committed, and `beta/production-readiness` is merged into `main` locally.
- Every plugin is registered by name.
- The env went from 198 to 113 variables.

## Backend

**commerce.meeovicms.com**
- Upgraded to Mage-OS 3.6.0 (Magento 2.4.9). Redis cache restored through a composer patch.
- The indexer cron runs every minute; it had never run before 20 October.
- The Bss "Also Bought" PHP 8.4 error that failed every order is fixed.
- Commission: 15% Meeovi, 85% sellers.
- Installed modules: `Meeovi_MarketplaceApi`, `Meeovi_GiftCards`, `Meeovi_DirectusSync`.
- The current `Meeovi_MarketplaceApi` is deployed (25 October): seller products stay off until approved, and orders say PayPal. The previous copy is in `/root/backups/commerce-marketplaceapi-20261025`.
- The live Stripe account has no webhook endpoints (checked 25 October), so no live events reach the test store.

**Directus (meeDirectus)**
- Extensions live on their own volume (`directus_extensions`).
- Caching is on, in Redis.
- The commerce extension and the sync Flows are live.

## Server security

- Live meeovi.com's Magento was exploited on 18 October through a GraphQL template-injection chain, and a crypto miner was installed.
- The miner was removed on 20 October, and no persistence was found.
- A stopgap `.htaccess` rule blocks the payloads on meeovi.com and commerce.
- The old meeovi.com Magento has been taken down (25 October). meeovi.com becomes the production app, with commerce.meeovicms.com behind it.
- The evidence is in `/root/incident-2026-10-20/`.

**app.pixanomy.com (Nextcloud)**
- Outages on 20 and 24 October traced to Softaculous auto-upgrade stopping halfway at root-owned add-on apps.
- Fixed 25 October: the 12 add-on apps now live in `/home/meebuzo/nextcloud-apps` (Nextcloud `apps_paths`, served at `/custom_apps` through Webuzo's per-domain include), owned by `meebuzo`; the stray `node_modules` is in `/root/backups/nextcloud-extras-20261025`. The install folder holds only the release's files (`occ integrity:check-core` lists only `error_log`), so the next auto-upgrade can finish. Status, login, add-on assets and the uploads account (WebDAV 207) all checked.
- This server resolves app.pixanomy.com through Cloudflare again; the temporary `/etc/hosts` entry was removed on 25 October.

## Production tests against the demo, 25 October

Rerun after the `Meeovi_MarketplaceApi` deploy. No failures. "Blocked" means the check needs a Turnstile tick or a PayPal buyer.

| Suite | Passed | Failed | Blocked |
| --- | --- | --- | --- |
| commerce | 20 | 0 | 0 |
| auth | 34 | 0 | 22 |
| shared | 32 | 0 | 5 |
| social | 15 | 0 | 7 |
| search | 10 | 0 | 0 |
| security | 14 | 0 | 1 |
| business | 15 | 0 | 2 |
| ui-shell | 9 | 0 | 0 |
| auth-plugins | 9 | 0 | 0 |

Business D5 failed once, a few minutes after the store's cache was flushed (four seller reads got a Mage-OS error page while the cache rebuilt), and passed on both reruns.

## Production tests against the demo, 24 October (after the deploy)

| Suite | Pass | Not passed |
| --- | --- | --- |
| auth | 34 | 22 blocked by Turnstile |
| business | 16 | 1 skipped on purpose |
| commerce | 20 | — |
| search | 10 | — |
| security | 14 | K1 blocked (browser check) |
| shared | 31 | U5 (the `app.pixanomy.com` DNS record is missing); 5 blocked by Turnstile |
| social | 15 | 7 blocked by Turnstile |
| ui-shell | 9 | — |

The live `/results` page was also checked in a fresh browser: 5 search requests with no loop, no hydration or CSP errors, and a four-column grid of spaces and Bluesky posts and profiles.

## Production tests against the private build, 24 October

Run against a private copy of the build on localhost, before the deploy. Remaining failures are from that setup, or from the missing `app.pixanomy.com` DNS record:

| Suite | Pass | Not passed |
| --- | --- | --- |
| auth | 34 | 22 blocked by Turnstile |
| business | 16 | 1 skipped on purpose |
| commerce | 20 | — |
| search | 9 | SP3 (site URL pointed at localhost) |
| security | 12 | T1, T2 (plain HTTP); K1 blocked (browser check) |
| shared | 31 | U5 (Pixanomy DNS); 5 blocked by Turnstile |
| social | 15 | 7 blocked by Turnstile |
| ui-shell | 9 | — |

Fixed along the way:
- a seller whose store account isn't a Webkul seller got a 500 on their shop page (D5); "Not a seller" now means an empty shop;
- the CSP blocked Better Auth's identify call on every page; its host is allowed, and the project's identify URL now reaches the browser bundle;
- search result cards nested a link inside a link, which the browser re-parses, breaking hydration on `/results`;
- tests: S2 checks the account pages' new `/workspace/sales/*` paths; W1, W4 and E1 recognise the Turnstile form gate; the runner can target a private copy (`PROD_TEST_SECURE_COOKIE`, `PROD_TEST_REPORT_DIR`).

## Production tests, last run 20 October

| Suite | Pass | Not passed |
| --- | --- | --- |
| auth | 42 | 15 blocked by Turnstile or rate limits |
| business | 16 | 1 skipped on purpose |
| commerce | 20 | 1 known failure (D1) |
| search | 10 | — |
| security | 14 | 1 blocked (browser check) |
| shared | 29 | 3 failed (U3, U5 uploads; W7) |
| social | 22 | — |
| ui-shell | 9 | — |
