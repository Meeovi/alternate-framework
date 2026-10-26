<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\MarketplaceApi\Api\Data\ExternalTaxLineInterface;

class ExternalTaxLine extends DataObject implements ExternalTaxLineInterface
{
    public function getReference(): string
    {
        return (string) $this->getData('reference');
    }

    public function setReference(string $reference): ExternalTaxLineInterface
    {
        return $this->setData('reference', $reference);
    }

    public function getPrice(): float
    {
        return (float) $this->getData('price');
    }

    public function setPrice(float $price): ExternalTaxLineInterface
    {
        return $this->setData('price', $price);
    }

    public function getQty(): float
    {
        return (float) $this->getData('qty');
    }

    public function setQty(float $qty): ExternalTaxLineInterface
    {
        return $this->setData('qty', $qty);
    }
}
