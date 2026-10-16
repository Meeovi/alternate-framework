# @mframework/auth-scim

SCIM provisioning. Lets an identity provider create, update and remove members through SCIM 2.0: the better-auth [`scim`](https://www.better-auth.com/docs/plugins/scim) plugin.

It plugs into the auth layer's single better-auth instance through the layer's
package hook (`layers/auth/modules/auth-plugins.ts`). The auth layer doesn't
include it; an app opts in by registering the package.

## Install

In the app's `package.json`:

```json
"@mframework/auth-scim": "file:../../../packages/plugins/Authentication/auth-scim"
```

and in its `nuxt.config.ts`:

```ts
modules: ['@mframework/auth-scim']
```

## What it does

- Only site admins can mint a token for a provider with no organization. Organization admins and owners can mint one for their own organization's provider only (`canGenerateScimToken`). @better-auth/scim before 1.7 doesn't bind a non-organization provider to its owner, so this closes that gap.
- Every token minted is written to the audit log (`category: scim`).

**Database:** `scim_provider` (already in the auth schema).

## Tests

`npm test` (vitest), `npm run typecheck`.
