<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api;

/**
 * Read-heavy seller dashboard endpoints, bridging directly to Webkul
 * Marketplace's own tables (`marketplace_userdata`, `marketplace_product`,
 * `marketplace_saleslist`) rather than a separate REST/GraphQL surface —
 * Webkul itself ships none (confirmed: `Webkul/Marketplace/etc/webapi.xml`
 * doesn't exist on the installed copy).
 *
 * Every method returns a JSON-encoded string rather than a typed
 * `Api\Data\*Interface` (or array of one) — deliberately: these are 5
 * distinct, fairly wide row shapes, and a full Magento extensible-data-
 * interface (Interface + Model + di.xml preference) per shape is a lot of
 * ceremony for read-only reporting endpoints that exist purely to feed a
 * frontend grid. The JSON string is the exact same shape the frontend
 * `BusinessDriverContract` types in packages/modules/alternate-sdk expect
 * (see `layers/business/server/utils/magentoBusinessAdapter.ts`, the
 * consumer of these routes) — `json_decode` on read, `json_encode` here.
 */
interface SellerDashboardManagementInterface
{
    /**
     * @param int $customerId
     * @return string JSON object: shopName, shopUrl, bannerUrl, logoUrl,
     *   metaDescription, shippingPolicy, returnPolicy, socialLinks
     *   ({facebook,twitter,instagram}), isApproved.
     */
    public function getShopProfile(int $customerId): string;

    /**
     * Partial update — any parameter left null keeps its current value.
     *
     * @param int $customerId
     * @param string|null $shopName
     * @param string|null $shopUrl
     * @param string|null $bannerUrl
     * @param string|null $logoUrl
     * @param string|null $metaDescription
     * @param string|null $shippingPolicy
     * @param string|null $returnPolicy
     * @param string|null $facebookUrl
     * @param string|null $twitterUrl
     * @param string|null $instagramUrl
     * @return string JSON object, same shape as getShopProfile's return.
     */
    public function updateShopProfile(
        int $customerId,
        ?string $shopName = null,
        ?string $shopUrl = null,
        ?string $bannerUrl = null,
        ?string $logoUrl = null,
        ?string $metaDescription = null,
        ?string $shippingPolicy = null,
        ?string $returnPolicy = null,
        ?string $facebookUrl = null,
        ?string $twitterUrl = null,
        ?string $instagramUrl = null
    ): string;

    /**
     * @param int $customerId
     * @return string JSON array of {id, name, sku, category, price, stock,
     *   status, updated}.
     */
    public function getSellerProducts(int $customerId): string;

    /**
     * @param int $customerId
     * @return string JSON array of {id, customer, items, total,
     *   paymentStatus, fulfillmentStatus, placed} — one row per real
     *   Magento order, grouped from Webkul's per-order-item saleslist rows.
     */
    public function getSellerOrders(int $customerId): string;

    /**
     * @param int $customerId
     * @return string JSON array of {id, order, product, saleAmount,
     *   commissionRate, commissionAmount, netEarning, date} — one row per
     *   `marketplace_saleslist` order-item.
     */
    public function getSellerTransactions(int $customerId): string;

    /**
     * @param int $customerId
     * @return string JSON array of {id, name, sku, stock, threshold} for
     *   this seller's products at or below their configured (or default)
     *   low-stock threshold.
     */
    public function getLowStockProducts(int $customerId): string;
}
