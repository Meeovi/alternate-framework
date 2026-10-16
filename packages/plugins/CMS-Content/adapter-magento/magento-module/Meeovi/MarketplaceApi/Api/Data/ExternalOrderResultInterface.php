<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

interface ExternalOrderResultInterface
{
    /**
     * Get the order's entity id.
     *
     * @return int
     */
    public function getOrderId(): int;

    /**
     * Set the order's entity id.
     *
     * @param int $orderId
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterface
     */
    public function setOrderId(int $orderId): ExternalOrderResultInterface;

    /**
     * Get the order number shown to the customer.
     *
     * @return string
     */
    public function getIncrementId(): string;

    /**
     * Set the order number shown to the customer.
     *
     * @param string $incrementId
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterface
     */
    public function setIncrementId(string $incrementId): ExternalOrderResultInterface;

    /**
     * Whether this call placed the order (false: it already existed for this reference).
     *
     * @return bool
     */
    public function getCreated(): bool;

    /**
     * Set whether this call placed the order.
     *
     * @param bool $created
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterface
     */
    public function setCreated(bool $created): ExternalOrderResultInterface;
}
