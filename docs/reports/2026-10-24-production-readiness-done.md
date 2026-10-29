# Production readiness: what's done

**Date:** 16 to 29 October 2026
**Companion to:** [Production readiness: what's open](2026-10-16-production-readiness.md), which lists only what's still to do.
**Scope:** `layers/*` and `apps/ecosystem/meeovi-frontend`. The app is tested at demo.meeovicms.com and moves to meeovi.com when it's finished, with commerce data from commerce.meeovicms.com (Mage-OS 3.6.0) through Directus.

## Launch preparation, 27 to 29 October

### Accounts, providers and the servers

- Live PayPal webhook: the id is in `prod.env`, and production was restarted on 27 October to load it.
- Cloudflare: `meeovi.com` added to the Turnstile widget, and Speed Brain turned off.
- The store's 20 test customers deleted on 27 October. The backup is `/root/backups/test-customers-backup-20261025.json`, and the admin customer list was rebuilt. The script needed PHP 8.4 (`/usr/local/apps/php84/bin/php`) and Magento's "secure area" flag; both are fixed in it.
- Directus admin passwords changed on both servers (checked 27 October: the old one is refused).
- Google sign-in accepts the meeovi.com callback (checked 27 October). GitHub updated by you; it only checks the callback after someone logs in, so the first real GitHub sign-in confirms it.
- Firewall: `meeovi-firewall` is installed, enabled at boot and active (27 October). The script needed to be made executable.
- meeovi.com's origin certificate: the Cloudflare Origin certificate (meeovi.com and *.meeovi.com, valid until 2041) is installed through Webuzo and served for meeovi.com and www (checked 27 October).
- Store tax: the rule now covers Michigan 8.25%, California 8.25% and New York 8.375% for Taxable Goods / Retail Customer, and every product has a tax class (checked 27 October).
- Cloudflare SSL/TLS encryption mode set to Automatic, which picks Full (strict) now that the server's certificate is valid.
- Shipping tax: shipping uses the Taxable Goods class, so it's taxed under the same rule (MI, CA, NY).
- Novu on its Production environment (27 October): your new secret key and application identifier are in the app's `.env` and in production and the demo (with runtime overrides, so no rebuild was needed), and the `follow`, `new-content` and `purchase` workflows were synced from Development. Both sites checked with a throwaway account. Notifications sent before the switch stay in Development, so members' inboxes start empty.
- Share image: `apps/ecosystem/meeovi-frontend/public/og-image.png`, the Meeovi logo (`logo512alpha.png`) centred on white at 1200×630 (27 October). It goes live with the next commit and deploy.
- Polar live in production (27 October): the live token has the products, checkouts and customer-session permissions, and production reads it through the `NUXT_MEEOVI_POLAR_*` runtime overrides in `base.env` (the plain `NUXT_POLAR_*` values are baked in at build time). The live webhook secret is in too: a test event signed with it is accepted and a wrongly signed one refused. The demo stays on Polar sandbox.
- Firewall extended (28 October): 16 more ports that answered from the internet directly are now closed: Portainer, Grafana, Budibase, MinIO, Mastodon, Remark42, a Swarm service on 5050, rpcbind, epmd and the Swarm ports. Their sites still work through Apache. Backup: `/root/bin/meeovi-firewall.sh.bak-20261028`.
- Live Shippo key in production (28 October): `SHIPPO_API_KEY` plus a `NUXT_SHIPPO_API_KEY` runtime override, because `shippoApiKey` is baked in at build time. Production restarted. Shippo accepts the key: 14 carrier accounts, and a quote returns live (non-test) USPS rates. The demo stays on the test key. Backup: `base.env.bak-20261028-shippo`. You added the live `track_updated` webhook, which is active, in live mode, with the correct URL and token (checked 28 October). Shippo can't reach it until meeovi.com goes live on launch night.
- ActivityPub token (28 October): a read-only mastodon.social app token (`read:search`, `read:statuses`, `read:accounts`) is in production as `ACTIVITYPUB_ACCESS_TOKEN`, plus the `NUXT_MEEOVI_ACTIVITYPUB_ACCESS_TOKEN` runtime override. Production restarted. A full-text phrase search through the app now returns matching posts, not only hashtags. The demo doesn't have it yet. Backup: `base.env.bak-20261028-activitypub`.
- meeDirectus Public policy closed (28 October): Anonymous visitors can no longer read orders, invoices, payments, addresses, messages, notifications, contacts or Directus users at cms.meeovicms.com. They also can't create, edit or delete anything there. 688 permissions removed, 2,382 public content reads kept. Checked as an anonymous visitor, and both sites still load content. Backup: `/root/backups/meedirectus-public-policy-permissions-20261028.json`.
- Directus private content (28 October): Directus's Public read rules now hide private posts, spaces, websites, showcases and videos, and private lists' links, the same way the app does. 2 private websites and 3 private showcases had been readable by anyone.
- Nuxt 4.6.3 and Vue 3.5.44 (28 October), which fix advisories about route rules and server-rendered attribute names. better-auth stays on 1.6.23 with the vendor's workaround for the magic-link account takeover (GHSA-965c-763c-88jm); 1.7 is after launch.
- Sandbox purchase on the demo (28 October): PayPal sandbox payment, order confirmation and the Novu "order placed" notification all worked. It showed that an international label needs a customs declaration; checkout now creates one.
- Passwordless sign-in tested by hand on the demo (29 October): "Sign in with a passkey" and "Email me a sign-in link" both work. The passkey prompt is a little slow to appear; see the after-launch list.
- Disk space (29 October): you cleared the npm cache and old logs. The disk went from 97% to 93% full (22 GB free).

### Products, sellers and free downloads (28 October)

- **Every product lives in the store.** Products made by a seller in the app or by an editor in Directus are created in Mage-OS under a real seller first; the store mirror then brings them into Directus. A Directus hook (`mageos-push-products`) does this for editor-made products.
- **Free downloads:** a product with price 0 and "Allow anyone to download it for free" gets a shareable download link in the store. Its page shows a Download button instead of checkout.
- **Seller and shop names link** to the seller's profile (`/u/<username>`) or the shop's page (`/outlet/<slug>`) on product cards, product pages and the stores list.
- **Seller form:** Workspace → Catalog → My products lists the seller's store products and adds new ones (name, price, description, department, category, up to 5 tags, image, download file). The department's and category's names are suggested as tags and can be removed. New products wait for the store's approval.
- **80 travel photos** are free products in the store under @bastianhilton (Photography → Travel, tagged #travel and #photography). The earlier Directus-only copies were removed (backup `/root/backups/directus-photo-products-directus-only-20261028.json`).
- The store's cron had been running under PHP 8.2 and doing nothing, so its indexes were stale since 26 October. It now runs under PHP 8.4, and the indexes were rebuilt.
- Store lookups of 11 or more products at once had been failing silently (OAuth signature error). They now go in batches of 10.

### Social (28 to 29 October)

- **Meeovi is a Bluesky client.** Nothing links out to bsky.app:
  - Bluesky notes open on the note page (`/connect/note/@<handle>/<id>`), with their replies shown as notes.
  - Bluesky accounts open on the profile page (`/u/<handle>`). A member who signed in with that Bluesky account shows as themselves, with their Bluesky notes among their notes.
  - Checked on the demo on 29 October: hashtag page, a note with a reply, a profile, and a missing note (404).
- **Hashtag pages** (`/connect/hashtag/<tag>`) show the store's products with that tag, then the tag's notes from Bluesky, in the social layer's note card.
- **Note cards:** every link works. The author opens their profile, the note opens its page, Comment opens the comments, and Share shares the note's own link. The note page's author link had pointed to a page that doesn't exist.
- **Wording:** posts are called notes.
- **The hashtag bar** greets signed-in members ("Hello, name"; the server hadn't been sending the session cookie) and lists the newest hashtags first.

### Site content and login (28 October)

- **Live CSS shows on the next page load.** Directus → Globals → Theming → Custom CSS is linked with a version taken from its content, so a change gets a new address and skips Cloudflare's 4-hour cache for .css files.
- **Directus pages keep their styling.** HTML written in Directus pages keeps any CSS property and `<style>` blocks (checked like the live CSS), plus video and audio. Scripts and event handlers are still removed. Members' notes and comments get flex and grid layout styles, but nothing that can cover the page.
- **Login page:** the title is dark on the light panel, and the sign-in-link prompt points to the Email field.
- **How to rebuild the demo** is in the repo's README.

### How the live PayPal webhook was made

Run as root. It reads the live credentials from the env file and prints only the new webhook's id:

```
set -a; . <(grep -E '^NUXT_PAYPAL_(CLIENT_ID|CLIENT_SECRET)=' /home/meebuzo/.meeovi-prod/prod.env); set +a
T=$(curl -s -u "$NUXT_PAYPAL_CLIENT_ID:$NUXT_PAYPAL_CLIENT_SECRET" -d grant_type=client_credentials https://api-m.paypal.com/v1/oauth2/token | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])')
curl -s -H "Authorization: Bearer $T" -H 'Content-Type: application/json' \
  -d '{"url":"https://meeovi.com/api/payment/paypal/webhooks","event_types":[{"name":"PAYMENT.CAPTURE.COMPLETED"},{"name":"PAYMENT.CAPTURE.REFUNDED"},{"name":"PAYMENT.CAPTURE.REVERSED"},{"name":"CUSTOMER.DISPUTE.CREATED"}]}' \
  https://api-m.paypal.com/v1/notifications/webhooks | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id"))'
```

### How the firewall is installed

`/root/bin/meeovi-firewall.sh` drops new connections to the internal ports unless they come from:
- loopback,
- the Docker or private ranges,
- the server's own IP.

Apache, the containers and the apps on this server keep working. To install it so it survives reboots:

```
cat > /etc/systemd/system/meeovi-firewall.service <<'EOF'
[Unit]
Description=Keep internal service ports off the internet
After=docker.service network-online.target
Wants=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/root/bin/meeovi-firewall.sh
ExecStop=/root/bin/meeovi-firewall.sh stop

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable --now meeovi-firewall
```

`systemctl stop meeovi-firewall` removes the rules again.

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
- Bluesky works: site search returns Bluesky posts. The service account's handle is now `meeovi.com` (DID `did:plc:uxc3jbzceyy2arpvdzl7xg2y`); the app signs in with the DID, so handle changes can't break it.
- **The PDS at sky.meeovicms.com (26 October):**
  - Apache now passes the PDS's live update stream (WebSocket) and its `/.well-known` handle and sign-in endpoints. Bluesky's relay had marked the PDS offline, so handle changes and posts never reached bsky.app; it now lists the PDS as active.
  - The PDS container was recreated with its data in `/opt/pds/data`. Misnamed settings had left every account inside the container, where recreating it would have deleted them. Port 3099 now listens on this server only.
  - Verification emails go through this server's mail server as `no-reply@meeovicms.com`. The server now introduces itself as `mail.meeovicms.com` (it used its bare IP, which got it on Spamhaus's XBL list), with matching reverse DNS, SPF and DKIM. Spamhaus delisted the IP; Outlook still refused mail on the 26th while its copy of the list caught up.
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
