# @mframework/auth-generic-oauth

More OAuth providers. Extra OAuth sign-in providers through better-auth's [`genericOAuth`](https://www.better-auth.com/docs/plugins/generic-oauth) plugin.

It plugs into the auth layer's single better-auth instance through the layer's
package hook (`layers/auth/modules/auth-plugins.ts`). The auth layer doesn't
include it; an app opts in by registering the package.

## Install

In the app's `package.json`:

```json
"@mframework/auth-generic-oauth": "file:../../../packages/plugins/Authentication/auth-generic-oauth"
```

and in its `nuxt.config.ts`:

```ts
modules: ['@mframework/auth-generic-oauth']
```

## What it does

Each provider is offered only when all of its env is set. With none set, the package adds nothing (no `/sign-in/oauth2` endpoints) and logs a warning.

| Provider | Env |
| --- | --- |
| Auth0 | `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_DOMAIN` |
| Gumroad | `GUMROAD_CLIENT_ID`, `GUMROAD_CLIENT_SECRET` |
| HubSpot | `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET` |
| Keycloak | `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_SECRET`, `KEYCLOAK_ISSUER` |
| LINE (`line-jp`) | `LINE_JP_CLIENT_ID`, `LINE_JP_CLIENT_SECRET` |
| Microsoft Entra ID | `MS_APP_ID`, `MS_CLIENT_SECRET`, `MS_TENANT_ID` |
| Okta | `OKTA_CLIENT_ID`, `OKTA_CLIENT_SECRET`, `OKTA_ISSUER` |
| Slack | `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` |
| Patreon | `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET` |

Sign in from the client with `authClient.signIn.oauth2({ providerId: 'okta' })`.

**Database:** none.

## Tests

`npm test` (vitest), `npm run typecheck`.
