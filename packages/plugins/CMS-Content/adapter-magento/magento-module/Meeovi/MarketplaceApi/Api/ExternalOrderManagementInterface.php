<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

/**
 * Orders paid for outside Magento — the Meeovi app's PayPal checkout — and
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
     * $reference (the PayPal capture id, stored as the order's
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

    /**
     * The customer's orders, newest first (order history for the app).
     *
     * @param int $customerId
     * @param int $pageSize 1-100
     * @param int $currentPage 1-based
     * @return string JSON array of orders: {id, number, createdAt, status,
     *   state, paymentStatus, currency, grandTotal, subtotal, taxAmount,
     *   shippingAmount, totalPaid, totalRefunded, totalDue,
     *   customer: {firstname, lastname, email},
     *   items: [{sku, name, qty, price, rowTotal}],
     *   tracking: [{number, carrier, title}]}
     */
    public function getCustomerOrders(int $customerId, int $pageSize = 50, int $currentPage = 1): string;

    /**
     * One of the customer's orders (404 when it isn't theirs).
     *
     * @param int $customerId
     * @param int $orderId
     * @return string JSON object, same shape as one getCustomerOrders row.
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function getCustomerOrder(int $customerId, int $orderId): string;
}
