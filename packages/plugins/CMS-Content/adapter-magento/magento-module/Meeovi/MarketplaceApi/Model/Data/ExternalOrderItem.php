<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\MarketplaceApi\Api\Data\ExternalOrderItemInterface;

class ExternalOrderItem extends DataObject implements ExternalOrderItemInterface
{
    public function getSku(): string
    {
        return (string) $this->getData('sku');
    }

    public function setSku(string $sku): ExternalOrderItemInterface
    {
        return $this->setData('sku', $sku);
    }

    public function getQty(): float
    {
        return (float) $this->getData('qty');
    }

    public function setQty(float $qty): ExternalOrderItemInterface
    {
        return $this->setData('qty', $qty);
    }
}
