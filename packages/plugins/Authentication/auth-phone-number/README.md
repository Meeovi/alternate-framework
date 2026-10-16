# @mframework/auth-phone-number

Phone number sign-in. Sign-in with a one-time code sent to a phone number: the better-auth [`phoneNumber`](https://www.better-auth.com/docs/plugins/phone-number) plugin.

It plugs into the auth layer's single better-auth instance through the layer's
package hook (`layers/auth/modules/auth-plugins.ts`). The auth layer doesn't
include it; an app opts in by registering the package.

## Install

In the app's `package.json`:

```json
"@mframework/auth-phone-number": "file:../../../packages/plugins/Authentication/auth-phone-number"
```

and in its `nuxt.config.ts`:

```ts
modules: ['@mframework/auth-phone-number']
```

## What it does

- **No SMS provider is wired up yet.** In production, sending a code fails with "Phone sign-in is not available yet." rather than issuing a code nobody receives. In development the code is logged to the server console.
- Verifying a new number creates the account, with a placeholder email (`<number>@example.com`).

To launch it, replace `sendPhoneOTP` in `runtime/server.ts` with a real SMS send (for example Twilio Verify).

**Database:** the `phone_number` and `phone_number_verified` user columns (already in the auth schema).

## Tests

`npm test` (vitest), `npm run typecheck`.
