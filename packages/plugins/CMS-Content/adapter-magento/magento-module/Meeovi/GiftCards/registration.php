<?php
/**
 * Meeovi_GiftCards
 *
 * Reads Ecomteck_GiftCard data for the Meeovi app without modifying the
 * Ecomteck modules: GraphQL support for the `giftcard` product type (without
 * it, any storefront product query that reaches a gift card fails with
 * "Concrete type for ProductInterface not implemented") and read-only REST
 * routes for a customer's received and purchased gift cards.
 */
declare(strict_types=1);

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::MODULE,
    'Meeovi_GiftCards',
    __DIR__
);
