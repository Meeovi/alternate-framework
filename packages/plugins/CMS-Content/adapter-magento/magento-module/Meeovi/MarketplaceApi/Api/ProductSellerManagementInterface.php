<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

interface ProductSellerManagementInterface
{
    /**
     * The approved Webkul seller of each product (products sold by the
     * store itself, or not approved, are left out).
     *
     * @param string[] $skus
     * @return \Meeovi\MarketplaceApi\Api\Data\ProductSellerInterface[]
     */
    public function getProductSellers(array $skus): array;
}
