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

    /**
     * Which of these products anyone may download for free: enabled,
     * downloadable, priced 0, with a link the seller set to Shareable.
     * Products that don't qualify are left out.
     *
     * @param string[] $skus
     * @return \Meeovi\MarketplaceApi\Api\Data\FreeDownloadInterface[]
     */
    public function getFreeDownloads(array $skus): array;
}
