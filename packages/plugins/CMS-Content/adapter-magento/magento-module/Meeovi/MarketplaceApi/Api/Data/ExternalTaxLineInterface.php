<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

/**
 * A line the Meeovi app sells that isn't a Magento product (priced in
 * Directus), taxed at the store's default product tax class.
 */
interface ExternalTaxLineInterface
{
    /**
     * Get the app's reference for the line (echoed back with its tax).
     *
     * @return string
     */
    public function getReference(): string;

    /**
     * Set the app's reference for the line.
     *
     * @param string $reference
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalTaxLineInterface
     */
    public function setReference(string $reference): ExternalTaxLineInterface;

    /**
     * Get the unit price, in the store's base currency.
     *
     * @return float
     */
    public function getPrice(): float;

    /**
     * Set the unit price.
     *
     * @param float $price
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalTaxLineInterface
     */
    public function setPrice(float $price): ExternalTaxLineInterface;

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
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalTaxLineInterface
     */
    public function setQty(float $qty): ExternalTaxLineInterface;
}
