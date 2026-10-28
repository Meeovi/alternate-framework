# Production readiness: what's open

**Updated:** 27 October 2026
**Launch:** soft launch on **meeovi.com** at **00:00 UK time, Saturday 31 October** (Friday night).
**Scope:** meeovi-frontend, with commerce.meeovicms.com (Mage-OS 3.6.0) behind it through Directus. Releases move through three stages: local builds are alpha or beta, demo.meeovicms.com is the preview, and meeovi.com is production for users and the public.
**Finished work** is in [what's done](2026-10-24-production-readiness-done.md).

## Your side

Needs your access, a decision or your approval. Ordered by what blocks launch first. Last checked **27 October, evening**.

**Still to do**

1. **Approve closing meeDirectus's Public policy (blocks launch):** anyone can read orders (names, emails, payment ids), Directus users and messages straight from cms.meeovicms.com, and create, edit or delete posts, products, profiles and files there without signing in. I'll remove the 688 anonymous write and private-read permissions; public content stays readable. Backup: `/root/backups/meedirectus-public-policy-permissions-20261028.json`.
1. **Give production a live Shippo key:** the demo and production both use a Shippo test key (`shippo_test_…`), so no real shipping labels are bought. Put the live key in `SHIPPO_API_KEY` in `/home/meebuzo/.meeovi-prod/base.env` and tell me; I'll restart and check rates.
2. **Rotate the provider secrets** exposed in the breach: see [rotation list](#rotation-list), step 3. Put the new values in the env files and I'll copy them everywhere else.
3. **Try two sign-in buttons by hand on demo.meeovicms.com:** "Sign in with a passkey" and "Email me a sign-in link". Automated browsers can't get through the Turnstile check or the passkey prompt.
4. **Redeploy elitenovels and officiallyjust3** wherever they're hosted. Rocket.Chat's token secret changed.
5. *Optional:* an ActivityPub (Mastodon) access token, so ActivityPub can search more than public hashtags.

**Done**

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
- Directus private content (28 October): Directus's Public read rules now hide private posts, spaces, websites, showcases and videos, and private lists' links, the same way the app does. 2 private websites and 3 private showcases had been readable by anyone.
- Nuxt 4.6.3 and Vue 3.5.44 (28 October), which fix advisories about route rules and server-rendered attribute names. better-auth stays on 1.6.23 with the vendor's workaround for the magic-link account takeover (GHSA-965c-763c-88jm); 1.7 is after launch.
- Sandbox purchase on the demo (28 October): PayPal sandbox payment, order confirmation and the Novu "order placed" notification all worked. It showed that an international label needs a customs declaration; checkout now creates one.

## My side

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
5. **Copy rotated secrets everywhere they're used, then restart**, after your item 2.
6. **Rotate the OpenSearch admin password.** This is low risk: it only listens on this server.
7. **Fix Rocket.Chat's `Site_Url`.** It still points to `https://collaborrate.com`.
8. **Free disk space.** The disk is 96% full; the `/root/.npm` cache holds 7.6 GB. I'll clear it once you say yes.
9. **After launch:**
   - Upgrade better-auth to 1.7: it needs hand-written migrations (new OAuth provider tables for Pixanomy sign-in, `account.issuer` backfill, JWKS columns), then a manual test of every sign-in method. Then remove the magic-link workaround (`storeToken: 'hashed'`, `storeIdentifier: "plain"`).
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

### Live PayPal webhook

Run as root. It reads the live credentials from the env file and prints only the new webhook's id:

```
set -a; . <(grep -E '^NUXT_PAYPAL_(CLIENT_ID|CLIENT_SECRET)=' /home/meebuzo/.meeovi-prod/prod.env); set +a
T=$(curl -s -u "$NUXT_PAYPAL_CLIENT_ID:$NUXT_PAYPAL_CLIENT_SECRET" -d grant_type=client_credentials https://api-m.paypal.com/v1/oauth2/token | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])')
curl -s -H "Authorization: Bearer $T" -H 'Content-Type: application/json' \
  -d '{"url":"https://meeovi.com/api/payment/paypal/webhooks","event_types":[{"name":"PAYMENT.CAPTURE.COMPLETED"},{"name":"PAYMENT.CAPTURE.REFUNDED"},{"name":"PAYMENT.CAPTURE.REVERSED"},{"name":"CUSTOMER.DISPUTE.CREATED"}]}' \
  https://api-m.paypal.com/v1/notifications/webhooks | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id"))'
```

### Firewall

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
