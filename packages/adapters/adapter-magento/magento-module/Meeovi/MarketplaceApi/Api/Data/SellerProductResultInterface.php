<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

interface SellerProductResultInterface
{
    /**
     * Get the created catalog product's id.
     *
     * @return int
     */
    public function getProductId(): int;

    /**
     * Set the created catalog product's id.
     *
     * @param int $productId
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface
     */
    public function setProductId(int $productId): SellerProductResultInterface;

    /**
     * Get the created product's SKU.
     *
     * @return string
     */
    public function getSku(): string;

    /**
     * Set the created product's SKU.
     *
     * @param string $sku
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface
     */
    public function setSku(string $sku): SellerProductResultInterface;

    /**
     * Get the Webkul_Marketplace linkage record's own id
     * (marketplace_product.entity_id).
     *
     * @return int|null
     */
    public function getMarketplaceProductId(): ?int;

    /**
     * Set the Webkul_Marketplace linkage record's own id.
     *
     * @param int|null $marketplaceProductId
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface
     */
    public function setMarketplaceProductId(?int $marketplaceProductId): SellerProductResultInterface;
}
