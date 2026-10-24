# Meeovi_DirectusSync

Tells Directus when store data changes, so the Mage-OS → Directus sync
(`directus-extension-mageos-commerce`, "Mage-OS sync" Flow operation) runs
within seconds instead of on its next schedule.

| Saved or deleted (after the DB commit) | Section synced |
|---|---|
| an order (placed, invoiced, shipped, refunded, status change) | `orders` |
| a customer | `customers` |
| a product | `products` |
| a category | `categories` |

During a request (or a CLI run, e.g. an import) the changed sections are
collected and sent as **one** ping when it ends:

```
POST {Directus URL}/commerce/mirror/notify
{"sections": ["orders"]}
```

The ping carries no store data: Directus reads the changes from this store
itself, with its Integration. A failed or slow ping is only logged
(`var/log/system.log`, `[Meeovi_DirectusSync]`) and never fails the save;
Directus's scheduled sync Flows (orders every 5 minutes, catalogue every 15,
customers hourly) still catch everything.

## Settings

**Stores › Configuration › Services › Meeovi Directus Sync › Change notifications**

- **Enabled** — off by default.
- **Directus URL** — e.g. `http://127.0.0.1:8011` when Directus runs on the same server.
- **Shared secret** — only if Directus has `MAGEOS_NOTIFY_SECRET` set (sent as `X-Mageos-Notify-Secret`). Saved here or with `config:set` it's stored encrypted; set in `app/etc/env.php` (`config:sensitive:set`, `--lock-env`) it's plain text — both work.
- **Timeout (seconds)** — 1–10, default 2.

Or from the command line:

```sh
bin/magento config:set meeovi_directus_sync/general/url http://127.0.0.1:8011
bin/magento config:set meeovi_directus_sync/general/enabled 1
```

## Install

```sh
cp -r Meeovi/DirectusSync <magento>/app/code/Meeovi/
bin/magento module:enable Meeovi_DirectusSync
bin/magento setup:upgrade --keep-generated
bin/magento setup:di:compile        # production mode
bin/magento cache:flush
```
