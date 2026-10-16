# demo.meeovicms.com: what's left before production

**Date:** 16 October 2026
**Follows:** [Production readiness: layers and meeovi-frontend](2026-10-16-production-readiness.md)
**Path to production:** meeovi-frontend is finished and tested on demo.meeovicms.com, then moves to meeovi.com, with commerce data from commerce.meeovicms.com (Mage-OS 3.6.0).

## Done since the readiness report

- The working tree is committed on `beta/production-readiness` (11 commits, not pushed yet).
- **Demo redeployed** (16 October, from commit `4d5a5828`): order history, the kanban board, the CSP host list, English-only and the `DEV_` key handling are live.
- Production tests were rerun against the redeployed demo:
  - shared (31), ui-shell (9), search (10), social (22), security (15) and business (16) all pass;
  - business has 1 check deliberately skipped, because it would change real shop data or request a payout;
  - commerce has one known failure (`/api/commerce/driver`, see "After launch");
  - auth: 9 checks are blocked by Turnstile and 1 by the sign-in rate limit, not by bugs.
- Search:
  - each provider now has a timeout (`ALTERNATE_SEARCH_PROVIDER_TIMEOUT_MS`, default 5 s), so one slow backend no longer holds up a search;
  - the Magento provider moved into adapter-magento and the AT Protocol provider into meeovi-atproto.
- Social:
  - Directus is registered as a federation network ("Meeovi": the site's members and its published, public posts), so federation always has a source that answers;
  - federation routes stop waiting for a network after 8 s.
- Search and social were verified in a running app; they reach the demo with the next deploy.
- English only: the French locale is removed.
- Notifications: Novu is the only system. The broken `/api/notifications/*` routes and the `@betternotify` packages are gone.
- Order history comes from the commerce backend (adapter-magento → `Meeovi_MarketplaceApi`). It's read through `/api/commerce/orders`, so the commerce layer stays backend-agnostic.
- Magento Integration "Meeovi App" on commerce:
  - granted `external_orders`, `seller_dashboard` and `catalog_sync`, and nothing else;
  - its keys are in the demo env, and as `DEV_MAGENTO_*` for local dev;
  - verified with signed API calls.
- commerce.meeovicms.com:
  - upgraded to Mage-OS 3.6.0;
  - Redis cache restored through a composer patch;
  - orphaned extension attributes removed.
- The kanban list type is built on `@svar-ui/vue-kanban` inside the sandbox.

## Blockers

1. **Test purchase on staging, end to end.** Buy a paid integration product on demo.meeovicms.com with Stripe test mode, and confirm that:
   - the Magento order is created on commerce, and Webkul credits the seller;
   - the integration unlocks (it shows "Purchased" and installs);
   - the order appears under Orders, read from Magento.

   No purchase has been made on commerce yet, so this path hasn't run with real data.
2. **Customer links.** At last count, 16 of 60 users had no linked Magento customer, so they can't buy Magento products. Either backfill them, or do it as part of the user clean-up (item 3).
3. **User clean-up.** Remove every user except Joanne Doe and Max Doe.
   - This can't be undone.
   - It also removes the QA accounts the production test suites sign in with.
   - Run it last, after the final test run, or recreate QA accounts afterwards.
4. **Enforce the CSP.** It is report-only today. Exercise checkout (Stripe and PayPal), sign-in (Turnstile), search and ads on the demo, make sure no violations are reported, then switch it to enforce.
5. **Restrict the Directus token's role** so it can't read the auth tables.
6. **Rotate keys and sign out all sessions.** This is scheduled for the end of the project; do it last, before the move to meeovi.com:
   - JWKS, the OAuth client secret, API keys and Directus tokens;
   - the Magento Integration tokens: reauthorize the Integration and update both env files.
7. **Auth flows behind Turnstile.** Check sign-up and password reset by hand in a browser, since the test suite can't solve the captcha.

## Before the move to meeovi.com

- **Live meeovi.com Magento:**
  - it still has the orphaned extension attributes that crashed the commerce admin;
  - it doesn't have the `Meeovi_MarketplaceApi` additions from today (external orders, order history, product sellers);
  - it needs approval before anything is changed there.

  Alternatively, meeovi.com keeps using commerce.meeovicms.com as its backend, as planned.
- **Magento-side tax.** Stripe tax and discount codes are switched off for Magento lines. Decide whether Magento or Stripe calculates tax for backend products.
- **Magento full-page cache.** The commerce homepage is sent as `no-cache`, so it is never cached. Find the block or setting that makes it uncacheable.
- **Directus latency.** Directus runs on Supabase in Frankfurt while the server is in Canada, so uncached pages take about 10 s. Turn on Directus caching, or move the database closer.

## Should do before launch

- **Auth:**
  - turn off SSO, SCIM, generic OAuth, phone and anonymous sign-in unless they are launching;
  - remove the unused SDK auth registrations in adapter-directus and adapter-magento.
- **ui-shell:**
  - absorb the `auth`, `search` and social `nolive` layouts;
  - trim the app-level CSS (Bootstrap, Mobirise, `search.css`, `styles.css`) down to brand overrides.
- **Social credentials (yours to create):**
  - set the AT Protocol service account (`ATPROTO_IDENTIFIER`, `ATPROTO_APP_PASSWORD`) and `ACTIVITYPUB_ACCESS_TOKEN`; Bluesky timelines and search are empty without them.
- **Plugins:** register the remaining 11 absolute-path plugins by name, as workspace and app dependencies.
- **Repo:** `apps/ecosystem/officiallyjust3` has layer paths that go one level too far up, which breaks `npm install`'s post-install step for the whole repo.

## After launch

- **Commerce:**
  - grow the backend contract to cover cart and catalog writes, and move pages onto composables;
  - remove `CommerceClient` and `/api/commerce/driver`, which is the source of the known test failure.
- **Social:** move feeds, posts, profiles and follows onto the federation API.
- **Tests:** add them for business (workspace) and ui-shell.
- **Indexing:** index Magento products into OpenSearch, or query Magento's own index.
- **Dropshipping:** port it to the sandbox and deploy it, as planned for after launch.
- **Localization:** a full extraction pass if more languages are added.

## Waiting on you

| Item | Needed for |
| --- | --- |
| Bluesky service account and an ActivityPub token | Social |
| Removing the search layer's unused adapter-magento and meeovi-atproto dependencies | Clean-up |
| Stripe test-mode purchase (or approval for me to run one on staging) | Blocker 1 |
| When to run the user clean-up | Blocker 3 |
| Approval for any change on live meeovi.com Magento | Moving to meeovi.com |
| Tax decision for Magento products | Moving to meeovi.com |
