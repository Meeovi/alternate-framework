<?php
/**
 * Meeovi_MarketplaceApi
 *
 * A thin bridge module: it does NOT modify Webkul_Marketplace (never patch a
 * third-party vendor module directly) — it depends on it and exposes one new,
 * properly-authenticated REST route that a seller's own storefront session can
 * call to create a product against Webkul's own linkage tables/factories,
 * instead of a caller doing raw catalog-product writes that Webkul's UI would
 * never leave orphaned from a seller record.
 */
declare(strict_types=1);

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::MODULE,
    'Meeovi_MarketplaceApi',
    __DIR__
);
