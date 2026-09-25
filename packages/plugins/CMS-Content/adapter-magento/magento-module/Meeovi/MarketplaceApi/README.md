# Meeovi_MarketplaceApi

A small Magento 2 module that adds authenticated, customer-token-scoped REST
routes bridging to Webkul's "Multi Vendor Marketplace" extension:

- `POST /V1/meeovi-marketplace/seller/register` — registers the calling
  customer as a seller (creates/updates their `marketplace_userdata` row).
  Called automatically by the app's own registration flow when a user checks
  "become a seller" at signup (see adapter-magento's `createCustomer` and
  `runtime/server/commerce-link.ts`), but idempotent and safe to call again.
- `POST /V1/meeovi-marketplace/seller/products` — lets an approved seller
  create a product in one call: creates the core catalog product **and**
  Webkul's own seller-linkage record together, so you never get a catalog
  product that exists but isn't attributed to a seller (or vice versa).
- `GET /V1/meeovi-marketplace/seller/shop`, `PUT .../shop`,
  `GET .../products/list`, `GET .../orders`, `GET .../transactions`,
  `GET .../low-stock` — read-heavy `SellerDashboardManagementInterface`
  routes backing `layers/business`'s seller dashboard (shop profile,
  products, orders, commission transactions, low-stock report). See
  "Seller dashboard endpoints" below.

It does **not** modify `Webkul_Marketplace` — never patch a third-party
vendor module directly. It depends on it and calls its own classes.

## Verified against the real installed module (2026-09-12)

Webkul's Multi Vendor Marketplace is closed-source/paid, so this was
originally written against the pattern most commonly documented across the
wider Magento community for this extension. It has since been **re-read and
corrected against the actual installed copy** at
`app/code/Webkul/Marketplace` — every `Webkul\Marketplace\*` class, method,
and table this module touches was confirmed to exist with the signature used
here:

- **`Model/Product.php`** + **`Api/Data/ProductInterface.php`** — confirms
  `setMageproductId` / `setSellerId` / `setStatus` / `setIsApproved` /
  `setAdminPendingNotification` / `setCreatedAt` on
  `Webkul\Marketplace\Model\ProductFactory`, table `marketplace_product`
  (`Model/ResourceModel/Product.php`'s `_init`), PK `entity_id`.
- **`Controller/Product/SaveProduct.php::saveMaketplaceProductTable()`** —
  this is the method Webkul's own seller-panel "add product" flow calls; the
  `setIsApproved()` / `setAdminPendingNotification()` / `setStatus()` logic
  in this module's `linkProductToSeller()` mirrors it for the "new product"
  case, including the `marketplace/product_settings/product_approval` store
  config path (`etc/adminhtml/system.xml`) that gates auto-approval.
- **One thing worth knowing:** `Helper\Data::isSeller()` takes **no
  arguments** — it reads `$httpContext->getValue('customer_id')`, which
  Magento's `HttpContext` plugin only populates on a normal storefront
  request dispatch, **not** inside a `webapi.xml` REST service (that gets
  its identity from `UserContextInterface` instead). Calling `isSeller()`
  from a webapi service would silently check the wrong (empty) customer —
  so `assertIsApprovedSeller()` in `Model/SellerProductManagement.php`
  instead re-implements `Helper::getSellerCollectionObj()`'s own query
  directly (`Model/ResourceModel/Seller/Collection` filtered by
  `seller_id`/`store_id`, `Model/Seller.php`'s `getIsSeller()`) against the
  `$customerId` this module actually receives.

**If Webkul's Marketplace module is ever upgraded**, re-diff
`Model/SellerProductManagement.php`'s `Webkul\Marketplace\*` calls against
the same files (`Model/Product.php`, `Model/ResourceModel/Product.php`,
`Model/Seller.php`, `Controller/Product/SaveProduct.php`) before trusting
this again — this repo doesn't vendor a copy of Webkul's source, so there's
nothing here to diff against automatically.

## Deploy

Drop this directory in as `app/code/Meeovi/MarketplaceApi/` (simplest path —
this was authored as a standalone module, not published to a Composer repo,
so don't add it to `composer.json`'s `require` unless you set that up
yourself), then:

```bash
bin/magento module:enable Meeovi_MarketplaceApi
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

## What it does NOT handle yet

- **Product images/gallery** — not wired. Add via
  `\Magento\Catalog\Api\ProductAttributeMediaGalleryManagementInterface`
  once you know how images will actually arrive (upload endpoint, URL, …).
- **Admin-initiated creation on a seller's behalf** — the route now
  force-overrides `customerId` to the caller's own token identity
  (`%customer_id%` in `etc/webapi.xml`), which only resolves for a
  customer-type caller; an admin/Integration token gets `customerId`
  forced to `null` and fails. There's no separate admin ACL/route yet if
  you want ops tooling to create products on a seller's behalf.
- **Configurable/bundle/grouped products** — `buildProduct()` only builds a
  `simple` product.
- **Attribute-set-driven custom attributes** — only the fields in
  `createProduct()`'s signature are set; anything else on your attribute set
  is left at its default.
- **Allowed-category / allowed-attribute-set restrictions** — Webkul's own
  seller panel enforces `Helper::getAllowedCategoriesIds()` /
  `getAllowedAttributesetIds()` (per-seller or global restrictions on what
  they're allowed to list under); this module does not check those yet, so
  a seller can currently create a product under any attribute set / any
  category you pass in `categoryIds`.

## Calling it

```
POST /rest/V1/meeovi-marketplace/seller/products
Authorization: Bearer <the seller's own customer token, from
  POST /V1/integration/customer/token — NOT an admin token>
Content-Type: application/json

{
  "customerId": 42,
  "sku": "seller-42-first-product",
  "name": "Example Product",
  "price": 19.99,
  "description": "...",
  "shortDescription": "...",
  "qty": 10
}
```

`customerId` in the body is ignored/overwritten — Magento's webapi
framework force-replaces it with the caller's own token identity before
this module's code ever runs (the `<data><parameter name="customerId"
force="true">%customer_id%</parameter></data>` block in `etc/webapi.xml`,
resolved by `Magento\Webapi\Controller\Rest\ParamOverriderCustomerId`), so
a seller cannot create a product attributed to a different seller by
changing that field. (`resource ref="self"` by itself does *not* do this —
see `etc/webapi.xml`'s own comment for how that was verified.)

The caller must already have an **approved seller record**
(`marketplace_userdata.is_seller = 1` for that customer) — use
`POST /V1/meeovi-marketplace/seller/register` (below) to create one first.

Response:

```json
{
  "product_id": 123,
  "sku": "seller-42-first-product",
  "marketplace_product_id": 45
}
```

If your store has `Marketplace > Configuration > Product Settings > Product
Needs Approval` (`marketplace/product_settings/product_approval`) turned on,
the created product's marketplace linkage starts `is_approved = 0` /
`status = Pending` — exactly as if the seller had submitted it through
Webkul's own seller panel — and an admin needs to approve it from
Marketplace > Products before it's live for that seller.

## Registering as a seller

```
POST /rest/V1/meeovi-marketplace/seller/register
Authorization: Bearer <the customer's own token, from
  POST /V1/integration/customer/token — NOT an admin token>
Content-Type: application/json

{
  "customerId": 42,
  "shopUrl": "my-shop"
}
```

Same `%customer_id%` force-override as above: `customerId` in the body is
ignored and replaced with the caller's own identity, and `shopUrl` is
optional — a `seller-<customerId>` slug
is generated when omitted. Idempotent: calling it again for an existing
seller just re-applies the same fields (matches Webkul's own
`BecomesellerPost` controller, which doesn't distinguish "new" from
"already registered" either).

Response:

```json
{
  "seller_record_id": 9,
  "is_approved": true,
  "shop_url": "seller-42"
}
```

`is_approved: false` means `marketplace/general_settings/seller_approval`
is turned on for this store — the account is created but pending admin
approval from Marketplace > Sellers, same as the storefront "become a
seller" flow.

## Seller dashboard endpoints

`SellerDashboardManagementInterface` / `Model/SellerDashboardManagement.php`
— unlike the two routes above, every method here returns a **JSON-encoded
string**, not a typed `Api\Data\*` object. Deliberate: these back 5 fairly
wide, distinct row shapes for read-only reporting grids, and a full
Magento extensible-data-interface (Interface + Model + di.xml preference)
per shape is a lot of ceremony for that. `json_decode` the response body.

Unlike the two routes above, these are admin/Integration-only — never
called with a customer token — and use their own ACL resource
(`Meeovi_MarketplaceApi::seller_dashboard`, `etc/acl.xml`) rather than
`self`. `self` isn't a real ACL resource node, so an Integration calling a
`self`-scoped route needs "Resource Access: All" (Magento's ACL fallback
for any unregistered resource ID — see `Magento\Framework\Authorization\
Policy\Acl::isAllowed()`); a dedicated resource lets the Integration be
scoped to just these 6 routes. `customerId` is a plain query parameter
(GET) or body field (PUT) — nothing overwrites it automatically, which is
the intended, documented behavior here (an admin Integration explicitly
reads a specific seller's data on their behalf).

```
GET /rest/V1/meeovi-marketplace/seller/shop
Authorization: OAuth oauth_consumer_key="...", oauth_token="...", ... (OAuth 1.0a — see MagentoAdapter.seller.getShopProfile)
```
→ `{"shopName","shopUrl","bannerUrl","logoUrl","metaDescription","shippingPolicy","returnPolicy","socialLinks":{"facebook","twitter","instagram"},"isApproved"}`
(maps to `Webkul\Marketplace\Model\Seller`'s `marketplace_userdata` row;
404s if the caller has no seller record yet — register first).

```
PUT /rest/V1/meeovi-marketplace/seller/shop
Content-Type: application/json

{ "shopName": "...", "shippingPolicy": "...", ... }
```
Partial update — omit any field to leave it unchanged. Returns the same
shape as the GET above.

```
GET /rest/V1/meeovi-marketplace/seller/products/list
```
→ JSON array of `{id, name, sku, category, price, stock, status, updated}`
— every `marketplace_product` row for this seller, joined to the real
catalog product (name/sku/price) and its stock qty. `category` is always
`""` (not joined — add a category lookup if you need it). `status` is
mapped from Webkul's `Product::STATUS_*` constants to `active`/`draft`/
`archived`.

```
GET /rest/V1/meeovi-marketplace/seller/orders
```
→ JSON array of `{id, customer, items, total, paymentStatus,
fulfillmentStatus, placed}` — one row per real Magento order, grouped from
this seller's `marketplace_saleslist` line items. `total` is this
seller's portion of the order only (sum of their own line items), not the
order's full grand total — right for a multi-vendor order where other
sellers also have items in it. `paymentStatus`/`fulfillmentStatus` are
derived from the real `Magento\Sales\Api\Data\OrderInterface` (paid/
refunded amounts, order status), not any Webkul-side status column.

```
GET /rest/V1/meeovi-marketplace/seller/transactions
```
→ JSON array of `{id, order, product, saleAmount, commissionRate,
commissionAmount, netEarning, date}` — one row per `marketplace_saleslist`
line item (not grouped). `commissionRate` divides Webkul's stored
percentage number by 100 to get a 0–1 fraction — **not independently
re-verified against live data**, see `SellerDashboardManagement.php`'s
header comment.

```
GET /rest/V1/meeovi-marketplace/seller/low-stock
```
→ JSON array of `{id, name, sku, stock, threshold}` — this seller's
products at or below their configured `LowStockQuantity` (falls back to a
plain `10` if unset).
