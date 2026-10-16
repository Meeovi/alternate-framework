# @mframework/auth-anonymous

Anonymous sign-in. Guest accounts: the better-auth [`anonymous`](https://www.better-auth.com/docs/plugins/anonymous) plugin.

It plugs into the auth layer's single better-auth instance through the layer's
package hook (`layers/auth/modules/auth-plugins.ts`). The auth layer doesn't
include it; an app opts in by registering the package.

## Install

In the app's `package.json`:

```json
"@mframework/auth-anonymous": "file:../../../packages/plugins/Authentication/auth-anonymous"
```

and in its `nuxt.config.ts`:

```ts
modules: ['@mframework/auth-anonymous']
```

## What it does

- Each sign-in creates a user row, so it's limited to 5 per IP per hour (`ANONYMOUS_SIGN_IN_LIMIT`).
- When Turnstile is configured, the auth layer's captcha also covers `/sign-in/anonymous`.
- Guest emails use `example.com`.

**Database:** the `is_anonymous` user column (already in the auth schema).

## Tests

`npm test` (vitest), `npm run typecheck`.
