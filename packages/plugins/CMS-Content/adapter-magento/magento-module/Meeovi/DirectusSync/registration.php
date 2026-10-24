<?php
/**
 * Meeovi_DirectusSync
 *
 * Tells Directus (the directus-extension-mageos-commerce endpoint) when orders,
 * customers, products or categories change, so its Mage-OS sync runs within
 * seconds instead of waiting for the scheduled Flows. The ping carries no
 * store data: Directus reads the changes from this store itself.
 */
declare(strict_types=1);

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::MODULE,
    'Meeovi_DirectusSync',
    __DIR__
);
