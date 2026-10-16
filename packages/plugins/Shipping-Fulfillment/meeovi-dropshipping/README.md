# @mframework/meeovi-dropshipping

Dropshipping for the marketplace. Each seller connects **their own** supplier
account; imported products are created in Magento **under that seller**
(Webkul Multi Vendor Marketplace), stock and prices stay in sync, paid orders
are forwarded to the supplier, and tracking comes back as a Magento shipment.

| Supplier | Seller connects with | Imports | Orders |
|---|---|---|---|
| **Printful** | Store-level private token | The seller's own designed products, at the retail prices set in Printful | Created as **drafts** — the seller confirms in Printful (or turns on auto-confirm) |
| **CJdropshipping** | CJ API key | Any CJ catalogue product, priced cost + the seller's markup | Created **unpaid** (`payType` 3) with the cheapest shipping — the seller pays in My CJ |

EPROLO: no public API documentation (available on request from their
support); add it as another provider once you have the docs.

## How it works

- **Connect** — `POST /api/dropshipping/connections` verifies the credentials
  with the supplier, then stores them sealed (AES-256-GCM, key from
  `NUXT_DROPSHIP_SECRET`). They are never returned to the browser.
- **Import** — up to 10 products at a time; each variant becomes a simple
  Magento product with SKU `DS-<SUPPLIER>-<magentoCustomerId>-<variant>`,
  created through `Meeovi_MarketplaceApi`'s `/V1/meeovi-marketplace/sync/*`
  routes. Re-importing updates instead of duplicating. Images are downloaded
  server-side (https, public hosts only, ≤ 8 MB, real JPEG/PNG/GIF).
- **Stock** — hourly: supplier stock → Magento qty; sold-out variants are
  disabled. Print-on-demand items show `printOnDemandQty` (default 999).
- **Orders** — every 10 minutes: Magento orders in `processing` (paid) with
  the seller's dropship SKUs are sent to the supplier, once per order
  (retried up to 3 times on errors).
- **Tracking** — when the supplier ships, the seller's items are shipped in
  Magento with the tracking number (customer notified).

Background jobs run in production only (`sync.enabled` to override).

## Setup

1. **Magento** — deploy the updated `Meeovi_MarketplaceApi` module
   (adapter-magento/magento-module) and run `setup:upgrade` +
   `setup:di:compile`. Then in *System → Integrations → (the app's
   Integration) → API*, grant: *Seller Catalogue Sync API (Meeovi
   Dropshipping)*, *Sales → Operations → Orders → Actions → View* and
   *→ Ship*, and re-activate it. The app's `MAGENTO_*` Integration env vars
   are reused.
2. **Directus** — create the collections (needs an admin token):
   ```bash
   DIRECTUS_URL=… DIRECTUS_ADMIN_TOKEN=… npm run setup:directus -w @mframework/meeovi-dropshipping
   ```
   Give no Directus role access to `dropship_*`. The app's `/api/cms` proxy
   refuses them for everyone.
3. **Secret** — `NUXT_DROPSHIP_SECRET` (≥ 32 random characters,
   `openssl rand -base64 48`). Changing it makes stored connections
   unreadable: sellers reconnect.
4. **Register in the app**:
   ```jsonc
   // apps/…/package.json
   "dependencies": {
     "@mframework/meeovi-dropshipping": "file:../../../packages/plugins/Shipping-Fulfillment/meeovi-dropshipping"
   }
   ```
   ```ts
   // nuxt.config.ts
   modules: ['@mframework/meeovi-dropshipping'],
   meeoviDropshipping: {
     // page: { path: '/workspace/stores/suppliers', layout: 'workspace', middleware: ['auth'] },
     // providers: ['printful', 'cj'],
     // sync: { stockEveryMinutes: 60, ordersEveryMinutes: 10 },
   },
   ```
   Also add the plugin to the root `package.json` `workspaces`.

Sellers then find **Suppliers** at `/workspace/stores/suppliers` (sellers
and admins only; the seller must be linked to a Magento customer).

## Options

| Option | Default | |
|---|---|---|
| `apiBase` | `/api/dropshipping` | |
| `sessionEndpoint` | `/api/auth/get-session` | Same-origin better-auth session |
| `roles` | `['seller', 'admin']` | Who may connect suppliers |
| `page` | `/workspace/stores/suppliers` | `false` for no page; use `<MeeoviDropshipping />` yourself |
| `providers` | `['printful', 'cj']` | |
| `sync` | stock 60 min, orders 10 min | `enabled` defaults to production only |
| `printOnDemandQty` | `999` | Magento qty for untracked (print-on-demand) items |

## Testing

`npx vitest run packages/plugins/Shipping-Fulfillment/meeovi-dropshipping/test`
covers pricing, credential sealing, SKU scoping, the image downloader's SSRF
guard and that CJ orders are never paid automatically. Live checks must not
confirm Printful drafts or pay CJ orders.
