# @mframework/auth-email-domains

Sign-up email domains: block sign-ups from domains you don't want, or
accept sign-ups only from domains you choose. It's a **sandboxed** auth
plugin. It runs in its own locked-down process, sees only the part of an
email after the @, and makes no outside connections. See
`../README.md` and the auth layer's README.

```ts
// nuxt.config.ts
modules: ['@mframework/auth-email-domains']
```

It's off until an admin turns it on from the integrations page
(`/workspace/integration/auth-email-domains`). The admin sets it there:

| Setting | |
| --- | --- |
| Mode | **block**: refuse the listed domains. **allow**: accept only the listed domains. |
| Domains | `example.com`, or `*.example.com` for its subdomains. An empty list restricts nothing. |
| Message | What a refused person sees. |

It checks every new account (`user.create.before`), whatever the sign-up
method: email, social, magic link or admin-created. It fails **closed**: if
the plugin breaks, new sign-ups are refused until it's fixed or switched
off. Refusals are counted per day in its store and written to the audit log
as `email-domains:sign_up_refused`.

`GET /api/auth/plugin/email-domains/check?email=a@example.com` returns
`{ "allowed": true | false }`, so a sign-up form can warn early.
