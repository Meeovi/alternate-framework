# @mframework/auth-sso

Single sign-on (SSO). Sign-in through a company identity provider, over OIDC or SAML: the better-auth [`sso`](https://www.better-auth.com/docs/plugins/sso) plugin.

It plugs into the auth layer's single better-auth instance through the layer's
package hook (`layers/auth/modules/auth-plugins.ts`). The auth layer doesn't
include it; an app opts in by registering the package.

## Install

In the app's `package.json`:

```json
"@mframework/auth-sso": "file:../../../packages/plugins/Authentication/auth-sso"
```

and in its `nuxt.config.ts`:

```ts
modules: ['@mframework/auth-sso']
```

## What it does

- Provisioned users are written to the auth layer's audit log (`category: sso`).
- Organization provisioning is on. Managers, directors, VPs and the IT department become organization admins; everyone else joins as a member (`ssoOrganizationRole`).
- SAML checks `InResponseTo`, refuses IdP-initiated sign-in, and gives a request 10 minutes.
- `<AuthSsoSignIn>` asks for a work email and sends the user to the provider registered for its domain. It's global, and the module sets `appConfig.mframeworkAuth.sso`, which the workspace's account settings use to show it.

Identity providers are registered through better-auth's SSO endpoints (`/api/auth/sso/register`).

**Database:** `sso_provider` (already in the auth schema).

## Tests

`npm test` (vitest), `npm run typecheck`.
