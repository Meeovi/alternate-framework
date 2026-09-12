<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface;

class SellerProductResult extends DataObject implements SellerProductResultInterface
{
    public function getProductId(): int
    {
        return (int) $this->getData('product_id');
    }

    public function setProductId(int $productId): SellerProductResultInterface
    {
        return $this->setData('product_id', $productId);
    }

    public function getSku(): string
    {
        return (string) $this->getData('sku');
    }

    public function setSku(string $sku): SellerProductResultInterface
    {
        return $this->setData('sku', $sku);
    }

    public function getMarketplaceProductId(): ?int
    {
        $value = $this->getData('marketplace_product_id');
        return $value === null ? null : (int) $value;
    }

    public function setMarketplaceProductId(?int $marketplaceProductId): SellerProductResultInterface
    {
        return $this->setData('marketplace_product_id', $marketplaceProductId);
    }
}
