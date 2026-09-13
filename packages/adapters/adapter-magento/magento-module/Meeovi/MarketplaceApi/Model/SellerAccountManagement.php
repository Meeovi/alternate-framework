<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Framework\Stdlib\DateTime\DateTime;
use Magento\Store\Model\ScopeInterface;
use Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterface;
use Meeovi\MarketplaceApi\Api\Data\SellerRegistrationResultInterfaceFactory;
use Meeovi\MarketplaceApi\Api\SellerAccountManagementInterface;
use Psr\Log\LoggerInterface;
use Webkul\Marketplace\Model\SellerFactory;
use Webkul\Marketplace\Model\ResourceModel\Seller\CollectionFactory as SellerCollectionFactory;

/**
 * Mirrors Webkul\Marketplace\Controller\Account\BecomesellerPost's own
 * saveSellerData() (read on 2026-09-12/13 against the real installed
 * app/code/Webkul/Marketplace source — see SellerProductManagement.php's
 * header comment for the same caveat: Webkul is closed-source, this repo
 * doesn't vendor a copy, re-read that controller before trusting this again
 * if the module is ever upgraded):
 *
 *  - Looks up any existing marketplace_userdata row by seller_id (Magento's
 *    own customer entity id) via the Seller collection, exactly like
 *    isExistingShopUrl()/saveSellerData() do — `load(0)` on no match just
 *    yields a new, unsaved model, so this is a natural upsert.
 *  - is_seller is 1 (active) unless
 *    marketplace/general_settings/seller_approval is on for this store, in
 *    which case it's 0 (pending admin review) — Helper\Data::
 *    getIsPartnerApproval()'s exact config path, confirmed live: it reads
 *    0/off on this store today.
 *  - shop_url/seller_id/createdAt/adminNotification are set the same way
 *    the storefront controller sets them. No other marketplace_userdata
 *    column is touched — Webkul's own controller doesn't set
 *    allowed_categories/allowed_attributeset_ids either, despite those
 *    being NOT NULL text columns; confirmed live this doesn't error.
 */
class SellerAccountManagement implements SellerAccountManagementInterface
{
    private const XML_PATH_SELLER_APPROVAL = 'marketplace/general_settings/seller_approval';

    public function __construct(
        private SellerFactory $sellerFactory,
        private SellerCollectionFactory $sellerCollectionFactory,
        private ScopeConfigInterface $scopeConfig,
        private DateTime $dateTime,
        private SellerRegistrationResultInterfaceFactory $resultFactory,
        private LoggerInterface $logger
    ) {
    }

    public function registerSeller(int $customerId, ?string $shopUrl = null): SellerRegistrationResultInterface
    {
        $resolvedShopUrl = $shopUrl !== null && trim($shopUrl) !== ''
            ? $this->slugify($shopUrl)
            : $this->generateUniqueShopUrl($customerId);

        $isApproved = !$this->scopeConfig->getValue(self::XML_PATH_SELLER_APPROVAL, ScopeInterface::SCOPE_STORE);

        $autoId = 0;
        $existing = $this->sellerCollectionFactory->create();
        $existing->addFieldToFilter('seller_id', $customerId);
        foreach ($existing as $sellerRow) {
            $autoId = (int) $sellerRow->getId();
            break;
        }

        try {
            $seller = $this->sellerFactory->create()->load($autoId);
            $seller->setData('is_seller', $isApproved ? 1 : 0);
            $seller->setData('shop_url', $resolvedShopUrl);
            $seller->setData('seller_id', $customerId);
            $seller->setCreatedAt($this->dateTime->gmtDate());
            $seller->setAdminNotification(1);
            $seller->save();
        } catch (\Exception $e) {
            $this->logger->error('[Meeovi_MarketplaceApi] Failed to register seller', [
                'customerId' => $customerId,
                'error' => $e->getMessage(),
            ]);
            throw new CouldNotSaveException(__('Could not register your seller account: %1', $e->getMessage()), $e);
        }

        /** @var SellerRegistrationResultInterface $result */
        $result = $this->resultFactory->create();
        return $result
            ->setSellerRecordId((int) $seller->getId())
            ->setIsApproved($isApproved)
            ->setShopUrl($resolvedShopUrl);
    }

    private function slugify(string $value): string
    {
        $slug = strtolower(trim($value));
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
        return trim($slug, '-') ?: 'seller';
    }

    /**
     * Default shop URL when the caller doesn't supply one — "seller-<id>",
     * falling back to a short random suffix only in the (practically
     * impossible for a numeric customer id) case that slug is already taken
     * by a *different* seller, mirroring isExistingShopUrl()'s uniqueness
     * check.
     */
    private function generateUniqueShopUrl(int $customerId): string
    {
        $base = 'seller-' . $customerId;
        $collection = $this->sellerCollectionFactory->create();
        $collection->addFieldToFilter('shop_url', $base);
        foreach ($collection as $row) {
            if ((int) $row->getSellerId() !== $customerId) {
                return $base . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
            }
        }
        return $base;
    }
}
