<?php
declare(strict_types=1);

namespace Meeovi\GiftCards\Api\Data;

/**
 * A gift card as the app shows it: a received card, or a card from one of
 * the customer's orders (`code` is null until the order generates it).
 */
interface GiftCardInterface
{
    /**
     * @return string|null
     */
    public function getCode(): ?string;

    /**
     * pending (not generated yet), available, used, redeemed or expired.
     *
     * @return string
     */
    public function getState(): string;

    /**
     * @return bool
     */
    public function getEnabled(): bool;

    /**
     * @return float|null
     */
    public function getBalance(): ?float;

    /**
     * @return string|null
     */
    public function getCreatedAt(): ?string;

    /**
     * @return string|null
     */
    public function getExpiresAt(): ?string;

    /**
     * @return string|null
     */
    public function getRecipientName(): ?string;

    /**
     * @return string|null
     */
    public function getRecipientEmail(): ?string;

    /**
     * @return string|null
     */
    public function getSenderName(): ?string;

    /**
     * @return string|null
     */
    public function getSenderEmail(): ?string;

    /**
     * The gift card product's name (purchased cards only).
     *
     * @return string|null
     */
    public function getProductName(): ?string;

    /**
     * The gift card product's SKU (purchased cards only).
     *
     * @return string|null
     */
    public function getProductSku(): ?string;

    /**
     * The order's increment id (purchased cards only).
     *
     * @return string|null
     */
    public function getOrderNumber(): ?string;

    /**
     * @return string|null
     */
    public function getMessage(): ?string;
}
