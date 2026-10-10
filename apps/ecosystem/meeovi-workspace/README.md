# Meeovi Workspace

Seller/admin panel for Meeovi, built as a Nuxt 4 app on the M Framework layers
(`shared`, `auth`, `search`, `commerce`, `social`, `business`, `ui-shell`).

The admin chrome is the [Berry free Vuetify template](https://github.com/codedthemes/berry-free-vue-admin-template)
(MIT, see `LICENSE`), moved into `layers/ui-shell` as the `workspace` layout:

- `layers/ui-shell/app/layouts/workspace.vue`
- `layers/ui-shell/app/components/menus/workspace/` — sidebar, header, customizer, footer
- `layers/ui-shell/app/assets/workspace/berry.css` — Berry's styles (plain CSS)
- `layers/ui-shell/app/composables/useWorkspaceShell.ts` — layout state + Berry colour theme

Pages come from the layers: seller tools under `/dashboard/*` (business),
`/login` / `/register` / `/settings` (auth), `/connect/*` and `/lists` (social),
`/search` (search). This app only adds the home dashboard (`app/pages/index.vue`)
and the error page.

## Backend

The app is backend agnostic: the home dashboard and every `/dashboard/*` page
read seller data only through layers/business' `useBusinessDriver()` →
`POST /api/business/driver`, never a backend SDK. Which backend answers is a
server-side setting:

| `BUSINESS_BACKEND` | Backend |
| --- | --- |
| `magento` | Magento 2 + Webkul marketplace via `@mframework/adapter-magento` (needs `MAGENTO_GRAPHQL_URL` and the 4 `MAGENTO_CONSUMER_*` / `MAGENTO_ACCESS_TOKEN*` OAuth values) |
| `mock` | Bundled sample data |
| unset | First configured backend, else mock |

To swap Magento out, add a backend to `BACKENDS` in
`layers/business/server/plugins/register-business-driver.ts` that implements
`BusinessDriverContract` (alternate-sdk) and set `BUSINESS_BACKEND` to its name.
Sellers without a linked Magento customer (`users.magento_customer_id`) see mock
data.

## Setup

Uses the same environment as meeovi-frontend (database, better-auth, Directus,
Magento, …): copy `apps/ecosystem/meeovi-frontend/.env` and add this app's
origin (`http://localhost:3006`, …) to `NUXT_TRUSTED_ORIGINS`.

```bash
npm install --foreground-scripts   # from the monorepo root
npm run dev                        # http://localhost:3006
```
