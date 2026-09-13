<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

interface SellerRegistrationResultInterface
{
    /**
     * Get the Webkul_Marketplace linkage record's own id
     * (marketplace_userdata.entity_id).
     *
     * @return int
     */
    public function getSellerRecordId(): int;

    /**
     * Set the Webkul_Marketplace linkage record's own id.
     *
     * @param int $sellerRecordId
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterface
     */
    public function setSellerRecordId(int $sellerRecordId): SellerRegistrationResultInterface;

    /**
     * Get whether the account is immediately active (true) or pending
     * admin approval (false) — mirrors
     * marketplace/general_settings/seller_approval.
     *
     * @return bool
     */
    public function getIsApproved(): bool;

    /**
     * Set whether the account is immediately active or pending approval.
     *
     * @param bool $isApproved
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterface
     */
    public function setIsApproved(bool $isApproved): SellerRegistrationResultInterface;

    /**
     * Get the seller's shop URL slug.
     *
     * @return string
     */
    public function getShopUrl(): string;

    /**
     * Set the seller's shop URL slug.
     *
     * @param string $shopUrl
     * @return \Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterface
     */
    public function setShopUrl(string $shopUrl): SellerRegistrationResultInterface;
}
