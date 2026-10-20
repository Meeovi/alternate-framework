# Authentication plugins

Packages that extend the auth layer's sign-in (layers/auth, one better-auth
instance). Each is a Nuxt module an app registers by name:

```ts
// apps/<app>/nuxt.config.ts
modules: ['@mframework/auth-email-domains']
```

```jsonc
// apps/<app>/package.json
"@mframework/auth-email-domains": "file:../../../packages/plugins/Authentication/auth-email-domains"
```

Registered plugins appear on the integrations page (`/workspace/integration`)
for admins, who switch each one on or off **for the whole site** and edit
its settings. No rebuild is needed.

There are two kinds. **Write new plugins as sandboxed plugins**; trusted is
for first-party code that needs better-auth itself (SSO, SCIM, OAuth
providers).

| | Sandboxed | Trusted |
| --- | --- | --- |
| Runs | In its own locked-down process | Inside the app's sign-in |
| Can use | The hooks, endpoints, hosts and permissions its manifest declares | Everything better-auth can |
| Starts | Off: an admin reviews and turns it on | On |
| Example | `auth-email-domains` | `auth-sso` |

## A sandboxed plugin

```
auth-my-plugin/
  package.json      the manifest: what it may do
  module.ts         registers it with the auth layer
  sandbox/
    server.mjs      its code: one self-contained ES module
    types.d.ts      types for it (copy from auth-email-domains)
  test/
```

### 1. The manifest (package.json)

The manifest is the trust anchor. The sandbox only runs what's declared
here, and admins see all of it before turning the plugin on. A manifest
that doesn't validate fails the app's build.

```jsonc
"mframework": {
  "integration": {
    "name": "My plugin",
    "description": "One sentence for the integrations page.",
    "category": "Authentication",
    "icon": "fas fa-key",
    "admin": true,
    "hosts": ["api.example.com"]       // the only outside hosts it may reach (optional)
  },
  "auth": {
    "hooks": ["user.create.before"],
    "paths": ["/sign-up/email"],       // only for request.before / request.after
    "endpoints": [{ "method": "GET", "path": "/check", "access": "public" }],
    "permissions": [],                 // "user:email" = see full email addresses
    "failMode": "closed",              // if it fails: "closed" refuses, "open" skips it (default open)
    "timeoutMs": 2000,                 // per call, 100-10000 (default 2000)
    "settings": {
      "domains": { "type": "list", "label": "Domains", "default": [], "help": "Shown under the field." }
    }
  }
}
```

**Hooks**

| Hook | Runs | Gets | May refuse |
| --- | --- | --- | --- |
| `user.create.before` | Before any account is created (every sign-up method) | `{ user }` | yes |
| `user.create.after` | After an account is created | `{ user }` | no |
| `session.create.before` | Before any sign-in completes | `{ user }` | yes |
| `session.create.after` | After a sign-in | `{ user }` | no |
| `request.before` | Before the auth requests in `paths` | `{ path, method, emailDomain }` | yes |
| `request.after` | After the auth requests in `paths` | `{ path, method, status, user }` | no |

`user` is a `PluginUser`: `id`, `name`, `emailDomain` (the part after the
@), `emailVerified`, `createdAt`. It includes `email` only with the
`user:email` permission. Plugins never see passwords, tokens, sessions,
roles or other columns.

**Endpoints** are served at `/api/auth/plugin/<id>/<path>`. The id is the
`name` the module registers. `access` is `public`, `user` (signed in) or
`admin`. Bodies (POST) are JSON up to 64 KB, and they're rate-limited to 60
a minute.

**Settings types**: `text`, `textarea`, `boolean`, `number`, `select` (with
`options`), `list` (of strings). The integrations page renders the form
from this, and the host validates every save against it.

### 2. module.ts

```ts
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type {} from './sandbox/types'

export default defineNuxtModule({
  meta: { name: '@mframework/auth-my-plugin', compatibility: { nuxt: '^4.0.0' } },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('mframework:auth-plugins', (plugins) => {
      plugins.push({ name: 'my-plugin', sandbox: resolve('./sandbox/server.mjs') })
    })
  },
})
```

### 3. sandbox/server.mjs

One self-contained ES module. It may import Node built-ins, but not files
or packages: bundle dependencies into it if you need them. It
default-exports its hooks and endpoints. Endpoints are keyed
`"<METHOD> <path>"`.

```js
/** @type {import('./types').SandboxedAuthPlugin} */
export default {
  hooks: {
    async 'user.create.before'({ user }, ctx) {
      if (ctx.settings.domains.includes(user.emailDomain)) {
        await ctx.audit('refused', { domain: user.emailDomain })
        return { deny: 'Sign-ups from this domain aren\'t allowed.' }   // shown to the user
      }
    },
  },
  endpoints: {
    async 'GET /check'({ query, user, admin }, ctx) {
      return { ok: true }                         // 200 with this JSON
      // or: return { status: 400, body: { error: '…' } }
    },
  },
}
```

`ctx` gives the plugin:

- `ctx.settings`: this site's settings, with defaults filled in. Read-only.
- `ctx.store`: the plugin's own key-value store: `get`, `set`, `delete`
  and `list(prefix)`. Values are JSON up to 16 KB each, 1000 keys at most.
  No other plugin can read it.
- `ctx.audit(action, details)`: an entry in the auth audit log, recorded
  as `<id>:<action>`.
- `ctx.log(...)`: a line in the server log.
- `fetch`: works only for the manifest's `hosts`, over public addresses.

Hooks must be quick. A call that passes `timeoutMs` kills the plugin's
process, and the plugin's `failMode` decides what happens to that sign-up
or sign-in.

### 4. Test it

The module is plain JS, so unit-test its functions directly (see
`auth-email-domains/test`). The auth layer's tests
(`layers/auth/test/__tests__/auth-plugins-*.spec.ts`) run plugins in real
sandbox processes.

## A trusted plugin

The module pushes `{ name, server, client }`:
- `server` default-exports `(ctx) => betterAuthPlugin | betterAuthPlugin[]`,
  where `ctx` is `{ logAuditEvent, sendAuthEmail }`;
- `client` default-exports `() => clientPlugin | clientPlugin[]`.

See `auth-sso`. While an admin has it switched off, its endpoints answer
404 and its request and database hooks don't run. Its database tables and
client plugin stay in the build.
