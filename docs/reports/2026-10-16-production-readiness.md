# Production readiness: what's open

**Updated:** 29 October 2026
**Launch:** soft launch on **meeovi.com** at **00:00 UK time, Saturday 31 October** (Friday night).
**Scope:** meeovi-frontend, with commerce.meeovicms.com (Mage-OS 3.6.0) behind it through Directus. Releases move through three stages: local builds are alpha or beta, demo.meeovicms.com is the preview, and meeovi.com is production for users and the public.
**Finished work** is in [what's done](2026-10-24-production-readiness-done.md). This page lists only what's still to do, before and after launch.

## Still to do: your side

Needs your access, a decision or your approval. Ordered by what blocks launch first. Last checked **29 October**.

1. **Rotate the provider secrets** exposed in the breach: see [rotation list](#rotation-list), step 3. Put the new values in the env files and I'll copy them everywhere else.
2. **Try these by hand on demo.meeovicms.com.** Automated browsers can't get through the Turnstile check or the passkey prompt.
   - "Sign in with a passkey" and "Email me a sign-in link".
   - Adding a product as a seller: **Workspace → Catalog → My products → Add product**. It's created in the store under your seller account and waits for approval.
3. **Redeploy elitenovels and officiallyjust3** wherever they're hosted. Rocket.Chat's token secret changed.
4. **Say yes to clearing the npm cache** (my item 8). The disk is 97% full.

## Still to do: my side

I can do these without further input, unless a step depends on one of your items above.

1. **Launch night**:
   1. `deploy.sh` for the final `main`.
   2. Switch meeovi.com from the static pre-launch page to the app (Apache config swap).
   3. Set Novu to production.
   4. Run the production tests against https://meeovi.com.
   5. Make one real purchase with live PayPal.

   The full steps are in [launch plan](#launch-plan).
2. **Rerun the HTTPS-redirect and TLS checks** against https://meeovi.com. They can't pass on the local port.
3. **Check an international label is bought** on the next sandbox order to a non-US address (the order should show a tracking number).
4. **Improve mobile performance.** Lighthouse scores about 25 because of home-page hydration and the CookieYes, Google search and Turnstile widgets.
5. **Copy rotated secrets everywhere they're used, then restart**, after your item 1.
6. **Rotate the OpenSearch admin password.** This is low risk: it only listens on this server.
7. **Fix Rocket.Chat's `Site_Url`.** It still points to `https://collaborrate.com` (checked 29 October).
8. **Free disk space.** The disk is 97% full (12 GB free); the `/root/.npm` cache holds 8.2 GB. I'll clear it once you say yes.

## After launch

- Upgrade better-auth to 1.7: it needs hand-written migrations (new OAuth provider tables for Pixanomy sign-in, `account.issuer` backfill, JWKS columns), then a manual test of every sign-in method. Then remove the magic-link workaround (`storeToken: 'hashed'`, `storeIdentifier: "plain"`).
- Liking, reposting and replying to Bluesky notes from Meeovi, as the member's own Bluesky account. Today those show as counts only.
- PayPal membership subscriptions.
- Mage-OS customer reCAPTCHA.
- Drop the old Stripe database columns.
- Move social onto the federation API.
- Tests for business and ui-shell.
- Deploy dropshipping.

## Reference

### Launch plan

Production runs as `meeovi-prod` (systemd, 127.0.0.1:3012) from `/home/meebuzo/public_html/meeovi-app`. It's built from **committed `main`** in a separate worktree, so uncommitted work never ships. The last deploy was `97d3e07b` on 27 October; smoke tests passed 21/21 there and on the demo. Its env is `/home/meebuzo/.meeovi-prod/base.env` plus `prod.env`. meeovi.com still serves the static pre-launch page.

- Redeploy with `/home/meebuzo/.meeovi-prod/deploy.sh`. `--rollback` puts the previous build back.
- Switch meeovi.com over:
  1. `cp /home/meebuzo/.meeovi-prod/apache-meeovi.com.conf /var/webuzo-data/apache2/custom/domains/meeovi.com.conf`
  2. `httpd -t`, then `httpd -k graceful`.
  3. The current file is kept as `meeovi.com.conf.bak`.
- Set Novu to production:
  1. Set `NODE_ENV=production` in `/root/novu-3.19/api.env`.
  2. Run `docker compose up -d api` in that folder.
- **Rollback:** restore `meeovi.com.conf.bak`, then reload Apache.

### Rotation list

Rotation happens in three steps. Changed files are backed up as `*.bak-20261025-rotate` and `*.bak-20261027-rotate`, and the store's files in `/root/backups/store-rotation-20261027/`. New values are in `/root/rotation-2026-10-27/` (root only).

1. **App secrets: done 25 October.**
   - Auth, OG-image, scripts-proxy, dropship and shipping secrets.
   - The JWKS key.
   - The Pixanomy sign-on client secret.
2. **Services on this server: done 27 October.**
   - The Nextcloud uploads account.
   - Both Directus servers' tokens, `SECRET` and `KEY`.
   - The Rocket.Chat tokens.
   - The Redis passwords.
   - The store's encryption key, integration and database password.
   - `MAGEOS_NOTIFY_SECRET`.

   The old containers are kept stopped as `<name>-old-20261027…` for rollback.
3. **Provider dashboards (you).** Novu is done (Production environment, 27 October). Stripe and the old store's Magento and Amasty composer keys are skipped: that store has been removed.
   - MongoDB Atlas.
   - Supabase.
   - The MySQL/Postgres server at 68.183.119.22.
   - PayPal (sandbox and live).
   - Polar.
   - Resend.
   - Shippo: the API key and its webhook token.
   - Google and GitHub sign-in.
   - Cloudflare Turnstile.
   - The better-auth API key.
   - The Bluesky app password.
