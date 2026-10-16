<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

use Magento\Framework\Exception\LocalizedException;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface;

/**
 * Server-to-server catalogue sync for sellers' dropshipped products
 * (@mframework/meeovi-dropshipping). Admin/Integration-token only — the app
 * calls these from background jobs with no seller present — under the
 * dedicated `Meeovi_MarketplaceApi::catalog_sync` ACL resource. Every call
 * names the seller (`customerId`) and only ever touches products linked to
 * that seller in Webkul's marketplace_product table.
 *
 * Magento's webapi reflection needs the @param/@return tags on every method.
 */
interface SellerCatalogSyncInterface
{
    /**
     * Create the product for the seller, or update it when the SKU already
     * exists AND belongs to that seller.
     *
     * @param int $customerId
     * @param string $sku
     * @param string $name
     * @param float $price
     * @param string $description
     * @param string $shortDescription
     * @param float $qty
     * @param float|null $weight
     * @param int[] $categoryIds
     * @param bool $enabled
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface
     * @throws LocalizedException
     */
    public function upsertProduct(
        int $customerId,
        string $sku,
        string $name,
        float $price,
        string $description = '',
        string $shortDescription = '',
        float $qty = 0.0,
        ?float $weight = null,
        array $categoryIds = [],
        bool $enabled = true
    ): SellerProductResultInterface;

    /**
     * Update stock (and optionally price / enabled) of one seller product.
     *
     * @param int $customerId
     * @param string $sku
     * @param float $qty
     * @param float|null $price
     * @param bool|null $enabled
     * @return bool
     * @throws LocalizedException
     */
    public function updateStock(int $customerId, string $sku, float $qty, ?float $price = null, ?bool $enabled = null): bool;

    /**
     * Add an image (base64) to a seller product's gallery.
     *
     * @param int $customerId
     * @param string $sku
     * @param string $base64Content
     * @param string $mimeType
     * @param string $fileName
     * @param bool $isMain
     * @return bool
     * @throws LocalizedException
     */
    public function addImage(
        int $customerId,
        string $sku,
        string $base64Content,
        string $mimeType,
        string $fileName,
        bool $isMain = false
    ): bool;
}
