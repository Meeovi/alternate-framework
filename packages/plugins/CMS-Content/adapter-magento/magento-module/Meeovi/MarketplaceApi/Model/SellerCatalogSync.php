<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Catalog\Api\Data\ProductAttributeMediaGalleryEntryInterfaceFactory;
use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Catalog\Api\ProductAttributeMediaGalleryManagementInterface;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Catalog\Model\Product\Attribute\Source\Status as ProductStatus;
use Magento\CatalogInventory\Api\StockRegistryInterface;
use Magento\Downloadable\Api\Data\LinkInterfaceFactory;
use Magento\Downloadable\Api\LinkRepositoryInterface;
use Magento\Downloadable\Model\Link;
use Magento\Downloadable\Model\Product\Type as DownloadableType;
use Magento\Framework\Api\Data\ImageContentInterfaceFactory;
use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterface;
use Meeovi\MarketplaceApi\Api\Data\SellerProductResultInterfaceFactory;
use Meeovi\MarketplaceApi\Api\SellerCatalogSyncInterface;
use Meeovi\MarketplaceApi\Api\SellerProductManagementInterface;
use Psr\Log\LoggerInterface;
use Webkul\Marketplace\Model\ResourceModel\Product\CollectionFactory as MarketplaceProductCollectionFactory;

/**
 * See SellerCatalogSyncInterface. Creation goes through
 * SellerProductManagement::createProduct() — the same seller check,
 * validation and Webkul linkage as a seller creating a product themselves —
 * so this class only adds "update if it's already theirs", stock and images.
 */
class SellerCatalogSync implements SellerCatalogSyncInterface
{
    private const MAX_PRICE = 1_000_000.0;
    private const MAX_QTY = 1_000_000.0;
    private const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
    private const IMAGE_TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif'];

    public function __construct(
        private SellerProductManagementInterface $sellerProducts,
        private ProductRepositoryInterface $productRepository,
        private StockRegistryInterface $stockRegistry,
        private MarketplaceProductCollectionFactory $marketplaceProducts,
        private ProductAttributeMediaGalleryManagementInterface $gallery,
        private ProductAttributeMediaGalleryEntryInterfaceFactory $galleryEntryFactory,
        private ImageContentInterfaceFactory $imageContentFactory,
        private SellerProductResultInterfaceFactory $resultFactory,
        private LoggerInterface $logger,
        private LinkRepositoryInterface $links,
        private LinkInterfaceFactory $linkFactory
    ) {
    }

    /**
     * @inheritdoc
     */
    public function upsertProduct(
        int $customerId,
        string $sku,
        string $name,
        float $price,
        string $description = '',
        string $shortDescription = '',
        float $qty = 0.0,
        ?float $weight = null,
        array $categoryIds = [],
        bool $enabled = true
    ): SellerProductResultInterface {
        $existing = $this->findProduct($sku);
        if ($existing === null) {
            $result = $this->sellerProducts->createProduct(
                $customerId, $sku, $name, $price, $description, $shortDescription, $qty, $weight, null, [], $categoryIds
            );
            if (!$enabled) {
                $this->updateStock($customerId, $sku, $qty, null, false);
            }
            return $result;
        }

        $this->assertOwnedBy($existing, $customerId);
        $this->assertPriceAndQty($price, $qty);
        if (trim($name) === '') {
            throw new LocalizedException(__('Product name is required.'));
        }

        $existing->setName($name);
        $existing->setPrice($price);
        $existing->setStatus($enabled && $this->isApproved($existing) ? ProductStatus::STATUS_ENABLED : ProductStatus::STATUS_DISABLED);
        if ($description !== '') {
            $existing->setDescription($description);
        }
        if ($shortDescription !== '') {
            $existing->setShortDescription($shortDescription);
        }
        if ($weight !== null) {
            $existing->setWeight($weight);
        }
        if ($categoryIds !== []) {
            $existing->setCategoryIds($categoryIds);
        }

        try {
            $saved = $this->productRepository->save($existing);
        } catch (\Exception $e) {
            throw new CouldNotSaveException(__('Could not update the product: %1', $e->getMessage()), $e);
        }
        $this->setStock($sku, (int) $saved->getId(), $qty);

        /** @var SellerProductResultInterface $result */
        $result = $this->resultFactory->create();
        return $result->setProductId((int) $saved->getId())->setSku($sku)->setMarketplaceProductId(null);
    }

    /**
     * @inheritdoc
     */
    public function updateStock(int $customerId, string $sku, float $qty, ?float $price = null, ?bool $enabled = null): bool
    {
        $product = $this->findProduct($sku);
        if ($product === null) {
            throw new NoSuchEntityException(__('No product with SKU "%1".', $sku));
        }
        $this->assertOwnedBy($product, $customerId);
        $this->assertPriceAndQty($price ?? 0.0, $qty);

        if ($price !== null || $enabled !== null) {
            if ($price !== null) {
                $product->setPrice($price);
            }
            if ($enabled !== null) {
                $product->setStatus($enabled && $this->isApproved($product) ? ProductStatus::STATUS_ENABLED : ProductStatus::STATUS_DISABLED);
            }
            $this->productRepository->save($product);
        }
        $this->setStock($sku, (int) $product->getId(), $qty);
        return true;
    }

    /**
     * @inheritdoc
     */
    public function addImage(
        int $customerId,
        string $sku,
        string $base64Content,
        string $mimeType,
        string $fileName,
        bool $isMain = false
    ): bool {
        $product = $this->findProduct($sku);
        if ($product === null) {
            throw new NoSuchEntityException(__('No product with SKU "%1".', $sku));
        }
        $this->assertOwnedBy($product, $customerId);

        if (!isset(self::IMAGE_TYPES[$mimeType])) {
            throw new LocalizedException(__('Images must be JPEG, PNG or GIF.'));
        }
        $bytes = base64_decode($base64Content, true);
        if ($bytes === false || $bytes === '' || strlen($bytes) > self::MAX_IMAGE_BYTES) {
            throw new LocalizedException(__('The image is empty, invalid or larger than 8 MB.'));
        }
        // Trust the bytes, not the declared type.
        $info = @getimagesizefromstring($bytes);
        if ($info === false || ($info['mime'] ?? '') !== $mimeType) {
            throw new LocalizedException(__('The image content does not match its type.'));
        }

        $safeName = preg_replace('/[^A-Za-z0-9_-]/', '-', pathinfo($fileName, PATHINFO_FILENAME)) ?: 'image';
        $content = $this->imageContentFactory->create();
        $content->setBase64EncodedData($base64Content);
        $content->setType($mimeType);
        $content->setName(substr($safeName, 0, 64) . '.' . self::IMAGE_TYPES[$mimeType]);

        $entry = $this->galleryEntryFactory->create();
        $entry->setMediaType('image');
        $entry->setLabel($product->getName());
        $entry->setDisabled(false);
        $entry->setTypes($isMain ? ['image', 'small_image', 'thumbnail'] : []);
        $entry->setContent($content);

        try {
            $this->gallery->create($sku, $entry);
        } catch (\Exception $e) {
            $this->logger->warning('[Meeovi_MarketplaceApi] Image upload failed', ['sku' => $sku, 'error' => $e->getMessage()]);
            throw new CouldNotSaveException(__('Could not add the image: %1', $e->getMessage()), $e);
        }
        return true;
    }

    /**
     * @inheritdoc
     */
    public function setDownload(int $customerId, string $sku, string $title, string $url, bool $shareable = false): bool
    {
        $product = $this->findProduct($sku);
        if ($product === null) {
            throw new NoSuchEntityException(__('No product with SKU "%1".', $sku));
        }
        $this->assertOwnedBy($product, $customerId);

        $url = trim($url);
        if (strlen($url) > 2000 || parse_url($url, PHP_URL_SCHEME) !== 'https' || !parse_url($url, PHP_URL_HOST)) {
            throw new LocalizedException(__('The download must be an https URL.'));
        }
        $title = trim($title) !== '' ? trim($title) : (string) $product->getName();

        if ($product->getTypeId() !== DownloadableType::TYPE_DOWNLOADABLE) {
            $product->setTypeId(DownloadableType::TYPE_DOWNLOADABLE);
            $product->setData('links_purchased_separately', 0);
            $product->setData('links_title', __('Download')->render());
            $product->setData('product_has_weight', 0);
            $product->setWeight(null);
            try {
                $product = $this->productRepository->save($product);
            } catch (\Exception $e) {
                throw new CouldNotSaveException(__('Could not make the product downloadable: %1', $e->getMessage()), $e);
            }
        }

        foreach ($this->links->getList($sku) as $existing) {
            $this->links->delete((int) $existing->getId());
        }

        $link = $this->linkFactory->create();
        $link->setTitle(mb_substr($title, 0, 255));
        $link->setPrice(0);
        $link->setNumberOfDownloads(0);
        $link->setIsShareable($shareable ? Link::LINK_SHAREABLE_YES : Link::LINK_SHAREABLE_NO);
        $link->setLinkType('url');
        $link->setLinkUrl($url);
        $link->setSortOrder(1);
        try {
            // Rejects hosts outside the store's downloadable domains.
            $this->links->save($sku, $link);
        } catch (\Exception $e) {
            $this->logger->warning('[Meeovi_MarketplaceApi] Download link failed', ['sku' => $sku, 'error' => $e->getMessage()]);
            throw new CouldNotSaveException(__('Could not add the download: %1', $e->getMessage()), $e);
        }
        return true;
    }

    private function findProduct(string $sku): ?ProductInterface
    {
        try {
            return $this->productRepository->get($sku, true, 0, true);
        } catch (NoSuchEntityException $e) {
            return null;
        }
    }

    /**
     * The product must be linked to this seller in marketplace_product —
     * a sync can never overwrite another seller's (or the store's own) SKU.
     */
    private function assertOwnedBy(ProductInterface $product, int $customerId): void
    {
        $links = $this->marketplaceProducts->create();
        $links->addFieldToFilter('mageproduct_id', (int) $product->getId());
        $links->addFieldToFilter('seller_id', $customerId);
        if (!$links->getSize()) {
            throw new LocalizedException(__('SKU "%1" belongs to another seller or to the store.', $product->getSku()));
        }
    }

    /**
     * Whether the store has approved this seller product for sale. With
     * marketplace/product_settings/product_approval on, new seller
     * products wait for an admin; a sync must never switch one on first
     * (Webkul enables it when the admin approves).
     */
    private function isApproved(ProductInterface $product): bool
    {
        $links = $this->marketplaceProducts->create();
        $links->addFieldToFilter('mageproduct_id', (int) $product->getId());
        $links->addFieldToFilter('is_approved', 1);
        return (bool) $links->getSize();
    }

    private function assertPriceAndQty(float $price, float $qty): void
    {
        if ($price < 0 || $price > self::MAX_PRICE) {
            throw new LocalizedException(__('Price must be between 0 and %1.', self::MAX_PRICE));
        }
        if ($qty < 0 || $qty > self::MAX_QTY) {
            throw new LocalizedException(__('Quantity must be between 0 and %1.', self::MAX_QTY));
        }
    }

    private function setStock(string $sku, int $productId, float $qty): void
    {
        $stockItem = $this->stockRegistry->getStockItemBySku($sku);
        $stockItem->setProductId($productId);
        $stockItem->setQty($qty);
        $stockItem->setIsInStock($qty > 0);
        $stockItem->setManageStock(true);
        $this->stockRegistry->updateStockItemBySku($sku, $stockItem);
    }
}
