<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterface;

class ExternalOrderResult extends DataObject implements ExternalOrderResultInterface
{
    public function getOrderId(): int
    {
        return (int) $this->getData('order_id');
    }

    public function setOrderId(int $orderId): ExternalOrderResultInterface
    {
        return $this->setData('order_id', $orderId);
    }

    public function getIncrementId(): string
    {
        return (string) $this->getData('increment_id');
    }

    public function setIncrementId(string $incrementId): ExternalOrderResultInterface
    {
        return $this->setData('increment_id', $incrementId);
    }

    public function getCreated(): bool
    {
        return (bool) $this->getData('created');
    }

    public function setCreated(bool $created): ExternalOrderResultInterface
    {
        return $this->setData('created', $created);
    }
}
