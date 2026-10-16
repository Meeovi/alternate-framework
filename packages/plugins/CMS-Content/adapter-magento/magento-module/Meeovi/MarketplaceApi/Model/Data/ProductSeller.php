<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\MarketplaceApi\Api\Data\ProductSellerInterface;

class ProductSeller extends DataObject implements ProductSellerInterface
{
    public function getSku(): string
    {
        return (string) $this->getData('sku');
    }

    public function setSku(string $sku): ProductSellerInterface
    {
        return $this->setData('sku', $sku);
    }

    public function getSellerId(): int
    {
        return (int) $this->getData('seller_id');
    }

    public function setSellerId(int $sellerId): ProductSellerInterface
    {
        return $this->setData('seller_id', $sellerId);
    }

    public function getShopTitle(): ?string
    {
        $value = $this->getData('shop_title');
        return $value === null ? null : (string) $value;
    }

    public function setShopTitle(?string $shopTitle): ProductSellerInterface
    {
        return $this->setData('shop_title', $shopTitle);
    }

    public function getShopUrl(): ?string
    {
        $value = $this->getData('shop_url');
        return $value === null ? null : (string) $value;
    }

    public function setShopUrl(?string $shopUrl): ProductSellerInterface
    {
        return $this->setData('shop_url', $shopUrl);
    }
}
