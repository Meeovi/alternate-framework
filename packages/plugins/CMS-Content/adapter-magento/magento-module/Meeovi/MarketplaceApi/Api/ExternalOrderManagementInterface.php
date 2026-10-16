<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

/**
 * Orders paid for outside Magento — the Meeovi app's Stripe checkout — and
 * recorded here so the catalogue, the order history and Webkul's seller
 * sales/commission stay in Magento. Called server-to-server with the
 * Integration token (Meeovi_MarketplaceApi::external_orders).
 */
interface ExternalOrderManagementInterface
{
    /**
     * Place an already-paid order for a customer.
     *
     * The order goes through Magento's own quote → placeOrder flow (so
     * Webkul records each seller's sale), is paid with the internal-only
     * `meeovi_external` method and invoiced offline. Idempotent on
     * $reference (the Stripe payment id, stored as the order's
     * ext_order_id): a repeat call returns the existing order. Refused if
     * Magento's total for the items differs from $amountPaid.
     *
     * @param int $customerId
     * @param string $reference
     * @param \Meeovi\MarketplaceApi\Api\Data\ExternalOrderItemInterface[] $items
     * @param float $amountPaid
     * @param string $currency
     * @param \Magento\Quote\Api\Data\AddressInterface|null $billingAddress used when the customer has no default billing address
     * @return \Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterface
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function placeOrder(
        int $customerId,
        string $reference,
        array $items,
        float $amountPaid,
        string $currency,
        ?\Magento\Quote\Api\Data\AddressInterface $billingAddress = null
    ): \Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterface;

    /**
     * SKUs this customer has paid for (invoiced, not refunded).
     *
     * @param int $customerId
     * @return string[]
     */
    public function getPurchasedSkus(int $customerId): array;
}
