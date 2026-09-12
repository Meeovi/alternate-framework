<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

interface SellerProductResultInterface
{
    public function getProductId(): int;

    public function setProductId(int $productId): SellerProductResultInterface;

    public function getSku(): string;

    public function setSku(string $sku): SellerProductResultInterface;

    /**
     * The Webkul_Marketplace linkage record's own id (marketplace_product's
     * primary key in the widely-documented schema this module targets —
     * see the module README before relying on this in a caller).
     */
    public function getMarketplaceProductId(): ?int;

    public function setMarketplaceProductId(?int $marketplaceProductId): SellerProductResultInterface;
}
