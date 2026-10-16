<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

/**
 * The Webkul seller a product belongs to.
 */
interface ProductSellerInterface
{
    /**
     * Get the product SKU.
     *
     * @return string
     */
    public function getSku(): string;

    /**
     * Set the product SKU.
     *
     * @param string $sku
     * @return \Meeovi\MarketplaceApi\Api\Data\ProductSellerInterface
     */
    public function setSku(string $sku): ProductSellerInterface;

    /**
     * Get the seller's customer id.
     *
     * @return int
     */
    public function getSellerId(): int;

    /**
     * Set the seller's customer id.
     *
     * @param int $sellerId
     * @return \Meeovi\MarketplaceApi\Api\Data\ProductSellerInterface
     */
    public function setSellerId(int $sellerId): ProductSellerInterface;

    /**
     * Get the seller's shop title.
     *
     * @return string|null
     */
    public function getShopTitle(): ?string;

    /**
     * Set the seller's shop title.
     *
     * @param string|null $shopTitle
     * @return \Meeovi\MarketplaceApi\Api\Data\ProductSellerInterface
     */
    public function setShopTitle(?string $shopTitle): ProductSellerInterface;

    /**
     * Get the seller's shop URL key.
     *
     * @return string|null
     */
    public function getShopUrl(): ?string;

    /**
     * Set the seller's shop URL key.
     *
     * @param string|null $shopUrl
     * @return \Meeovi\MarketplaceApi\Api\Data\ProductSellerInterface
     */
    public function setShopUrl(?string $shopUrl): ProductSellerInterface;
}
