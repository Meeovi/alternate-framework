<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Customer\Api\GroupRepositoryInterface;
use Magento\Customer\Model\Group;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\DataObject;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Quote\Api\Data\AddressInterface;
use Magento\Store\Model\ScopeInterface;
use Magento\Tax\Model\Calculation;
use Magento\Tax\Model\Config as TaxConfig;
use Meeovi\MarketplaceApi\Api\Data\ExternalTaxLineInterface;
use Meeovi\MarketplaceApi\Api\TaxQuoteManagementInterface;

/**
 * See TaxQuoteManagementInterface. Reads only: the quote for $items is
 * built and totalled but never saved.
 */
class TaxQuoteManagement implements TaxQuoteManagementInterface
{
    private const MAX_OTHER_LINES = 100;

    public function __construct(
        private ExternalQuoteBuilder $quoteBuilder,
        private Calculation $calculation,
        private TaxConfig $taxConfig,
        private GroupRepositoryInterface $groupRepository,
        private ScopeConfigInterface $scopeConfig,
        private Json $json
    ) {
    }

    /**
     * @inheritdoc
     */
    public function quote(
        int $customerId,
        array $items,
        array $otherLines,
        float $shippingAmount,
        string $currency,
        ?AddressInterface $address = null
    ): string {
        if (count($otherLines) > self::MAX_OTHER_LINES) {
            throw new LocalizedException(__('Send at most %1 other lines.', self::MAX_OTHER_LINES));
        }
        if ($shippingAmount < 0) {
            throw new LocalizedException(__('The shipping amount can\'t be negative.'));
        }
        if ($items && $customerId <= 0) {
            throw new LocalizedException(__('Store products need the buyer\'s customer id.'));
        }

        $customer = $customerId > 0 ? $this->quoteBuilder->customer($customerId) : null;
        $store = $this->quoteBuilder->store($customer, $currency);

        $itemTotals = null;
        if ($items) {
            $quote = $this->quoteBuilder->build($customer, $store, $items, $address);
            $subtotal = (float) $quote->getBaseSubtotal();
            $itemTotals = [
                'subtotal' => $subtotal,
                'discount' => round($subtotal - (float) $quote->getBaseSubtotalWithDiscount(), 2),
                'tax' => (float) $quote->getBillingAddress()->getBaseTaxAmount(),
                'grandTotal' => (float) $quote->getBaseGrandTotal(),
            ];
        }

        // One rate request for everything priced outside Magento.
        $destination = new DataObject($this->quoteBuilder->taxDestination($customer, $address, $store));
        $groupId = $customer ? (int) $customer->getGroupId() : Group::NOT_LOGGED_IN_ID;
        $request = $this->calculation->getRateRequest(
            $destination,
            $destination,
            (int) $this->groupRepository->getById($groupId)->getTaxClassId(),
            $store,
            $customerId > 0 ? $customerId : null
        );

        // Prices that already include tax have nothing added on top.
        $pricesIncludeTax = (bool) $this->taxConfig->priceIncludesTax($store);
        $productClass = (int) $this->scopeConfig->getValue('tax/classes/default_product_tax_class', ScopeInterface::SCOPE_STORE, $store->getId());
        $productRate = $productClass ? (float) $this->calculation->getRate((clone $request)->setProductClassId($productClass)) : 0.0;

        $lines = [];
        $otherTax = 0.0;
        /** @var ExternalTaxLineInterface $line */
        foreach ($otherLines as $line) {
            $qty = $line->getQty();
            if ($line->getPrice() < 0 || $qty <= 0 || $qty > ExternalQuoteBuilder::MAX_QTY) {
                throw new LocalizedException(__('Each line needs a price of 0 or more and a quantity between 1 and %1.', ExternalQuoteBuilder::MAX_QTY));
            }
            $tax = $pricesIncludeTax ? 0.0 : (float) $this->calculation->calcTaxAmount($line->getPrice() * $qty, $productRate, false, true);
            $lines[] = ['reference' => $line->getReference(), 'tax' => $tax];
            $otherTax += $tax;
        }

        $shippingIncludesTax = (bool) $this->taxConfig->shippingPriceIncludesTax($store);
        $shippingClass = (int) $this->taxConfig->getShippingTaxClass($store);
        $shippingTax = 0.0;
        if ($shippingAmount > 0 && $shippingClass && !$shippingIncludesTax) {
            $shippingRate = (float) $this->calculation->getRate((clone $request)->setProductClassId($shippingClass));
            $shippingTax = (float) $this->calculation->calcTaxAmount($shippingAmount, $shippingRate, false, true);
        }

        return $this->json->serialize([
            'currency' => (string) $store->getBaseCurrencyCode(),
            'items' => $itemTotals,
            'otherLines' => $lines,
            'otherTax' => round($otherTax, 2),
            'shippingTax' => round($shippingTax, 2),
            'pricesIncludeTax' => $pricesIncludeTax,
            'shippingIncludesTax' => $shippingIncludesTax,
        ]);
    }
}
