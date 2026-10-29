# Production readiness: what's open

**Updated:** 29 October 2026
**Launch:** soft launch on **meeovi.com** at **00:00 UK time, Saturday 31 October** (Friday night). **Hard launch: Tuesday 1 December 2026.**
**Scope:** meeovi-frontend, with commerce.meeovicms.com (Mage-OS 3.6.0) behind it through Directus. Releases move through three stages: local builds are alpha or beta, demo.meeovicms.com is the preview, and meeovi.com is production for users and the public.
**Finished work** is in [what's done](2026-10-24-production-readiness-done.md). This page lists only what's still to do, before and after launch.

## Still to do: your side

Needs your access, a decision or your approval. Ordered by what blocks launch first. Last checked **29 October**.

1. **Rotate the provider secrets** exposed in the breach: see [rotation list](#rotation-list), step 3. Put the new values in the env files and I'll copy them everywhere else.
2. **Add a product as a seller by hand on demo.meeovicms.com:** **Workspace → Catalog → My products → Add product**. It's created in the store under your seller account and waits for approval. Automated browsers can't get through the Turnstile check.
3. **Redeploy elitenovels and officiallyjust3** wherever they're hosted. Rocket.Chat's token secret changed.

## Still to do: my side

I can do these without further input, unless a step depends on one of your items above.

1. **Launch night**:
   1. `deploy.sh` for the final `main`.
   2. Switch meeovi.com from the static pre-launch page to the app (Apache config swap).
   3. Set Novu to production.
   4. Lock demo.meeovicms.com behind a login. It becomes the private beta site.
   5. Run the production tests against https://meeovi.com.
   6. Make one real purchase with live PayPal.

   The full steps are in [launch plan](#launch-plan).
2. **Rerun the HTTPS-redirect and TLS checks** against https://meeovi.com. They can't pass on the local port.
3. **Check an international label is bought** on the next sandbox order to a non-US address (the order should show a tracking number).
4. **Improve mobile performance.** Lighthouse scores about 25 because of home-page hydration and the CookieYes, Google search and Turnstile widgets.
5. **Copy rotated secrets everywhere they're used, then restart**, after your item 1.
6. **Rotate the OpenSearch admin password.** This is low risk: it only listens on this server.
7. **Fix Rocket.Chat's `Site_Url`.** It still points to `https://collaborrate.com` (checked 29 October).

## After launch

All of this is built on one branch, **`post-launch`**, kept up to date with `main` and ready to merge **by Monday 30 November**, before the hard launch on 1 December. Nothing on it reaches meeovi.com until it's merged.

- Upgrade better-auth to 1.7: it needs hand-written migrations (new OAuth provider tables for Pixanomy sign-in, `account.issuer` backfill, JWKS columns), then a manual test of every sign-in method. Then remove the magic-link workaround (`storeToken: 'hashed'`, `storeIdentifier: "plain"`).
- Faster passkey sign-in: offer passkeys in the email field's autofill (conditional mediation), so the challenge is fetched when the page opens instead of when the button is pressed. Preparing the challenge takes about 0.6 s today, mostly round trips to the Supabase database (about 90 ms each).
- Liking, reposting and replying to Bluesky notes from Meeovi, as the member's own Bluesky account. Today those show as counts only.
- PayPal membership subscriptions.
- Mage-OS customer reCAPTCHA.
- Social as a federation client: phase 1 (member sessions and the lists API) is done on `post-launch`; the plan and phases 2 to 5 are in `docs/architecture/social-federation-client.md` there.
- Tests for business and ui-shell.
- Deploy dropshipping.

## Reference

### Launch plan

Production runs as `meeovi-prod` (systemd, 127.0.0.1:3012) from `/home/meebuzo/public_html/meeovi-app`. It's built from **committed `main`** in a separate worktree, so uncommitted work never ships. The last deploy was `88e41504` on 29 October (sign-in and profiles checked on both sites after the Stripe columns were dropped). Its env is `/home/meebuzo/.meeovi-prod/base.env` plus `prod.env`. meeovi.com still serves the static pre-launch page.

- Redeploy with `/home/meebuzo/.meeovi-prod/deploy.sh`. `--rollback` puts the previous build back.
- Switch meeovi.com over:
  1. `cp /home/meebuzo/.meeovi-prod/apache-meeovi.com.conf /var/webuzo-data/apache2/custom/domains/meeovi.com.conf`
  2. `httpd -t`, then `httpd -k graceful`.
  3. The current file is kept as `meeovi.com.conf.bak`.
- Set Novu to production:
  1. Set `NODE_ENV=production` in `/root/novu-3.19/api.env`.
  2. Run `docker compose up -d api` in that folder.
- Lock the demo (the code is in `layers/auth/server/middleware/site-lock.ts`):
  1. In `/home/meebuzo/.meeovi-demo/demo.env`, set:
     - `NUXT_SITE_LOCK_ENABLED=true`;
     - `NUXT_SITE_LOCK_BYPASS_TOKEN` to a new random value;
     - `NUXT_SITE_INDEXABLE=false`, so every page says `noindex` and `robots.txt` disallows everything.
  2. Run `systemctl restart meeovi-demo`. No rebuild is needed.
  3. Signed-out visitors now go to `/login`, and APIs answer 401. Still open: the sign-in pages, `/api/auth/*` (including passkeys, magic links and Pixanomy's sign-in), static files, and the PayPal, Shippo, Polar and Rocket.Chat webhooks. Files in `public/` (images, `llms.txt`) also stay readable: they're served before the lock runs. Tested 29 October on a private copy of the demo build.
  4. Run the production tests against the demo with `PROD_TEST_SITE_LOCK_BYPASS` set to that token.
  5. To unlock, set `NUXT_SITE_LOCK_ENABLED=false` and restart.
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
