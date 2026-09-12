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
use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Store\Model\StoreManagerInterface;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterfaceFactory;
use Meeovi\MarketplaceApi\Api\SellerProductManagementInterface;
use Psr\Log\LoggerInterface;
use Webkul\Marketplace\Helper\Data as MarketplaceHelper;
use Webkul\Marketplace\Model\ProductFactory as MarketplaceProductFactory;

/**
 * =============================================================================
 * VERIFY BEFORE DEPLOYING — see this module's README.md.
 *
 * Every reference to Webkul\Marketplace\* below (class names, table/column
 * names, the isSeller() helper) matches the schema/API that is *by far* the
 * most commonly documented one for Webkul's Magento 2 "Multi Vendor
 * Marketplace" extension (mageproduct_id/seller_id on a marketplace_product
 * linkage table, a Helper\Data::isSeller() gate) — but that extension is
 * closed-source/paid, its exact internals were NOT independently re-verified
 * against your specific installed version while writing this file, and
 * Webkul's own public docs don't publish table/class names. If your version
 * differs, `bin/magento setup:di:compile` (or first use) will fail with a
 * clear "class/method not found" error naming exactly which assumption
 * below is wrong — check vendor/webkul/module-marketplace/{Model,Helper}
 * against this file's Webkul\Marketplace\* imports and the
 * linkProductToSeller()/assertIsApprovedSeller() methods below, and adjust.
 * =============================================================================
 */
class SellerProductManagement implements SellerProductManagementInterface
{
    private const SKU_PATTERN = '/^[A-Za-z0-9._-]{1,128}$/';
    private const MAX_PRICE = 1_000_000.0;
    private const MAX_QTY = 1_000_000.0;

    // Constructor property promotion only (no `readonly`) — keeps this
    // compatible with PHP 8.0 (Magento 2.4.4/2.4.5), not just 8.1+.
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private ProductInterfaceFactory $productFactory,
        private StockRegistryInterface $stockRegistry,
        private EavConfig $eavConfig,
        private StoreManagerInterface $storeManager,
        private MarketplaceHelper $marketplaceHelper,
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
            $categoryIds
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
            // out with whatever stock state Magento defaulted to. Surface it
            // in logs rather than rolling back a real product over this.
            $this->logger->warning('[Meeovi_MarketplaceApi] Failed to set initial stock', [
                'sku' => $sku,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $marketplaceProductId = $this->linkProductToSeller((int) $product->getId(), $customerId);
        } catch (\Exception $e) {
            // Never leave an orphaned catalog product with no seller behind
            // it — that's exactly the state Webkul's own seller-panel UI
            // never produces, so this bridge shouldn't either.
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
     * VERIFY: Helper\Data::isSeller() is the most commonly referenced gate
     * for "is this customer an approved Webkul seller" — if your installed
     * version names it differently, this is the one line to change.
     */
    private function assertIsApprovedSeller(int $customerId): void
    {
        $isSeller = false;

        try {
            $isSeller = (bool) $this->marketplaceHelper->isSeller($customerId);
        } catch (\Throwable $e) {
            $this->logger->error('[Meeovi_MarketplaceApi] Webkul\Marketplace\Helper\Data::isSeller() call failed — see this module\'s README', [
                'customerId' => $customerId,
                'error' => $e->getMessage(),
            ]);
            throw new LocalizedException(
                __('Seller verification is not available right now. Contact support.')
            );
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
        array $categoryIds
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
     * VERIFY: ProductFactory::create()->setMageproductId()->setSellerId()
     * ->save() against a `marketplace_product` table is the most commonly
     * referenced Webkul_Marketplace linkage pattern (see this file's header
     * comment). Confirm the real column names in
     * vendor/webkul/module-marketplace/etc/db_schema.xml (or
     * Setup/InstallSchema.php on an older version) before relying on this
     * in production, and adjust the setter calls below to match.
     *
     * @return int|null The linkage record's own id, if the model exposes one.
     */
    private function linkProductToSeller(int $productId, int $customerId): ?int
    {
        $marketplaceProduct = $this->marketplaceProductFactory->create();
        $marketplaceProduct->setMageproductId($productId);
        $marketplaceProduct->setSellerId($customerId);
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
