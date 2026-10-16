# Magento / Mage-OS patches

Applied with `cweagans/composer-patches` (^1.7) in the store's root
`composer.json`:

```jsonc
"extra": {
    "composer-exit-on-patch-failure": true,
    "patches": {
        "mage-os/framework": {
            "Redis cache: authenticate as backend_options.username (Redis 6 ACL)": "patches/mage-os-redis-username.patch"
        }
    }
}
```

Copy the patch into the store's `patches/` folder.

## mage-os-redis-username.patch

Mage-OS 3.6 (Magento 2.4.9) sends every cache through
`Magento\Framework\Cache\Frontend\Adapter\SymfonyAdapterProvider`, whose
Redis connection only passes the password — `backend_options.username` is
ignored, so a store using a Redis ACL user (e.g. `magento`) fails with
`WRONGPASS`. The patch carries the username into the phpredis DSN
(`redis://user:pass@host`) and the Predis parameters. Not yet upstream.

Applied on commerce.meeovicms.com 2026-10-16. If `composer reinstall
mage-os/framework` ever fails halfway ("Uninstall … failed"), restore the
package from the composer cache, `patch -p1` it, and record it under
`extra.patches_applied` in `vendor/composer/installed.json`.
