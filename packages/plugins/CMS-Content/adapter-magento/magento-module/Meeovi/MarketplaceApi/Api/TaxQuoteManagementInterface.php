<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

/**
 * Tax for a Meeovi app checkout, worked out by Magento before the buyer
 * pays: the app charges what this returns and calculates no tax itself.
 * Called server-to-server with the Integration token
 * (Meeovi_MarketplaceApi::external_orders).
 */
interface TaxQuoteManagementInterface
{
    /**
     * Quote the tax on a checkout.
     *
     * $items are this store's products: they're priced and taxed in the
     * same quote ExternalOrderManagement::placeOrder() builds, so its
     * grand total is exactly what placeOrder() will expect to have been
     * paid for them. They need $customerId. $otherLines are priced
     * elsewhere (the app's own catalogue) and taxed at the default product
     * tax class; $shippingAmount at the shipping tax class. Both use
     * $address, else the customer's default billing address, else the
     * store's default tax destination.
     *
     * @param int $customerId 0 when there are no $items
     * @param \Meeovi\MarketplaceApi\Api\Data\ExternalOrderItemInterface[] $items
     * @param \Meeovi\MarketplaceApi\Api\Data\ExternalTaxLineInterface[] $otherLines
     * @param float $shippingAmount
     * @param string $currency
     * @param \Magento\Quote\Api\Data\AddressInterface|null $address
     * @return string JSON: {currency,
     *   items: {subtotal, discount, tax, grandTotal} | null,
     *   otherLines: [{reference, tax}], otherTax, shippingTax,
     *   pricesIncludeTax, shippingIncludesTax}
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function quote(
        int $customerId,
        array $items,
        array $otherLines,
        float $shippingAmount,
        string $currency,
        ?\Magento\Quote\Api\Data\AddressInterface $address = null
    ): string;
}
