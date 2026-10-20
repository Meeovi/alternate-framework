<?php
declare(strict_types=1);

namespace Meeovi\GiftCards\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\GiftCards\Api\Data\GiftCardInterface;

class GiftCard extends DataObject implements GiftCardInterface
{
    public function getCode(): ?string
    {
        return $this->stringOrNull('code');
    }

    public function getState(): string
    {
        return (string) ($this->getData('state') ?? 'pending');
    }

    public function getEnabled(): bool
    {
        return (bool) $this->getData('enabled');
    }

    public function getBalance(): ?float
    {
        $balance = $this->getData('balance');
        return $balance === null ? null : (float) $balance;
    }

    public function getCreatedAt(): ?string
    {
        return $this->stringOrNull('created_at');
    }

    public function getExpiresAt(): ?string
    {
        return $this->stringOrNull('expires_at');
    }

    public function getRecipientName(): ?string
    {
        return $this->stringOrNull('recipient_name');
    }

    public function getRecipientEmail(): ?string
    {
        return $this->stringOrNull('recipient_email');
    }

    public function getSenderName(): ?string
    {
        return $this->stringOrNull('sender_name');
    }

    public function getSenderEmail(): ?string
    {
        return $this->stringOrNull('sender_email');
    }

    public function getProductName(): ?string
    {
        return $this->stringOrNull('product_name');
    }

    public function getProductSku(): ?string
    {
        return $this->stringOrNull('product_sku');
    }

    public function getOrderNumber(): ?string
    {
        return $this->stringOrNull('order_number');
    }

    public function getMessage(): ?string
    {
        return $this->stringOrNull('message');
    }

    private function stringOrNull(string $key): ?string
    {
        $value = $this->getData($key);
        return $value === null || $value === '' ? null : (string) $value;
    }
}
