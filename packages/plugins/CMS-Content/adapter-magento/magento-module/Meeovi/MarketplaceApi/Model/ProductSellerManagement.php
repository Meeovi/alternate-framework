<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Catalog\Model\Product\Attribute\Source\Status as ProductStatus;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory as ProductCollectionFactory;
use Magento\Downloadable\Api\LinkRepositoryInterface;
use Magento\Downloadable\Model\Link;
use Magento\Downloadable\Model\Product\Type as DownloadableType;
use Meeovi\MarketplaceApi\Api\Data\FreeDownloadInterfaceFactory;
use Meeovi\MarketplaceApi\Api\Data\ProductSellerInterfaceFactory;
use Meeovi\MarketplaceApi\Api\ProductSellerManagementInterface;
use Webkul\Marketplace\Model\ResourceModel\Product\CollectionFactory as MarketplaceProductCollectionFactory;
use Webkul\Marketplace\Model\ResourceModel\Seller\CollectionFactory as SellerCollectionFactory;

/**
 * See ProductSellerManagementInterface. Reads Webkul's own linkage
 * (marketplace_product) and seller profile (marketplace_userdata, the
 * store-wide row) tables.
 */
class ProductSellerManagement implements ProductSellerManagementInterface
{
    private const MAX_SKUS = 100;

    public function __construct(
        private ProductCollectionFactory $productCollectionFactory,
        private MarketplaceProductCollectionFactory $marketplaceProducts,
        private SellerCollectionFactory $sellers,
        private ProductSellerInterfaceFactory $productSellerFactory,
        private LinkRepositoryInterface $links,
        private FreeDownloadInterfaceFactory $freeDownloadFactory
    ) {
    }

    /**
     * @inheritdoc
     */
    public function getProductSellers(array $skus): array
    {
        $skus = $this->cleanSkus($skus);
        if (!$skus) {
            return [];
        }

        $products = $this->productCollectionFactory->create();
        $products->addAttributeToFilter('sku', ['in' => $skus]);
        $skuById = [];
        foreach ($products as $product) {
            $skuById[(int) $product->getId()] = (string) $product->getSku();
        }
        if (!$skuById) {
            return [];
        }

        $links = $this->marketplaceProducts->create();
        $links->addFieldToFilter('mageproduct_id', ['in' => array_keys($skuById)]);
        $links->addFieldToFilter('is_approved', 1);
        $sellerByProduct = [];
        foreach ($links as $link) {
            $sellerByProduct[(int) $link->getMageproductId()] = (int) $link->getSellerId();
        }
        if (!$sellerByProduct) {
            return [];
        }

        $profiles = $this->sellers->create();
        $profiles->addFieldToFilter('seller_id', ['in' => array_values(array_unique($sellerByProduct))]);
        $profiles->addFieldToFilter('is_seller', 1);
        $profiles->addFieldToFilter('store_id', 0);
        $shops = [];
        foreach ($profiles as $profile) {
            $shops[(int) $profile->getSellerId()] = $profile;
        }

        $result = [];
        foreach ($sellerByProduct as $productId => $sellerId) {
            // Not an approved seller (any more): don't present them as one.
            if (!isset($shops[$sellerId])) {
                continue;
            }
            $result[] = $this->productSellerFactory->create()
                ->setSku($skuById[$productId])
                ->setSellerId($sellerId)
                ->setShopTitle($shops[$sellerId]->getShopTitle() ?: null)
                ->setShopUrl($shops[$sellerId]->getShopUrl() ?: null);
        }
        return $result;
    }

    /**
     * @inheritdoc
     */
    public function getFreeDownloads(array $skus): array
    {
        $skus = $this->cleanSkus($skus);
        if (!$skus) {
            return [];
        }

        $products = $this->productCollectionFactory->create();
        $products->addAttributeToSelect('price');
        $products->addAttributeToFilter('sku', ['in' => $skus]);
        $products->addAttributeToFilter('type_id', DownloadableType::TYPE_DOWNLOADABLE);
        $products->addAttributeToFilter('status', ProductStatus::STATUS_ENABLED);

        $result = [];
        foreach ($products as $product) {
            if ((float) $product->getPrice() > 0) {
                continue;
            }
            // The seller's explicit choice: a link set to Shareable (not
            // "use config"). A free downloadable that isn't shareable still
            // goes through checkout.
            foreach ($this->links->getLinksByProduct($product) as $link) {
                if ((int) $link->getIsShareable() !== Link::LINK_SHAREABLE_YES || $link->getLinkType() !== 'url' || !$link->getLinkUrl()) {
                    continue;
                }
                $result[] = $this->freeDownloadFactory->create()
                    ->setSku((string) $product->getSku())
                    ->setTitle((string) ($link->getTitle() ?: $product->getName()))
                    ->setUrl((string) $link->getLinkUrl());
                break;
            }
        }
        return $result;
    }

    /**
     * @param array $skus
     * @return string[]
     */
    private function cleanSkus(array $skus): array
    {
        return array_slice(array_values(array_unique(array_filter(array_map(
            static fn ($sku) => trim((string) $sku),
            $skus
        )))), 0, self::MAX_SKUS);
    }
}
