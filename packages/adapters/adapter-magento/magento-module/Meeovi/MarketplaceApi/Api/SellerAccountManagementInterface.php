<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

use Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterface;

interface SellerAccountManagementInterface
{
    /**
     * Register the calling customer as a Webkul Multi Vendor Marketplace
     * seller. Idempotent — calling this again for a customer who is already
     * a seller returns their existing record instead of erroring.
     *
     * @param int $customerId
     * @param string|null $shopUrl Shop URL slug; auto-generated from the
     *        customer id when omitted.
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterface
     * @throws \Magento\Framework\Exception\LocalizedException
     * @throws \Magento\Framework\Exception\CouldNotSaveException
     */
    public function registerSeller(int $customerId, ?string $shopUrl = null): SellerRegistrationResultInterface;
}
