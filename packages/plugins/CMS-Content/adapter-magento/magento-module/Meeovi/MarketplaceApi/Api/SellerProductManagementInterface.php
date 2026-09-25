<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

use Magento\Framework\Exception\LocalizedException;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface;

/**
 * Service contract backing `POST /V1/meeovi-marketplace/seller/products`
 * (see etc/webapi.xml). One method: create a simple product AND its
 * Webkul_Marketplace seller-linkage row in one transactional call, so a
 * caller can never end up with a catalog product that exists but isn't
 * attributed to any seller (or the reverse).
 */
interface SellerProductManagementInterface
{
    /**
     * @param int $customerId The seller's own customer id. For a customer
     *   token this is enforced by webapi.xml's `self` resource — Magento
     *   overwrites/verifies it against the token itself before this method
     *   ever runs, so a seller cannot create a product "as" another seller
     *   by sending a different id. An admin token is not subject to that
     *   check (support/ops creating on a seller's behalf).
     * @param string $sku Must not already exist in the catalog.
     * @param string $name
     * @param float $price
     * @param string $description
     * @param string $shortDescription
     * @param float $qty Initial stock quantity.
     * @param float|null $weight
     * @param int|null $attributeSetId Defaults to the catalog_product entity
     *   type's own default attribute set when omitted.
     * @param int[] $websiteIds Defaults to the current default website when empty.
     * @param int[] $categoryIds
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface
     * @throws LocalizedException On validation failure, an unapproved/unknown
     *   seller, a duplicate SKU, or a Webkul linkage failure (in which case
     *   the just-created catalog product is rolled back — see
     *   Model/SellerProductManagement::linkProductToSeller).
     */
    public function createProduct(
        int $customerId,
        string $sku,
        string $name,
        float $price,
        string $description = '',
        string $shortDescription = '',
        float $qty = 0.0,
        ?float $weight = null,
        ?int $attributeSetId = null,
        array $websiteIds = [],
        array $categoryIds = []
    ): SellerProductResultInterface;
}
