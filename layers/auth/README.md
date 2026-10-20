# layers/auth — local dev setup

Quick steps to run the `layers/auth` dev server locally with BetterAuth + Prisma.

1) Provide a Postgres database (example using Docker):

```bash
docker run --name mframework-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mframework_dev -p 5432:5432 -d postgres:15
```

2) Copy the example env and edit if needed:

```bash
cp .env.example .env.local
# Edit .env.local if your DB credentials differ or to set BASE_URL
```

3) (Optional) If your Prisma migrations are required, run them from the alternate-gateway core package — example:

```bash
cd ../../packages/modules/alternate-gateway/core
# If you have prisma/migrations set up, run migrate. If not, skip.
# npx prisma migrate deploy --schema=./prisma/schema.prisma --preview-feature
```

4) Start the auth layer dev server:

```bash
cd layers/auth
npm install
npm run dev
```

Nuxt will pick a free port if 3000 is taken (in my run it used 3006).

5) Test session creation (example curl):

```bash
curl -i -X POST "http://localhost:3006/api/auth/create-session" \
  -H "Content-Type: application/json" \
  -d '{"account":{"id":"test-session-123","acct":"test@local"}}'
```

If BetterAuth is configured and the DB is reachable, the endpoint will upsert the user and attempt to create a session cookie. If the DB isn't available you will see a 500 error from the upsert.

If you want me to attempt to run the server here (I will need a reachable Postgres instance or permission to start one), tell me and I can try to start a Docker Postgres and re-run the test.
## Auth plugins

The layer runs one better-auth instance (`server/utils/auth.ts`, built-in
plugin list in `shared/utils/plugins.ts`). Everything else plugs in from
packages in `packages/plugins/Authentication/`, registered by name in an
app's `modules`, in two tiers:

| Tier | What it is | Access | Starts |
| --- | --- | --- | --- |
| **Trusted** | Real better-auth plugins (first-party) | Full, inside sign-in | On |
| **Sandboxed** | A self-contained module run in its own locked-down process | Only what its manifest declares | Off, until an admin turns it on |

| Package | Tier | Adds |
| --- | --- | --- |
| `@mframework/auth-sso` | trusted | SSO over OIDC and SAML, plus `<AuthSsoSignIn>` |
| `@mframework/auth-scim` | trusted | SCIM provisioning |
| `@mframework/auth-generic-oauth` | trusted | Auth0, Keycloak, Okta, Entra ID, Slack and other OAuth providers (each one only when its env is set) |
| `@mframework/auth-phone-number` | trusted | Phone-number sign-in (no SMS provider yet) |
| `@mframework/auth-anonymous` | trusted | Guest accounts |
| `@mframework/auth-email-domains` | sandboxed | Block sign-up email domains, or allow only some |

**Admins switch every plugin on or off for the whole site, at run time**,
from the integrations page (`/workspace/integration`, Authentication
category), where they also see what a sandboxed plugin may do and edit its
settings. A plugin that's off is gone: its endpoints answer 404 and its
hooks don't run. Pages show a plugin's sign-in option only while it's on:
`useAuthPlugins().isOn('sso')` (from `GET /api/auth/plugin/enabled`).

How it fits together (`server/utils/plugins/`):

- `modules/auth-plugins.ts` collects packages from the
  `mframework:auth-plugins` hook: `{ name, server, client }` for trusted
  plugins (entry files the layer imports through `#auth-server-plugins` /
  `#auth-client-plugins`; servers get `{ logAuditEvent, sendAuthEmail }`), or
  `{ name, sandbox }` for sandboxed ones (read as text, validated against the
  package's `mframework.auth` manifest — a broken manifest fails the build).
- `host.ts` gates trusted plugins behind their switch, and adds one bridge
  plugin (`mframework-plugins`) that runs sandboxed plugins' hooks and
  endpoints.
- `runner.ts` + `sandbox-child.mjs`: each sandboxed plugin's process.
- `state.ts`: switches, settings and plugins' own data, in the
  `auth_plugins` schema (migration `20261020090000_auth_plugins_schema`).
- `server/plugins/auth-plugins.ts` registers the host as the integrations
  catalog's site scope.

### The sandbox

A sandboxed plugin's code never runs in the app. Its process is started
with Node's permission model and nothing allowed — no files, child
processes, workers, addons or inspector — no `eval` / `new Function`, an
empty environment (no secrets) and a 64 MB heap. Before the plugin loads,
the runner limits network connections to the hosts its manifest declares
(resolving names itself and refusing private and loopback addresses, so it
can't reach this server's services), turns off DNS and UDP, and takes away
`process.kill`. Each call has the plugin's timeout; a plugin that runs over
it is killed and restarted on the next call, and one that keeps failing is
paused.

It never sees better-auth, the database, sessions, passwords or tokens. It
gets the user fields in `PluginUser` (id, name, the part of the email after
the @, verified flag, created date; the full email only with the
`user:email` permission), its settings, its own key-value store and the
audit log. Its `*.before` hooks may refuse with a message; when it fails,
its manifest's `failMode` decides: `closed` refuses, `open` skips it.

Sandboxed plugins need a long-running Node server (the node-server preset):
serverless functions can't keep the processes, so there every call fails and
`failMode` decides.

Writing one: see `packages/plugins/Authentication/README.md`.
