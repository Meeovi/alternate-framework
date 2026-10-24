# Production readiness: what's open

**Updated:** 24 October 2026
**Scope:** meeovi-frontend at demo.meeovicms.com, moving to meeovi.com with commerce.meeovicms.com (Mage-OS 3.6.0) behind it through Directus.
**Finished work** is in [what's done](2026-10-24-production-readiness-done.md).

## Needs you

These need your access, your decision or your approval. They're ordered by what blocks launch first.

| # | What | Why | How |
| --- | --- | --- | --- |
| 1 | Restore the DNS record for `app.pixanomy.com` | It no longer resolves (checked 24 October), so every upload fails and uploaded images don't load. Nextcloud itself is fine on this server | At GoDaddy (the domain's nameservers are `ns57/ns58.domaincontrol.com`): add an `A` record `app` → `158.69.211.52`, or move the nameservers back to Cloudflare if that's where the records were. This happened before, on 20 October |
| 2 | Merge `beta/production-readiness` into `main` and push | The 24 October fixes are deployed to the demo but only committed locally | `git checkout main && git merge --ff-only beta/production-readiness && git push origin main` |
| 3 | Upgrade or retire live meeovi.com's Magento (2.4.8-p2) | It was exploited on 18 October; only an `.htaccess` stopgap protects it | Retiring is simpler, since meeovi.com moves to the new app with commerce.meeovicms.com behind it |
| 4 | Rotate every secret on the server, then sign out all sessions | The attacker ran code as `meebuzo`, which can read them all | See [the rotation list](#rotation-list) |
| 5 | Deploy the current `Meeovi_MarketplaceApi` to commerce | The store's copy is older: unapproved seller products can be switched on by a sync | Copy the module from `packages/plugins/CMS-Content/adapter-magento/magento-module/Meeovi/MarketplaceApi`, then `setup:upgrade` and `di:compile` |
| 6 | Remove Stripe from commerce.meeovicms.com | It still holds the LIVE keys copied from meeovi.com | Remove the module, or clear its keys in the store config |
| 7 | Delete the live Stripe webhook to `https://commerce.meeovicms.com/stripe/webhooks` | It sends live events to the test store | Stripe dashboard, if the account is still reachable |
| 8 | Decide who calculates tax on store products | Nothing does since Stripe Tax went | Mage-OS tax rules are the usual choice |
| 9 | Live PayPal keys and webhook for meeovi.com, and the first live purchase | The demo has sandbox keys; I don't test captures with live keys | — |
| 10 | Tick the Turnstile checkbox once, signed out, on the real site | Cloudflare refuses automated browsers | Sign in once on demo.meeovicms.com |
| 11 | Switch Novu to `NODE_ENV=production` | It still runs as `local` | Change `/root/novu-3.19/api.env`, then `docker compose up -d api` in that folder |
| 12 | A PayPal sandbox **buyer** login | The full sandbox purchase needs someone to approve the payment in PayPal | From the PayPal developer dashboard, Sandbox accounts (a "Personal" account) |
| 13 | Decide whether signed-out visitors may open public posts, spaces and lists | Search shows them to everyone, but every social page requires sign-in, so a guest clicking a result lands on the login page | Keep it (results act as a teaser), let guests read Public content, or show social results to signed-in users only |
| 14 | ActivityPub (Mastodon) access token | Without one, ActivityPub only searches public hashtags | Optional for launch |
| 15 | Decide on the QA accounts and the test orders #000000005–#000000008 on commerce | They're test data | Keep, cancel or delete |

### Rotation list

Rotate these, then sign out all sessions:

- the app `.env` files and `demo.env`;
- both stores' `env.php`;
- the Directus tokens, and remove the "Meeovi Administrator" static token;
- the Mage-OS Integration tokens;
- JWKS, the OAuth client secret and API keys;
- the Redis passwords;
- the OpenSearch admin password (printed in a tool output on 24 October);
- the PayPal keys;
- the Bluesky app password;
- `MAGEOS_NOTIFY_SECRET`.

## I'm working on

1. **A full PayPal sandbox purchase on the demo** (needs the buyer login, item 12): capture, webhook, Magento order, Webkul credit, and the order showing in Directus and on the Orders page.
2. **Mobile performance.** Lighthouse scores about 25: hydrating the large home page plus the CookieYes widget, Google CSE and Turnstile.

**Deployed to the demo on 24 October** and retested there: every production suite passes except U5 (uploads), which waits on the `app.pixanomy.com` DNS record (item 1). Details are in [what's done](2026-10-24-production-readiness-done.md).

## Before the move to meeovi.com

These are settings for the new host. Most are server config, so do them together at the move:

- app env: site URL, trusted origins and proxies, the PayPal live webhook;
- Apache: `mod_remoteip` (the real client IP), the Novu proxy, and `no-store` on `sw.js`;
- the CSP host list;
- the Rocket.Chat iframe origin;
- Cloudflare: switch Speed Brain off.

## After launch

- **Commerce:**
  - membership subscriptions on PayPal;
  - Mage-OS customer reCAPTCHA (app sign-up uses the public guest mutation);
  - drop the old Stripe database columns.
- **Social:** move feeds, posts, profiles and follows onto the federation API.
- **Tests** for business and ui-shell.
- **Dropshipping:** port it to the sandbox and deploy it.
- **Commerce store** homepage is sent as `no-cache`. It matters little now that the app reads the store through Directus.
