# Production readiness: what's open

**Updated:** 27 October 2026
**Launch:** soft launch on **meeovi.com** at **00:00 UK time, Saturday 31 October** (Friday night).
**Scope:** meeovi-frontend, with commerce.meeovicms.com (Mage-OS 3.6.0) behind it through Directus. Releases move through three stages: local builds are alpha or beta, demo.meeovicms.com is the preview, and meeovi.com is production for users and the public.
**Finished work** is in [what's done](2026-10-24-production-readiness-done.md).

## Needs you

These need your access, your decision or your approval. They're ordered by what blocks launch first. Items marked **blocked for me** are ones I tried and the safety check refused.

| # | What | Why | How |
| --- | --- | --- | --- |
| 1 | **Change both Directus admin passwords** (blocked for me) | The admin accounts on cms.meeovicms.com and the novels Directus still log in with the `ADMIN_PASSWORD` value from their container env, which was readable by `meebuzo` (so exposed in the breach) | In each Directus admin: your avatar → Password. A password manager value, not a reused one |
| 2 | **Issue meeovi.com's origin certificate** (blocked for me) | The certificate Apache serves for meeovi.com is a self-signed placeholder that expired on 21 August. It only works while Cloudflare skips certificate checks (not Full (strict)), so the hop from Cloudflare to the server is unverified | Webuzo → SSL → Let's Encrypt for meeovi.com (with www), or `/usr/local/webuzo/bin/webuzo-cli --lets_encrypt domain=meeovi.com` as root |
| 3 | **Create the live PayPal webhook** (blocked for me) | Without it, PayPal can't tell the app about captures, refunds, reversals or disputes on meeovi.com | See [live PayPal webhook](#live-paypal-webhook); then put its id in `NUXT_PAYPAL_WEBHOOK_ID` in `/home/meebuzo/.meeovi-prod/prod.env` and `systemctl restart meeovi-prod` |
| 4 | **Google and GitHub sign-in callbacks** | Google answers `redirect_uri_mismatch` for meeovi.com (checked 27 October), so "Sign in with Google" fails there. GitHub only checks after you log in | Google Cloud Console → Credentials → the OAuth client → add `https://meeovi.com/api/auth/callback/google`. GitHub → Developer settings → the OAuth app → callback `https://meeovi.com/api/auth/callback/github` |
| 5 | **Install the firewall unit** (blocked for me) | MariaDB (3306), Redis (6379), both Directus servers (8011/8012), Coral (5000) and Rocket.Chat (3010/9458) listen on every interface and the server firewall accepts everything, so they're reachable from the internet, around Cloudflare | See [firewall](#firewall) |
| 6 | **A share image** | Links to meeovi.com preview with `layers/shared/public/og-image.png`, which is a blank dark rectangle (the code fix that stopped showing a Nuxt UI screenshot is in) | A 1200×630 Meeovi image: replace that file (then deploy), or upload it anywhere and set `NUXT_PUBLIC_APP_OG_IMAGE` in `prod.env` (restart only) |
| 7 | **Cloudflare settings** | The Turnstile widget must list meeovi.com as a hostname or every form fails there; Speed Brain breaks prefetch requests | Turnstile → the widget → Hostnames: add `meeovi.com`. Speed → Optimization: Speed Brain off |
| 8 | Set the store's tax rules in Mage-OS | The app charges exactly what Mage-OS works out. Today that's Michigan only (8.25%): the CA and NY rates exist but no rule uses them; one product has tax class None; shipping has no tax class | Stores > Tax Rules / Tax Zones and Rates, each product's Tax Class, and Configuration > Sales > Tax > Tax Classes |
| 9 | Rotate the provider secrets (step 3) | Exposed in the breach; only the provider can issue new ones | See [the rotation list](#rotation-list) |
| 10 | A PayPal sandbox **buyer** login, and one Turnstile tick | The full sandbox purchase needs someone to approve the payment; Cloudflare refuses automated browsers | PayPal developer dashboard → Sandbox accounts ("Personal"); sign in once on demo.meeovicms.com |
| 11 | Run the script that deletes the store's 20 test customers | Test and probe accounts copied from the old meeovi.com store. None has orders, seller data or tokens. My run was refused | `runuser -u meebuzo -- php -d memory_limit=2G < /root/backups/store-delete-test-customers.php`, then `mv /home/meebuzo/test-customers-backup-20261025.json /root/backups/` |
| 12 | Redeploy elitenovels and officiallyjust3 if they run anywhere | Rocket.Chat's token secret changed; their local `.env` files have the new value | Rebuild/restart wherever they're hosted |
| 13 | ActivityPub (Mastodon) access token | Without one, ActivityPub only searches public hashtags | Optional for launch |

### Live PayPal webhook

Run as root (it reads the live credentials from the env file and prints only the new webhook's id):

```
set -a; . <(grep -E '^NUXT_PAYPAL_(CLIENT_ID|CLIENT_SECRET)=' /home/meebuzo/.meeovi-prod/prod.env); set +a
T=$(curl -s -u "$NUXT_PAYPAL_CLIENT_ID:$NUXT_PAYPAL_CLIENT_SECRET" -d grant_type=client_credentials https://api-m.paypal.com/v1/oauth2/token | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])')
curl -s -H "Authorization: Bearer $T" -H 'Content-Type: application/json' \
  -d '{"url":"https://meeovi.com/api/payment/paypal/webhooks","event_types":[{"name":"PAYMENT.CAPTURE.COMPLETED"},{"name":"PAYMENT.CAPTURE.REFUNDED"},{"name":"PAYMENT.CAPTURE.REVERSED"},{"name":"CUSTOMER.DISPUTE.CREATED"}]}' \
  https://api-m.paypal.com/v1/notifications/webhooks | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id"))'
```

The live credentials themselves work (token request checked on 27 October). The only existing live webhook belongs to Braintree.

### Firewall

`/root/bin/meeovi-firewall.sh` drops new connections to those ports unless they come from loopback, the Docker/private ranges or the server's own IP. Apache, the containers and the apps on this server keep working, including the ones that use the public IP. Nothing outside the server was connected to them when I checked. To install it so it survives reboots:

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

In three steps. Every changed file is backed up (`*.bak-20261025-rotate`, `*.bak-20261027-rotate`, `/root/backups/store-rotation-20261027/`), and no value is printed. New values are in `/root/rotation-2026-10-27/` (root only).

**1. Secrets the app makes itself: done 25 October.** New `BETTER_AUTH_SECRET`, `NUXT_OG_IMAGE_SECRET`, `NUXT_SCRIPTS_PROXY_SECRET`, `NUXT_DROPSHIP_SECRET` and `SHIPPING_ADMIN_TOKEN`; the JWKS signing key replaced, every session signed out, and the Pixanomy sign-on client secret renewed (`/root/pixanomy-oidc-client-secret`).

**2. Services on this server: done 27 October**, each checked old-refused / new-working:

- the Nextcloud uploads account, the Directus static tokens and the Rocket.Chat admin token (25 October);
- **both Directus servers' `SECRET` and `KEY`**: they were the example values published in the public `directus-labs/agency-os` repository, so anyone could have signed a Directus admin token. Directus's own encrypted settings (an OpenAI key, the licence key and token) were re-encrypted with the new secret;
- the **Redis** passwords (`default`: Directus ×2, Coral, Novu, the app; `magento`: the store). Each service was moved to the new password while both worked, then the old one was removed;
- the **store's encryption key**, with every encrypted setting and integration secret re-encrypted; the "Meeovi App" integration's consumer key/secret and access token/secret; `MAGEOS_NOTIFY_SECRET`; and the store's database password;
- Rocket.Chat's `CREATE_TOKENS_FOR_USERS_SECRET`.

The Directus, Coral and Rocket.Chat containers were recreated with the same image, volumes, ports and networks; each old container is kept stopped as `<name>-old-20261027…` for rollback. The demo's build baked some of these values in, so `base.env` carries runtime overrides for them.

Left for later (low risk): the OpenSearch admin password (it only listens on this server, and meeovi-frontend doesn't use it).

**3. Provider dashboards (you):** Novu (Settings → API Keys → Regenerate), MongoDB Atlas (Novu, Coral and Rocket.Chat use it), Supabase (database password and keys; also meeDirectus's database), the MySQL and Postgres server at 68.183.119.22 (novels Directus, Ozone, Mastodon and the PDS use it), PayPal (sandbox and live), Polar, Resend, Shippo (API key, and its webhook URL token), Google and GitHub sign-in, Cloudflare Turnstile, the better-auth API key, the Bluesky app password, and Stripe if the account stays. Put the new values in the env files; I'll copy them to every other place they live and restart.

## Launch plan

**Ready now (27 October):** production runs as `meeovi-prod` (systemd, 127.0.0.1:3012) from `/home/meebuzo/public_html/meeovi-app`, built from **committed `main`** in a separate worktree so uncommitted work never ships. Its env is `/home/meebuzo/.meeovi-prod/base.env` plus `prod.env` (meeovi.com URLs and origins, **live PayPal**). meeovi.com still shows Webuzo's default page; the Apache config that switches it over is staged, not active.

- Redeploy: `/home/meebuzo/.meeovi-prod/deploy.sh` (build from `main`, swap, restart); `--rollback` puts the previous build back.

**Launch night**, after items 1–5 and 7:

1. `deploy.sh` for the final `main`.
2. Switch meeovi.com over: `cp /home/meebuzo/.meeovi-prod/apache-meeovi.com.conf /var/webuzo-data/apache2/custom/domains/meeovi.com.conf`, then `httpd -t` and `httpd -k graceful` (the current file is kept as `meeovi.com.conf.bak`).
3. Novu: `NODE_ENV=production` in `/root/novu-3.19/api.env`, then `docker compose up -d api` there.
4. Run the production tests against https://meeovi.com, and one real purchase with the live PayPal account.

**Rollback:** restore `meeovi.com.conf.bak` and reload Apache.

## I'm working on

1. **Production tests against the new production service** (27 October, http://127.0.0.1:3012 with a temporary trusted origin, removed afterwards): commerce 20/20, search 10/10, ui-shell 9/9, shared 32 + 5 blocked, social 15 + 7 blocked, business 16 + 1 blocked, auth-plugins 9/9, auth 30 + 23 blocked, security 12 + 1 blocked + 2 failed. The two failures are the HTTPS redirect and TLS-version checks, which can't pass on a local plain-HTTP port; they're rerun against https://meeovi.com on launch night. "Blocked" means the check needs a Turnstile tick or a PayPal buyer (item 10).
2. **A full PayPal sandbox purchase on the demo** (needs item 10): capture, webhook, Magento order, Webkul credit, and the order showing in Directus and on the Orders page.
3. **Mobile performance.** Lighthouse scores about 25: hydrating the large home page plus the CookieYes widget, Google CSE and Turnstile.

## After launch

- **Commerce:**
  - membership subscriptions on PayPal;
  - Mage-OS customer reCAPTCHA (app sign-up uses the public guest mutation);
  - drop the old Stripe database columns.
- **Social:** move feeds, posts, profiles and follows onto the federation API.
- **Tests** for business and ui-shell.
- **Dropshipping:** port it to the sandbox and deploy it.
- **Rocket.Chat** still calls itself `https://collaborrate.com` (`Site_Url`), so links it generates use the old domain.
- **Server:** the disk is 96% full (14 GB free); `/root/.npm` (7.6 GB) is a cache that can be cleared.
