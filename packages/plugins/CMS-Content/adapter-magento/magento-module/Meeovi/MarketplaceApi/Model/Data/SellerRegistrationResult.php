<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterface;

class SellerRegistrationResult extends DataObject implements SellerRegistrationResultInterface
{
    public function getSellerRecordId(): int
    {
        return (int) $this->getData('seller_record_id');
    }

    public function setSellerRecordId(int $sellerRecordId): SellerRegistrationResultInterface
    {
        return $this->setData('seller_record_id', $sellerRecordId);
    }

    public function getIsApproved(): bool
    {
        return (bool) $this->getData('is_approved');
    }

    public function setIsApproved(bool $isApproved): SellerRegistrationResultInterface
    {
        return $this->setData('is_approved', $isApproved);
    }

    public function getShopUrl(): string
    {
        return (string) $this->getData('shop_url');
    }

    public function setShopUrl(string $shopUrl): SellerRegistrationResultInterface
    {
        return $this->setData('shop_url', $shopUrl);
    }
}
