# Incident Response Plan — Meeovi

For whoever is on call when something looks wrong. Commands are for the
production server (158.69.211.52) and assume a root shell. Keep this file
current: when a step here turns out wrong during an incident or drill, fix it
the same day.

## 1. Roles

One person can hold several roles in a small team, but name them at the start
of every incident (in the incident channel / notes).

| Role | Does | Default |
|---|---|---|
| **Incident lead** | Decides severity, containment, when it's over. Owns the timeline. | Site owner |
| **Technical responder** | Investigates, contains, fixes, restores. | Developer on call |
| **Communications** | Users, partners (Stripe, PayPal, Cloudflare, Supabase), and the ICO if required. | Site owner |
| **Scribe** | Writes down every action with a UTC timestamp — this becomes the report. | Anyone not hands-on |

Contacts (fill in and keep current):

- Site owner: ______________________
- Developer on call: ______________________
- Hosting (OVH) support: ______________________
- Supabase / Cloudflare / Stripe / PayPal accounts held by: ______________________

## 2. How incidents get noticed

| Signal | Where |
|---|---|
| Brute-force / credential stuffing bursts | `[abuse]` lines in `journalctl -u meeovi-demo` (email if `NUXT_SECURITY_ALERT_EMAIL` is set) — layers/auth/server/plugins/abuse-monitor.ts |
| App errors / crashes | Sentry (project `meeovi`); `journalctl -u meeovi-demo` |
| Sign-in / account activity | `auth.audit_log_entries` (status `failure` = failed attempts) |
| Browser-side injection attempts | `[csp]` lines in the app log (CSP report-only) |
| Web traffic | Apache logs in `/usr/local/apps/apache2/logs/`; Cloudflare dashboard → Security → Events |
| Reports from users / researchers | Support inbox |

## 3. Severity

| Level | Examples | Response |
|---|---|---|
| **SEV1** | Confirmed data breach; attacker has admin, database or server access; payments manipulated; site serving malware | Everyone, now. Contain first. ICO clock starts (see §6). |
| **SEV2** | Active attack not yet successful (sustained credential stuffing, scraping, DDoS); a secret exposed but no sign it was used; single account takeover | Within the hour. |
| **SEV3** | Vulnerability found but not exploited; suspicious-but-unexplained activity | Next working day; track to a fix. |

When unsure, pick the higher level and downgrade later.

## 4. First 30 minutes (SEV1/SEV2)

1. **Open a timeline** (scribe). UTC timestamps, who did what.
2. **Preserve evidence before changing anything** — containment destroys clues:
   ```bash
   mkdir -p /root/incident-$(date -u +%Y%m%dT%H%MZ) && cd $_
   journalctl -u meeovi-demo --since '-7 days' > app.log
   cp /usr/local/apps/apache2/logs/*.log . 2>/dev/null
   docker ps -a > containers.txt; docker logs meeDirectus --since 168h > directus.log 2>&1
   ```
   Export recent audit rows (Supabase SQL editor, or psql with NUXT_DATABASE_URL):
   ```sql
   copy (select * from auth.audit_log_entries where created_at > now() - interval '14 days')
     to stdout with csv header;
   ```
   Ask OVH for / take a server snapshot if the server itself may be compromised.
3. **Contain** — pick what fits (§5).
4. **Assess**: what data, which users, since when? Decide whether it's a personal-data breach (§6).

## 5. Containment playbook

**Take the app offline** (Apache then serves a 503):
```bash
systemctl stop meeovi-demo        # back: systemctl start meeovi-demo
```

**Under attack / DDoS**: Cloudflare dashboard → the zone → Overview → *Under Attack Mode*. Block an
IP or ASN: Security → WAF → Tools → IP Access Rules.

**Sign everyone out** (stolen session tokens, suspected account takeovers):
```sql
delete from public.sessions;            -- every user signed out
delete from public.sessions where user_id = '<id>';   -- one user
```
Session cookies are also cached for up to 60 s (better-auth cookie cache); rotating
`BETTER_AUTH_SECRET` invalidates them immediately, and signs everyone out too.

**Lock one account**: Workspace → Users → ban (better-auth admin), or
`update public.users set auth_banned = true, auth_ban_reason = 'incident' where id = '<id>';` (better-auth's ban lives in `auth_*` columns — never touch `role`/`banned_until`, those are Supabase's), then delete their sessions.

**Stop new sign-ups** (account spam): temporarily set `emailAndPassword.disableSignUp: true` in
layers/auth/server/utils/auth.ts and redeploy, or block `/api/auth/sign-up` in Cloudflare WAF (faster).

**Rotate secrets** — anything that may have been read. Where each lives: `/home/meebuzo/.meeovi-demo/base.env`
(copied from `apps/ecosystem/meeovi-frontend/.env` by deploy.sh — update **both**), overrides in
`demo.env`. Restart with `systemctl restart meeovi-demo`.

| Secret | Rotate at | Side effects |
|---|---|---|
| `BETTER_AUTH_SECRET` / `NUXT_BETTER_AUTH_SECRET` | `openssl rand -base64 32` | Everyone signed out; 2FA secrets and encrypted OAuth tokens are encrypted with it — rotate only with a plan to re-enrol 2FA |
| JWKS signing keys | delete rows in `public.jwks`; better-auth regenerates | Issued JWTs / OIDC tokens (Pixanomy SSO) stop verifying |
| `NUXTUS_DIRECTUS_STATIC_TOKEN`, `NOVELS_DIRECTUS_TOKEN` | Directus admin → the token user → regenerate | — |
| Directus admin passwords | Directus admin | — |
| `NUXT_DATABASE_URL` / `DB_PASSWORD` | Supabase → Database settings → reset password | Directus also uses the DB — update its stack in Portainer |
| `SUPABASE_KEY` (+ service role) | Supabase → API settings → roll JWT secret | All Supabase keys change |
| `NUXT_STRIPE_SECRET_KEY`, `NUXT_STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Developers | — |
| PayPal client secret | PayPal developer dashboard | — |
| `NUXT_POLAR_ACCESS_TOKEN`, `NUXT_POLAR_WEBHOOK_SECRET` | Polar dashboard | — |
| `MAGENTO_*` (Integration OAuth) | Magento admin → System → Integrations → reauthorize | — |
| `SHIPPO_API_KEY`, `SHIPPO_WEBHOOK_TOKEN` | Shippo dashboard | — |
| `NUXT_RESEND_API_KEY` / `RESEND_API_KEY` | Resend dashboard | — |
| `NUXT_TURNSTILE_SECRET_KEY`, `RECAPTCHA_SECRET_KEY` | Cloudflare / Google console | — |
| OAuth client secrets (Google, GitHub, Pixanomy OIDC client) | Provider consoles; `oauth_provider_client` for clients Meeovi issues | Users of that login re-consent |
| `ROCKETCHAT_*`, `NOVU_SECRET_KEY`, `CORAL_SSO_SECRET`, `NUXT_REDIS_PASSWORD` | Each service's admin / Portainer stack | Restart that service too |

**Close an exposed API path quickly**: the CMS proxy (layers/shared/server/api/cms/[...].ts) is the
gate for Directus; tightening `PUBLIC_READ_COLLECTIONS` / `USER_WRITABLE` and redeploying closes
collections. For speed, a Cloudflare WAF rule blocking the path works in seconds.

**Server compromise suspected**: snapshot first, then take the server off the network (OVH panel),
rebuild from a known-good snapshot, and rotate **every** secret above — assume all were read.

## 6. Personal-data breaches (UK / EU GDPR)

A breach is any accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or
access to personal data — including a misconfiguration that *exposed* data, even if you can't prove
it was read.

- **Report to the ICO within 72 hours** of becoming aware, unless it's unlikely to result in a risk
  to people's rights and freedoms: <https://ico.org.uk/for-organisations/report-a-breach/>. Report
  what you know; you can add details later. (EU users: the lead supervisory authority, same 72 h.)
- **Tell affected users without undue delay** when the risk to them is high (e.g. passwords,
  payment data, private messages, location exposed). Say what happened, what data, what you've done,
  what they should do (change password, watch for phishing).
- **Record every breach** — even ones you don't report — with facts, effects and remedial action
  (a row in the breach log below is enough).
- Payment card data: Stripe/PayPal hold card data, not us — but notify them if their keys or
  webhooks were involved.

## 7. Recovery and close-out

1. Fix the root cause (code change + test that would have caught it — add it to
   `packages/plugins/Scripts/prod-tests` or `security-lint` where possible).
2. Restore service; watch logs and the abuse monitor for 24–48 h.
3. **Post-incident review within a week** — blameless. What happened, timeline, what worked, what
   didn't, action items with owners. Update this document.

## 8. Breach / incident log

| Date (UTC) | Severity | Summary | Personal data? | ICO reported? | Users told? | Review link |
|---|---|---|---|---|---|---|
| 2026-10-15 | SEV2 | Supabase REST (anon key) could read/write `public.*` incl. sessions; closed by migrations 20261015130000/140000. No evidence of use found in the time available. | Yes (exposure) | ___ | ___ | security pass 2026-10 |
| 2026-10-14 | SEV2 | Redis / OpenSearch were internet-facing without auth; auth now required. | Possibly | ___ | ___ | — |

(The two rows above were found during the October 2026 security pass — decide and record whether
they needed reporting; for exposure without evidence of access, document the reasoning.)

## 9. Training and drills

- **Onboarding**: every new team member reads this file and docs/instructions/web-app-security.md,
  and gets least-privilege access (own accounts, no shared admin logins, 2FA on).
- **Quarterly** (30 min): run one tabletop scenario below; time how long each step takes; fix
  whatever was missing or wrong here.
- **Before each release**: `npm run security:lint` and `npm run security:test`.

### Tabletop scenarios

1. **Stolen admin password.** Sentry shows a burst of 403s, then an admin signs in from an unknown
   country and exports users. Walk through: evidence, signing them out, locking the account,
   rotating what an admin could see, deciding on ICO notification.
2. **Leaked `.env`.** Someone reports the production `.env` was pasted in a public chat. Walk through
   the rotation table end to end — which rotations break which integrations, and in what order.
3. **Credential stuffing.** `[abuse]` alerts: 4,000 failed sign-ins from 900 IPs in an hour, a few
   successes. Walk through: Cloudflare rules, forcing resets for the accounts that succeeded,
   telling those users.
4. **Directus data exposure.** A researcher shows `/api/cms/items/<collection>` returning other
   users' data. Walk through: closing the path, finding out how long it was open and what was read
   (Apache logs), and deciding on notification.
