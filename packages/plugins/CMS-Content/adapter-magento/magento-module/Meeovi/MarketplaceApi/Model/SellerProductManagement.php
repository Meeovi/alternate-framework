<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Catalog\Api\Data\ProductInterfaceFactory;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Catalog\Model\Product\Attribute\Source\Status as ProductStatus;
use Magento\Catalog\Model\Product\Visibility;
use Magento\CatalogInventory\Api\StockRegistryInterface;
use Magento\Eav\Model\Config as EavConfig;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Stdlib\DateTime\DateTime;
use Magento\Store\Model\ScopeInterface;
use Magento\Store\Model\StoreManagerInterface;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterfaceFactory;
use Meeovi\MarketplaceApi\Api\SellerProductManagementInterface;
use Psr\Log\LoggerInterface;
use Webkul\Marketplace\Model\Product as MarketplaceProduct;
use Webkul\Marketplace\Model\ProductFactory as MarketplaceProductFactory;
use Webkul\Marketplace\Model\ResourceModel\Seller\CollectionFactory as SellerCollectionFactory;

/**
 * Read directly against the real, installed Webkul_Marketplace source at
 * app/code/Webkul/Marketplace on 2026-09-12 (Webkul is closed-source and
 * doesn't publish this — this repo doesn't ship a copy of it, so this file
 * can't be re-diffed against it later; if the module gets upgraded, re-read
 * the files this comment cites before trusting this again):
 *
 *  - Model/Product.php + Api/Data/ProductInterface.php: confirms
 *    setMageproductId/setSellerId/setStatus/setIsApproved/
 *    setAdminPendingNotification/setCreatedAt on
 *    Webkul\Marketplace\Model\ProductFactory, table `marketplace_product`
 *    (Model/ResourceModel/Product.php's _init), PK `entity_id`.
 *  - Helper/Data::isSeller() takes NO arguments — it reads
 *    $httpContext->getValue('customer_id'), which Magento's HttpContext
 *    plugin only populates on a normal storefront request dispatch, NOT
 *    inside a webapi.xml REST service (that gets its identity from
 *    UserContextInterface instead). Calling isSeller() from here would
 *    silently check the wrong (empty) customer. assertIsApprovedSeller()
 *    below instead re-implements Helper::getSellerCollectionObj()'s own
 *    query directly (Model/ResourceModel/Seller/Collection filtered by
 *    seller_id/store_id, Model/Seller.php's getIsSeller()) against the
 *    $customerId this module actually received.
 *  - Controller/Product/SaveProduct.php's saveMaketplaceProductTable()
 *    (the method Webkul's own seller-panel "add product" flow calls) is
 *    the source for the setIsApproved()/setAdminPendingNotification()
 *    logic mirrored in linkProductToSeller() below, including the
 *    marketplace/product_settings/product_approval config path
 *    (etc/adminhtml/system.xml) gating auto-approval.
 */
class SellerProductManagement implements SellerProductManagementInterface
{
    private const SKU_PATTERN = '/^[A-Za-z0-9._-]{1,128}$/';
    private const MAX_PRICE = 1_000_000.0;
    private const MAX_QTY = 1_000_000.0;
    private const XML_PATH_PRODUCT_APPROVAL = 'marketplace/product_settings/product_approval';

    // Constructor property promotion only (no `readonly`) — keeps this
    // compatible with PHP 8.0 (Magento 2.4.4/2.4.5), not just 8.1+.
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private ProductInterfaceFactory $productFactory,
        private StockRegistryInterface $stockRegistry,
        private EavConfig $eavConfig,
        private StoreManagerInterface $storeManager,
        private ScopeConfigInterface $scopeConfig,
        private DateTime $dateTime,
        private SellerCollectionFactory $sellerCollectionFactory,
        private MarketplaceProductFactory $marketplaceProductFactory,
        private SellerProductResultInterfaceFactory $resultFactory,
        private LoggerInterface $logger
    ) {
    }

    public function createProduct(
        int $customerId,
        string $sku,
        string $name,
        float $price,
        string $description = '',
        string $shortDescription = '',
        float $qty = 0.0,
        ?float $weight = null,
        ?int $attributeSetId = null,
        array $websiteIds = [],
        array $categoryIds = []
    ): SellerProductResultInterface {
        $this->assertIsApprovedSeller($customerId);
        $this->validateInput($sku, $name, $price, $qty);
        $this->assertSkuAvailable($sku);

        $product = $this->buildProduct(
            $sku,
            $name,
            $price,
            $description,
            $shortDescription,
            $weight,
            $attributeSetId,
            $websiteIds,
            $categoryIds,
            $customerId
        );

        try {
            $product = $this->productRepository->save($product);
        } catch (\Exception $e) {
            $this->logger->error('[Meeovi_MarketplaceApi] Failed to save catalog product', [
                'sku' => $sku,
                'customerId' => $customerId,
                'error' => $e->getMessage(),
            ]);
            throw new CouldNotSaveException(__('Could not create the product: %1', $e->getMessage()), $e);
        }

        try {
            $this->setStock((int) $product->getId(), $sku, $qty);
        } catch (\Exception $e) {
            // Non-fatal: the product exists and is linkable, it just starts
            // out with whatever stock state Magento defaulted to.
            $this->logger->warning('[Meeovi_MarketplaceApi] Failed to set initial stock', [
                'sku' => $sku,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $marketplaceProductId = $this->linkProductToSeller((int) $product->getId(), $customerId);
        } catch (\Exception $e) {
            // Never leave an orphaned catalog product with no seller behind
            // it — Webkul's own seller-panel flow never produces that state
            // (catalog product + marketplace_product row are written
            // together), so this bridge shouldn't either.
            $this->logger->error('[Meeovi_MarketplaceApi] Seller linkage failed, rolling back product', [
                'sku' => $sku,
                'productId' => $product->getId(),
                'customerId' => $customerId,
                'error' => $e->getMessage(),
            ]);
            $this->rollbackProduct($sku);
            throw new CouldNotSaveException(
                __('Product could not be linked to your seller account: %1', $e->getMessage()),
                $e
            );
        }

        /** @var SellerProductResultInterface $result */
        $result = $this->resultFactory->create();
        return $result
            ->setProductId((int) $product->getId())
            ->setSku($sku)
            ->setMarketplaceProductId($marketplaceProductId);
    }

    /**
     * Re-implements Helper\Data::getSellerCollectionObj() + isSeller()'s own
     * query (marketplace_userdata filtered by seller_id, current store else
     * store_id=0, is_seller == 1) against the verified $customerId this
     * module received — NOT the helper's isSeller() itself, which reads a
     * request-scoped HttpContext value that a webapi.xml service never
     * populates (see this file's header comment).
     */
    private function assertIsApprovedSeller(int $customerId): void
    {
        $storeId = (int) $this->storeManager->getStore()->getId();

        $collection = $this->sellerCollectionFactory->create();
        $collection->addFieldToFilter('seller_id', $customerId);
        $collection->addFieldToFilter('store_id', $storeId);

        if (!$collection->getSize()) {
            $collection = $this->sellerCollectionFactory->create();
            $collection->addFieldToFilter('seller_id', $customerId);
            $collection->addFieldToFilter('store_id', 0);
        }

        $isSeller = false;
        foreach ($collection as $sellerRow) {
            if ((int) $sellerRow->getIsSeller() === 1) {
                $isSeller = true;
                break;
            }
        }

        if (!$isSeller) {
            throw new LocalizedException(
                __('Only approved sellers may create marketplace products.')
            );
        }
    }

    private function validateInput(string $sku, string $name, float $price, float $qty): void
    {
        if (!preg_match(self::SKU_PATTERN, $sku)) {
            throw new LocalizedException(__('Invalid SKU.'));
        }

        if (trim($name) === '') {
            throw new LocalizedException(__('Product name is required.'));
        }

        if ($price < 0 || $price > self::MAX_PRICE) {
            throw new LocalizedException(__('Price must be between 0 and %1.', self::MAX_PRICE));
        }

        if ($qty < 0 || $qty > self::MAX_QTY) {
            throw new LocalizedException(__('Quantity must be between 0 and %1.', self::MAX_QTY));
        }
    }

    private function assertSkuAvailable(string $sku): void
    {
        try {
            $this->productRepository->get($sku, false, null, true);
        } catch (NoSuchEntityException $e) {
            return; // Good — SKU is free.
        }

        throw new LocalizedException(__('A product with SKU "%1" already exists.', $sku));
    }

    private function buildProduct(
        string $sku,
        string $name,
        float $price,
        string $description,
        string $shortDescription,
        ?float $weight,
        ?int $attributeSetId,
        array $websiteIds,
        array $categoryIds,
        int $customerId
    ): ProductInterface {
        /** @var ProductInterface $product */
        $product = $this->productFactory->create();

        $product->setSku($sku);
        $product->setName($name);
        $product->setPrice($price);
        $product->setTypeId('simple');
        $product->setAttributeSetId($attributeSetId ?? $this->getDefaultAttributeSetId());
        $product->setStatus(ProductStatus::STATUS_ENABLED);
        $product->setVisibility(Visibility::VISIBILITY_BOTH);
        $product->setWebsiteIds($websiteIds !== [] ? $websiteIds : [(int) $this->storeManager->getWebsite()->getId()]);

        // Confirmed live: Controller/Product/SaveProduct.php sets this
        // directly on the core catalog product too (`$catalogProduct
        // ->setStatus($status)->setSellerId($sellerId)->save()`), separate
        // from the marketplace_product linkage row — Webkul apparently adds
        // `seller_id` as its own product EAV attribute for fast filtering.
        // Harmless no-op if that attribute isn't present on this install:
        // Magento's magic setData() just won't have anything to persist.
        $product->setData('seller_id', $customerId);

        if ($description !== '') {
            $product->setDescription($description);
        }
        if ($shortDescription !== '') {
            $product->setShortDescription($shortDescription);
        }
        if ($weight !== null) {
            $product->setWeight($weight);
        }
        if ($categoryIds !== []) {
            $product->setCategoryIds($categoryIds);
        }

        return $product;
    }

    private function getDefaultAttributeSetId(): int
    {
        return (int) $this->eavConfig->getEntityType('catalog_product')->getDefaultAttributeSetId();
    }

    private function setStock(int $productId, string $sku, float $qty): void
    {
        $stockItem = $this->stockRegistry->getStockItemBySku($sku);
        $stockItem->setProductId($productId);
        $stockItem->setQty($qty);
        $stockItem->setIsInStock($qty > 0);
        $stockItem->setManageStock(true);
        $this->stockRegistry->updateStockItemBySku($sku, $stockItem);
    }

    /**
     * Mirrors Controller/Product/SaveProduct.php::saveMaketplaceProductTable()
     * for the "new product, not an edit" branch: a fresh marketplace_product
     * row, admin-notified (setAdminPendingNotification(1)), auto-approved
     * only if marketplace/product_settings/product_approval is OFF in this
     * store's config (matches Webkul's own $helper->getIsProductApproval()
     * gate) — otherwise left pending admin review, same as a seller
     * submitting through Webkul's own seller panel would produce.
     */
    private function linkProductToSeller(int $productId, int $customerId): ?int
    {
        $requiresApproval = (bool) $this->scopeConfig->getValue(
            self::XML_PATH_PRODUCT_APPROVAL,
            ScopeInterface::SCOPE_STORE
        );
        $isApproved = $requiresApproval ? 0 : 1;
        $status = $requiresApproval ? MarketplaceProduct::STATUS_PENDING : MarketplaceProduct::STATUS_ENABLED;

        /** @var MarketplaceProduct $marketplaceProduct */
        $marketplaceProduct = $this->marketplaceProductFactory->create();
        $marketplaceProduct->setMageproductId($productId);
        $marketplaceProduct->setSellerId($customerId);
        $marketplaceProduct->setStatus($status);
        $marketplaceProduct->setIsApproved($isApproved);
        $marketplaceProduct->setAdminPendingNotification(1);
        $marketplaceProduct->setCreatedAt($this->dateTime->gmtDate());
        $marketplaceProduct->save();

        $id = $marketplaceProduct->getId();
        return $id === null ? null : (int) $id;
    }

    private function rollbackProduct(string $sku): void
    {
        try {
            $this->productRepository->deleteById($sku);
        } catch (\Exception $e) {
            $this->logger->error('[Meeovi_MarketplaceApi] Rollback of orphaned product failed — manual cleanup needed', [
                'sku' => $sku,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
