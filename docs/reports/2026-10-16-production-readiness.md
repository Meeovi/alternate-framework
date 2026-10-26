# Production readiness: what's open

**Updated:** 25 October 2026
**Scope:** meeovi-frontend, with commerce.meeovicms.com (Mage-OS 3.6.0) behind it through Directus. Releases move through three stages: local builds are alpha or beta, demo.meeovicms.com is the preview, and meeovi.com is production for users and the public.
**Finished work** is in [what's done](2026-10-24-production-readiness-done.md).

## Needs you

These need your access, your decision or your approval. They're ordered by what blocks launch first.

| # | What | Why | How |
| --- | --- | --- | --- |
| 1 | Rotate every secret on the server (step 1 of 3 done; sessions signed out) | The attacker ran code as `meebuzo` through the old meeovi.com Magento (now taken down), which can read them all | See [the rotation list](#rotation-list) |
| 2 | Run the Stripe script for commerce.meeovicms.com | It still holds the LIVE keys copied from the old meeovi.com, and the Stripe methods are still marked active | `bash /root/backups/commerce-stripe-off.sh` as root: backs up the encrypted rows to `/root/backups/commerce-stripe-config-20261025.json`, removes the four keys, and switches the Stripe methods and webhook records off. My run was refused by the safety check |
| 3 | Approve deploying tax from the store | Tax now comes from Mage-OS through Directus (built and tested, not deployed). Until all three parts are live, checkout has no tax | In this order, since the app refuses checkout when the store can't quote tax: (1) `Meeovi_MarketplaceApi` to commerce with `setup:upgrade` and `setup:di:compile` (new API route and classes; the store is in production mode); (2) the built Directus extension into the `directus_extensions` volume, then restart `meeDirectus`; (3) build and deploy the app to the demo |
| 4 | Set the store's tax rules in Mage-OS | The app charges exactly what Mage-OS works out. Today that's Michigan only (8.25%): the CA and NY rates exist but no rule uses them; the Habit Tracker's tax class is None; shipping has no tax class | Stores > Tax Rules / Tax Zones and Rates, each product's Tax Class, and Configuration > Sales > Tax > Tax Classes |
| 5 | Live PayPal keys and webhook for meeovi.com, and the first live purchase | The demo has sandbox keys; I don't test captures with live keys | — |
| 6 | Tick the Turnstile checkbox once, signed out, on the real site | Cloudflare refuses automated browsers | Sign in once on demo.meeovicms.com |
| 7 | A PayPal sandbox **buyer** login | The full sandbox purchase needs someone to approve the payment in PayPal | From the PayPal developer dashboard, Sandbox accounts (a "Personal" account) |
| 8 | ActivityPub (Mastodon) access token | Without one, ActivityPub only searches public hashtags | Optional for launch |
| 9 | Run the script that deletes the store's 20 test customers | Test and probe accounts copied over from the old meeovi.com store (Copilot, Claude …, Cleanup Check, a scanner's "PoCTestCVE Detector", a spam sign-up). None has orders, seller data or tokens. My run was refused by the safety check | `runuser -u meebuzo -- php -d memory_limit=2G < /root/backups/store-delete-test-customers.php`, then `mv /home/meebuzo/test-customers-backup-20261025.json /root/backups/`. It checks each id's email again and skips any customer that has an order |

### Rotation list

In three steps. Every changed file is backed up as `*.bak-20261025-rotate`, and no value is printed.

**1. Secrets the app makes itself: done 25 October.** New `BETTER_AUTH_SECRET`, `NUXT_OG_IMAGE_SECRET`, `NUXT_SCRIPTS_PROXY_SECRET`, `NUXT_DROPSHIP_SECRET` (also set as its runtime override `NUXT_MEEOVI_DROPSHIPPING_SECRET`) and `SHIPPING_ADMIN_TOKEN`, in meeovi-frontend's `.env` and the demo's `base.env` (the starter template's `.env` shared the auth secret, so it has the new one too). The JWKS signing key was replaced, every session signed out, and the Pixanomy sign-on client secret renewed (saved in `/root/pixanomy-oidc-client-secret` for Nextcloud's sign-on app). Nothing stored needed re-encrypting: no two-factor users, no stored social tokens, no supplier credentials. The demo was restarted, not rebuilt.

**2. Services on this server: in progress.**

Done 25 October, each checked old-refused / new-working, demo restarted:

- the Nextcloud uploads account: a new app password for the app, and a new random login password (`/root/nextcloud-meeovi-uploads-login-password`);
- the Directus static tokens: the app server's, and the "Meeovi Administrator" one (rotated, kept for admin work in `/root/directus-admin-token`). **pixanomy.com on Vercel**: if its environment used the admin token, give it the new value;
- the Rocket.Chat admin token (personal access token "meeovi").

The demo build had baked in some of these at build time, so `base.env` now carries runtime overrides (`NUXT_DIRECTUS_TOKEN`, `NUXT_MEEOVI_*_DIRECTUS_TOKEN`, `NUXT_MEEOVI_DISCUSSIONS_ADMIN_TOKEN`); a check confirms no old value is still in effect.

Still to do: the Redis password (also in the Directus, Novu and Coral containers), the Mage-OS Integration tokens and `MAGEOS_NOTIFY_SECRET` (also in the Directus container), Rocket.Chat's `CREATE_TOKENS_FOR_USERS_SECRET` (its container; the compose folder is gone, so it has to be rebuilt from `docker inspect`), the OpenSearch admin password, and the store's database password and `env.php`.

**3. Provider dashboards (you):** Novu (Settings → API Keys → Regenerate; its API won't do it with the key), MongoDB Atlas (also Rocket.Chat's database), Supabase (database password and keys), PayPal (sandbox and live), Polar, Resend, Shippo (API key, and its webhook URL token), Google and GitHub sign-in, Cloudflare Turnstile, the better-auth API key, the Bluesky app password, and Stripe if the account stays (a Stripe Tax publishable key and the encrypted secret key were printed in a tool output on 25 October). Put the new values in the env files; I'll copy them to every other place they live and restart.

## I'm working on

1. **A full PayPal sandbox purchase on the demo** (needs the buyer login, item 7, and the tax deploy, item 3): capture, webhook, Magento order, Webkul credit, and the order showing in Directus and on the Orders page.
2. **Mobile performance.** Lighthouse scores about 25: hydrating the large home page plus the CookieYes widget, Google CSE and Turnstile.

**Retested on the demo on 25 October:** every production suite passes, with no failures. What remains blocked needs a Turnstile tick (item 6) or a PayPal buyer (item 7). Since then the QA accounts were deleted, so signed-in checks are blocked until item 9 is decided. Details are in [what's done](2026-10-24-production-readiness-done.md).

## Before the move to meeovi.com

These are settings for the new host. Most are server config, so do them together at the move:

- app env: site URL, trusted origins and proxies, the PayPal live webhook;
- Apache: `mod_remoteip` (the real client IP), the Novu proxy, and `no-store` on `sw.js`;
- the CSP host list;
- the Rocket.Chat iframe origin;
- Cloudflare: switch Speed Brain off;
- Novu: `NODE_ENV=production` in `/root/novu-3.19/api.env`, then `docker compose up -d api` in that folder.

## After launch

- **Commerce:**
  - membership subscriptions on PayPal;
  - Mage-OS customer reCAPTCHA (app sign-up uses the public guest mutation);
  - drop the old Stripe database columns.
- **Social:** move feeds, posts, profiles and follows onto the federation API.
- **Tests** for business and ui-shell.
- **Dropshipping:** port it to the sandbox and deploy it.
- **Commerce store** homepage is sent as `no-cache`. It matters little now that the app reads the store through Directus.
