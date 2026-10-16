<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

/**
 * One line of an order paid for outside Magento.
 */
interface ExternalOrderItemInterface
{
    /**
     * Get the product SKU.
     *
     * @return string
     */
    public function getSku(): string;

    /**
     * Set the product SKU.
     *
     * @param string $sku
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalOrderItemInterface
     */
    public function setSku(string $sku): ExternalOrderItemInterface;

    /**
     * Get the quantity.
     *
     * @return float
     */
    public function getQty(): float;

    /**
     * Set the quantity.
     *
     * @param float $qty
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalOrderItemInterface
     */
    public function setQty(float $qty): ExternalOrderItemInterface;
}
