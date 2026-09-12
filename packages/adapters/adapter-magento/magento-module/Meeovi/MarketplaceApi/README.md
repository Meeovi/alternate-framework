# Meeovi_MarketplaceApi

A small Magento 2 module that adds one authenticated REST route —
`POST /V1/meeovi-marketplace/seller/products` — letting a signed-in customer
who is an approved Webkul "Multi Vendor Marketplace" seller create a product
in one call: it creates the core catalog product **and** Webkul's own
seller-linkage record together, so you never get a catalog product that
exists but isn't attributed to a seller (or vice versa).

It does **not** modify `Webkul_Marketplace` — never patch a paid/closed-source
vendor module directly. It depends on it and calls its own classes.

## ⚠️ Verify before deploying — read this first

Webkul's Multi Vendor Marketplace extension for Magento 2 is **closed-source
and paid** — while writing this module its exact installed internals
(class names, method names, table/column names) could not be independently
re-verified (its GitHub org has no public source for it, and Webkul's own
docs site doesn't publish a database/class reference). Everything this
module assumes about `Webkul\Marketplace\*` is the pattern most consistently
documented across the wider Magento community for this specific extension —
**not** something read out of your actual installed copy.

Two spots in `Model/SellerProductManagement.php` carry that risk, both
clearly marked `// VERIFY:` in the code:

1. **`assertIsApprovedSeller()`** calls `Webkul\Marketplace\Helper\Data::isSeller($customerId)` — the standard "is this customer an approved seller" gate.
2. **`linkProductToSeller()`** calls `Webkul\Marketplace\Model\ProductFactory::create()->setMageproductId($id)->setSellerId($customerId)->save()` — the standard way to write the `marketplace_product` linkage row.

**Before enabling this in any environment that matters, confirm both against
your actual installed copy:**

```bash
# From your Magento root:
find . -path '*/webkul/*marketplace*' -o -path '*/Webkul/Marketplace*' 2>/dev/null
cat vendor/webkul/module-marketplace/Helper/Data.php   | grep -n "function is"
cat vendor/webkul/module-marketplace/Model/Product.php | grep -n "function (get|set)"
cat vendor/webkul/module-marketplace/etc/db_schema.xml  # or Setup/InstallSchema.php on an older version
```

If any class/method name differs, Magento will fail loudly and specifically
at `bin/magento setup:di:compile` (missing class) or on first real request
(missing method) — that's by design here (a loud, obvious failure beats a
silent wrong write), and the error will name exactly which assumption to
fix. Update the two methods above to match, nowhere else needs to change.

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

`setup:di:compile` is the moment that surfaces a wrong Webkul class/method
name — don't skip straight to a live request without running it first.

## What it does NOT handle yet

- **Product images/gallery** — not wired. Add via
  `\Magento\Catalog\Api\ProductAttributeMediaGalleryManagementInterface`
  once you know how images will actually arrive (upload endpoint, URL, …).
- **Admin-initiated creation on a seller's behalf** — the route is
  customer-token-scoped (`self`); an admin token bypasses the self-check
  (Magento's own default), but there's no separate admin ACL/route yet if
  you want ops tooling to hit this differently.
- **Configurable/bundle/grouped products** — `buildProduct()` only builds a
  `simple` product.
- **Attribute-set-driven custom attributes** — only the fields in
  `createProduct()`'s signature are set; anything else on your attribute set
  is left at its default.

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

`customerId` in the body only matters for an admin-token caller — for a
customer token it's overwritten/verified by Magento's webapi framework
against the token's own identity before this module's code ever runs (see
the `resource ref="self"` comment in `etc/webapi.xml`), so a seller cannot
create a product attributed to a different seller by changing that field.

Response:

```json
{
  "product_id": 123,
  "sku": "seller-42-first-product",
  "marketplace_product_id": 45
}
```
