<?php
declare(strict_types=1);

namespace Meeovi\GiftCards\Api;

/**
 * Read-only gift card data for the app's server (Integration token).
 */
interface GiftCardReadInterface
{
    /**
     * SKUs of the enabled gift card products, newest first (at most 200).
     *
     * @return string[]
     */
    public function getProductSkus(): array;

    /**
     * Enabled gift cards sent to this email address, newest first (at most 200).
     *
     * @param string $email
     * @return \Meeovi\GiftCards\Api\Data\GiftCardInterface[]
     * @throws \Magento\Framework\Exception\InputException
     */
    public function getReceived(string $email): array;

    /**
     * Gift cards on this customer's orders, newest first (at most 200 lines):
     * one entry per generated code, or one `pending` entry for a line whose
     * codes aren't generated yet.
     *
     * @param int $customerId
     * @return \Meeovi\GiftCards\Api\Data\GiftCardInterface[]
     */
    public function getPurchased(int $customerId): array;
}
