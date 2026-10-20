# Meeovi_GiftCards

Gift cards from the Ecomteck_GiftCard extension, for the Meeovi app. The
module only reads data and leaves the Ecomteck modules unchanged.

## What it adds

- **GraphQL support for the `giftcard` product type** (`GiftCardProduct`, with
  `giftcard_amounts`, `allow_open_amount`, `open_amount_min` and
  `open_amount_max`). Ecomteck ships without it. Without this module, any
  storefront `products` query that returns a gift card fails with "Concrete
  type for ProductInterface not implemented", including catalogue pages and
  site search.
- **Three read-only REST routes** for the app's server, all behind
  `Meeovi_GiftCards::read`:

  | Route | Returns |
  | --- | --- |
  | `GET /V1/meeovi-giftcards/products` | SKUs of the enabled gift card products |
  | `GET /V1/meeovi-giftcards/received?email=` | Enabled gift cards sent to that email address |
  | `GET /V1/meeovi-giftcards/customers/:customerId/purchased` | Gift cards on that customer's orders |

  A purchased card that hasn't been generated yet (before the order is
  invoiced) is returned with `state: "pending"` and no code.

The app (`layers/commerce`, `/api/commerce/wishes/*`) only ever asks for the
signed-in user's own verified email and linked customer id. It hides the
code of a card that was bought for someone else.

## Install

On the Magento server, as root. Set `MAGENTO` to the store's folder and
`OWNER` to the user that owns its files. Magento commands run as that user,
so the files keep the right owner.

```sh
MAGENTO=/home/meebuzo/public_html/commerce     # the test store
OWNER=meebuzo
MODULE=/home/meebuzo/github/alternate-framework/packages/plugins/CMS-Content/adapter-magento/magento-module/Meeovi/GiftCards

cd "$MAGENTO"
rsync -a --chown=$OWNER:$OWNER "$MODULE/" app/code/Meeovi/GiftCards/
PHP="runuser -u $OWNER -- /usr/local/apps/php84/bin/php -d memory_limit=2G bin/magento"
$PHP maintenance:enable
$PHP module:enable Meeovi_GiftCards
$PHP setup:upgrade --keep-generated
$PHP setup:di:compile          # production mode; takes a few minutes
$PHP cache:flush
$PHP maintenance:disable
```

If a step fails, run `$PHP maintenance:disable` to bring the store back.

Then, in the Magento admin, go to System → Integrations → the app's
integration → API, and tick **Gift Cards for the Meeovi App (read-only)**.
