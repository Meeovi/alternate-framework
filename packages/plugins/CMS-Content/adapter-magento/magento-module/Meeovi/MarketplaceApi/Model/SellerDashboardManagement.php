<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\CatalogInventory\Api\StockRegistryInterface;
use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Stdlib\DateTime\DateTime;
use Magento\Sales\Api\OrderRepositoryInterface;
use Meeovi\MarketplaceApi\Api\SellerDashboardManagementInterface;
use Psr\Log\LoggerInterface;
use Webkul\Marketplace\Model\Product as MarketplaceProduct;
use Webkul\Marketplace\Model\ResourceModel\Product\CollectionFactory as MarketplaceProductCollectionFactory;
use Webkul\Marketplace\Model\ResourceModel\Saleslist\CollectionFactory as SaleslistCollectionFactory;
use Webkul\Marketplace\Model\ResourceModel\Seller\CollectionFactory as SellerCollectionFactory;

/**
 * Read directly against the real, installed Webkul_Marketplace source at
 * app/code/Webkul/Marketplace on 2026-09-15 (same caveat as
 * SellerProductManagement.php: Webkul is closed-source, this repo doesn't
 * vendor a copy — re-read the cited files before trusting this again if
 * the module is ever upgraded):
 *
 *  - Model/Seller.php: confirmed getShopTitle/getShopUrl/getBannerPic/
 *    getLogoPic/getMetaDescription/getShippingPolicy/getReturnPolicy/
 *    getFacebookId/getTwitterId/getInstagramId/getIsSeller getters exist
 *    exactly as used below, table `marketplace_userdata`.
 *  - Model/Product.php: confirmed getMageproductId/getSellerId/getStatus/
 *    getIsApproved/getCreatedAt and STATUS_PENDING=0/STATUS_ENABLED=1/
 *    STATUS_DISABLED=2/STATUS_DENIED=3, table `marketplace_product`.
 *  - Model/Saleslist.php: confirmed getMagerealorderId/getOrderId/
 *    getMageproName/getTotalAmount/getCommissionRate/getTotalCommission/
 *    getActualSellerAmount/getCreatedAt/getSellerId, table
 *    `marketplace_saleslist`. `order_id` is Magento's own numeric
 *    `sales_order` entity id; `magerealorder_id` is the human-facing
 *    increment id string — NOT independently re-verified against live
 *    data (no DB query access in this session), so getSellerOrders below
 *    loads the real `\Magento\Sales\Api\Data\OrderInterface` via
 *    `order_id` for customer name / payment / fulfillment status rather
 *    than trusting any Webkul-side status column, which is the safer
 *    assumption either way.
 *  - `Helper\Data::getlowStockQty()` (config default low-stock qty) and
 *    `Model/Seller.php`'s per-seller `LowStockQuantity` column both exist;
 *    this uses the seller's own value when set, else a plain fallback of
 *    10 (matches this module's own conservative-default style rather than
 *    re-reading the store-config helper's exact XML path).
 *
 * Every list method here accepts only `$customerId` (no pagination) —
 * these back a seller's own dashboard grids, which are expected to be
 * small (a single seller's own products/orders), not the whole catalog.
 */
class SellerDashboardManagement implements SellerDashboardManagementInterface
{
    private const DEFAULT_LOW_STOCK_THRESHOLD = 10.0;

    public function __construct(
        private SellerCollectionFactory $sellerCollectionFactory,
        private MarketplaceProductCollectionFactory $marketplaceProductCollectionFactory,
        private SaleslistCollectionFactory $saleslistCollectionFactory,
        private ProductRepositoryInterface $productRepository,
        private StockRegistryInterface $stockRegistry,
        private OrderRepositoryInterface $orderRepository,
        private DateTime $dateTime,
        private LoggerInterface $logger
    ) {
    }

    public function getShopProfile(int $customerId): string
    {
        $seller = $this->loadSellerRow($customerId);
        return json_encode($this->sellerRowToProfile($seller), JSON_THROW_ON_ERROR);
    }

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
    ): string {
        $seller = $this->loadSellerRow($customerId);

        if ($shopName !== null) $seller->setShopTitle($shopName);
        if ($shopUrl !== null) $seller->setShopUrl($shopUrl);
        if ($bannerUrl !== null) $seller->setBannerPic($bannerUrl);
        if ($logoUrl !== null) $seller->setLogoPic($logoUrl);
        if ($metaDescription !== null) $seller->setMetaDescription($metaDescription);
        if ($shippingPolicy !== null) $seller->setShippingPolicy($shippingPolicy);
        if ($returnPolicy !== null) $seller->setReturnPolicy($returnPolicy);
        if ($facebookUrl !== null) $seller->setFacebookId($facebookUrl);
        if ($twitterUrl !== null) $seller->setTwitterId($twitterUrl);
        if ($instagramUrl !== null) $seller->setInstagramId($instagramUrl);

        $seller->setUpdatedAt($this->dateTime->gmtDate());

        try {
            $seller->save();
        } catch (\Exception $e) {
            $this->logger->error('[Meeovi_MarketplaceApi] Failed to update shop profile', [
                'customerId' => $customerId,
                'error' => $e->getMessage(),
            ]);
            throw new CouldNotSaveException(__('Could not save your shop profile: %1', $e->getMessage()), $e);
        }

        return json_encode($this->sellerRowToProfile($seller), JSON_THROW_ON_ERROR);
    }

    public function getSellerProducts(int $customerId): string
    {
        $collection = $this->marketplaceProductCollectionFactory->create();
        $collection->addFieldToFilter('seller_id', $customerId);

        $rows = [];
        foreach ($collection as $mpProduct) {
            $productId = (int) $mpProduct->getMageproductId();

            try {
                $product = $this->productRepository->getById($productId);
            } catch (NoSuchEntityException $e) {
                // The marketplace_product linkage row outlived its catalog
                // product (deleted directly in the catalog) — skip rather
                // than surface a broken row.
                continue;
            }

            $stockQty = 0.0;
            try {
                $stockQty = (float) $this->stockRegistry->getStockItem($productId)->getQty();
            } catch (\Exception $e) {
                // Leave at 0 — a missing stock item isn't this endpoint's problem.
            }

            $rows[] = [
                'id' => $productId,
                'name' => (string) $product->getName(),
                'sku' => (string) $product->getSku(),
                'category' => '',
                'price' => (float) $product->getPrice(),
                'stock' => $stockQty,
                'status' => $this->mapProductStatus((int) $mpProduct->getStatus()),
                'updated' => (string) ($mpProduct->getUpdatedAt() ?: $mpProduct->getCreatedAt()),
            ];
        }

        return json_encode($rows, JSON_THROW_ON_ERROR);
    }

    public function getSellerOrders(int $customerId): string
    {
        $collection = $this->saleslistCollectionFactory->create();
        $collection->addFieldToFilter('seller_id', $customerId);

        $byOrderId = [];
        foreach ($collection as $saleRow) {
            $orderId = (int) $saleRow->getOrderId();
            $byOrderId[$orderId][] = $saleRow;
        }

        $rows = [];
        foreach ($byOrderId as $orderId => $saleRows) {
            try {
                $order = $this->orderRepository->get($orderId);
            } catch (\Exception $e) {
                continue; // Order was deleted/inaccessible — skip rather than error the whole list.
            }

            $sellerTotal = 0.0;
            foreach ($saleRows as $saleRow) {
                $sellerTotal += (float) $saleRow->getTotalAmount();
            }

            $customerName = trim((string) $order->getCustomerFirstname() . ' ' . (string) $order->getCustomerLastname());
            if ($customerName === '') {
                $customerName = (string) ($order->getCustomerEmail() ?: ('Customer #' . $order->getCustomerId()));
            }

            $rows[] = [
                'id' => '#' . $order->getIncrementId(),
                'customer' => $customerName,
                'items' => count($saleRows),
                'total' => $sellerTotal,
                'paymentStatus' => $this->mapPaymentStatus($order),
                'fulfillmentStatus' => $this->mapFulfillmentStatus((string) $order->getStatus()),
                'placed' => (string) $order->getCreatedAt(),
            ];
        }

        return json_encode($rows, JSON_THROW_ON_ERROR);
    }

    public function getSellerTransactions(int $customerId): string
    {
        $collection = $this->saleslistCollectionFactory->create();
        $collection->addFieldToFilter('seller_id', $customerId);

        $rows = [];
        foreach ($collection as $saleRow) {
            $saleAmount = (float) $saleRow->getTotalAmount();
            $commissionAmount = (float) $saleRow->getTotalCommission();
            // Webkul stores commission_rate as a percentage number (e.g.
            // "10" for 10%), not a 0-1 fraction — not independently
            // re-verified against live data (see this file's header).
            $commissionRate = ((float) $saleRow->getCommissionRate()) / 100;

            $rows[] = [
                'id' => (int) $saleRow->getId(),
                'order' => '#' . $saleRow->getMagerealorderId(),
                'product' => (string) $saleRow->getMageproName(),
                'saleAmount' => $saleAmount,
                'commissionRate' => $commissionRate,
                'commissionAmount' => $commissionAmount,
                'netEarning' => (float) $saleRow->getActualSellerAmount(),
                'date' => (string) $saleRow->getCreatedAt(),
            ];
        }

        return json_encode($rows, JSON_THROW_ON_ERROR);
    }

    public function getLowStockProducts(int $customerId): string
    {
        $threshold = self::DEFAULT_LOW_STOCK_THRESHOLD;
        $sellerRow = $this->loadSellerRow($customerId, false);
        if ($sellerRow !== null) {
            $sellerThreshold = (float) $sellerRow->getLowStockQuantity();
            if ($sellerThreshold > 0) {
                $threshold = $sellerThreshold;
            }
        }

        $collection = $this->marketplaceProductCollectionFactory->create();
        $collection->addFieldToFilter('seller_id', $customerId);

        $rows = [];
        foreach ($collection as $mpProduct) {
            $productId = (int) $mpProduct->getMageproductId();

            try {
                $product = $this->productRepository->getById($productId);
                $qty = (float) $this->stockRegistry->getStockItem($productId)->getQty();
            } catch (\Exception $e) {
                continue;
            }

            if ($qty > $threshold) {
                continue;
            }

            $rows[] = [
                'id' => $productId,
                'name' => (string) $product->getName(),
                'sku' => (string) $product->getSku(),
                'stock' => $qty,
                'threshold' => $threshold,
            ];
        }

        return json_encode($rows, JSON_THROW_ON_ERROR);
    }

    /**
     * @throws NoSuchEntityException when $required and no seller row exists.
     */
    private function loadSellerRow(int $customerId, bool $required = true): ?object
    {
        $collection = $this->sellerCollectionFactory->create();
        $collection->addFieldToFilter('seller_id', $customerId);

        foreach ($collection as $row) {
            return $row;
        }

        if ($required) {
            throw new NoSuchEntityException(__('You are not registered as a seller.'));
        }
        return null;
    }

    private function sellerRowToProfile(object $seller): array
    {
        return [
            'shopName' => (string) $seller->getShopTitle(),
            'shopUrl' => (string) $seller->getShopUrl(),
            'bannerUrl' => $seller->getBannerPic() ?: null,
            'logoUrl' => $seller->getLogoPic() ?: null,
            'metaDescription' => (string) $seller->getMetaDescription(),
            'shippingPolicy' => (string) $seller->getShippingPolicy(),
            'returnPolicy' => (string) $seller->getReturnPolicy(),
            'socialLinks' => array_filter([
                'facebook' => $seller->getFacebookId() ?: null,
                'twitter' => $seller->getTwitterId() ?: null,
                'instagram' => $seller->getInstagramId() ?: null,
            ]),
            'isApproved' => ((int) $seller->getIsSeller()) === MarketplaceProduct::STATUS_ENABLED,
        ];
    }

    private function mapProductStatus(int $status): string
    {
        return match ($status) {
            MarketplaceProduct::STATUS_ENABLED => 'active',
            MarketplaceProduct::STATUS_PENDING => 'draft',
            default => 'archived', // STATUS_DISABLED, STATUS_DENIED
        };
    }

    private function mapPaymentStatus(\Magento\Sales\Api\Data\OrderInterface $order): string
    {
        if (((float) $order->getTotalRefunded()) > 0) {
            return 'refunded';
        }
        $grandTotal = (float) $order->getGrandTotal();
        if ($grandTotal > 0 && ((float) $order->getTotalPaid()) >= $grandTotal) {
            return 'paid';
        }
        return 'pending';
    }

    private function mapFulfillmentStatus(string $magentoStatus): string
    {
        return match ($magentoStatus) {
            'complete', 'closed' => 'delivered',
            'processing' => 'processing',
            'pending', 'pending_payment', 'canceled', 'holded' => 'unfulfilled',
            default => 'processing',
        };
    }
}
