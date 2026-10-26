<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Customer\Api\AddressRepositoryInterface;
use Magento\Customer\Api\CustomerRepositoryInterface;
use Magento\Customer\Api\Data\CustomerInterface;
use Magento\Directory\Model\RegionFactory;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Payment\Model\Method\AbstractMethod;
use Magento\Quote\Api\Data\AddressInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\QuoteFactory;
use Magento\Store\Api\Data\StoreInterface;
use Magento\Store\Model\ScopeInterface;
use Magento\Store\Model\StoreManagerInterface;
use Meeovi\MarketplaceApi\Api\Data\ExternalOrderItemInterface;
use Meeovi\MarketplaceApi\Model\Payment\External;

/**
 * Builds the quote for an order paid in the Meeovi app. Shared by
 * ExternalOrderManagement (which places it) and TaxQuoteManagement (which
 * only reads its totals before payment), so the tax quoted before payment is
 * the tax the placed order gets.
 */
class ExternalQuoteBuilder
{
    public const MAX_ITEMS = 50;
    public const MAX_QTY = 999.0;
    private const ORDERABLE_TYPES = ['virtual', 'downloadable'];

    public function __construct(
        private CustomerRepositoryInterface $customerRepository,
        private AddressRepositoryInterface $addressRepository,
        private ProductRepositoryInterface $productRepository,
        private StoreManagerInterface $storeManager,
        private QuoteFactory $quoteFactory,
        private RegionFactory $regionFactory,
        private ScopeConfigInterface $scopeConfig
    ) {
    }

    /**
     * @throws LocalizedException
     */
    public function customer(int $customerId): CustomerInterface
    {
        try {
            return $this->customerRepository->getById($customerId);
        } catch (NoSuchEntityException $e) {
            throw new LocalizedException(__('Customer %1 doesn\'t exist.', $customerId));
        }
    }

    /**
     * The customer's store, refusing a currency it doesn't sell in.
     *
     * @throws LocalizedException
     */
    public function store(?CustomerInterface $customer, string $currency): StoreInterface
    {
        $store = $this->storeManager->getStore($customer ? ((int) $customer->getStoreId() ?: null) : null);
        if (strtoupper(trim($currency)) !== strtoupper((string) $store->getBaseCurrencyCode())) {
            throw new LocalizedException(__('Paid in %1, but the store sells in %2.', $currency, $store->getBaseCurrencyCode()));
        }
        return $store;
    }

    /**
     * A customer quote for the items, billed to the customer's address,
     * with totals (tax included) collected. Not saved.
     *
     * @param ExternalOrderItemInterface[] $items
     * @throws LocalizedException
     */
    public function build(CustomerInterface $customer, StoreInterface $store, array $items, ?AddressInterface $billingAddress): Quote
    {
        if (!$items || count($items) > self::MAX_ITEMS) {
            throw new LocalizedException(__('Send between 1 and %1 items.', self::MAX_ITEMS));
        }

        /** @var Quote $quote */
        $quote = $this->quoteFactory->create();
        $quote->setStore($store);
        $quote->setCurrency();
        $quote->assignCustomer($customer);

        foreach ($items as $item) {
            $sku = trim($item->getSku());
            $qty = $item->getQty();
            if ($sku === '' || $qty <= 0 || $qty > self::MAX_QTY) {
                throw new LocalizedException(__('Each item needs a SKU and a quantity between 1 and %1.', self::MAX_QTY));
            }
            try {
                $product = $this->productRepository->get($sku, false, (int) $store->getId(), true);
            } catch (NoSuchEntityException $e) {
                throw new LocalizedException(__('Product "%1" doesn\'t exist.', $sku));
            }
            if (!in_array($product->getTypeId(), self::ORDERABLE_TYPES, true)) {
                throw new LocalizedException(__('"%1" needs shipping; only virtual and downloadable products can be ordered this way.', $sku));
            }
            $added = $quote->addProduct($product, $qty);
            if (is_string($added)) {
                throw new LocalizedException(__('"%1": %2', $sku, $added));
            }
        }

        $this->setBillingAddress($quote, $customer, $billingAddress, $store);

        $quote->getPayment()->setQuote($quote);
        $quote->getPayment()->importData([
            'method' => External::CODE,
            'checks' => [AbstractMethod::CHECK_USE_INTERNAL, AbstractMethod::CHECK_USE_FOR_CURRENCY],
        ]);
        $quote->collectTotals();
        return $quote;
    }

    /**
     * The address tax is worked out from, as plain data: the one sent
     * with the order, else the customer's default billing address, else
     * the store's default tax destination.
     *
     * @return array{country_id: string, region_id: int|null, postcode: string|null}
     */
    public function taxDestination(?CustomerInterface $customer, ?AddressInterface $sent, StoreInterface $store): array
    {
        if ($sent !== null && $sent->getCountryId()) {
            return [
                'country_id' => (string) $sent->getCountryId(),
                'region_id' => $this->regionId($sent->getCountryId(), $sent->getRegionId(), $sent->getRegionCode()),
                'postcode' => $sent->getPostcode() ?: null,
            ];
        }
        $defaultId = $customer?->getDefaultBilling();
        if ($defaultId) {
            try {
                $address = $this->addressRepository->getById((int) $defaultId);
                return [
                    'country_id' => (string) $address->getCountryId(),
                    'region_id' => $address->getRegionId() ? (int) $address->getRegionId() : null,
                    'postcode' => $address->getPostcode() ?: null,
                ];
            } catch (NoSuchEntityException $e) {
                // fall through to the store default
            }
        }
        return $this->storeDefaultDestination($store);
    }

    /**
     * The customer's default billing address, else the one sent with the
     * order, else the store's default tax destination (a digital purchase
     * may come with no address at all). Not validated: the app's payment
     * provider has already taken the payment, and for a card it only
     * collects country and postcode, which Magento's address rules (street,
     * city, phone) would otherwise refuse.
     */
    private function setBillingAddress(Quote $quote, CustomerInterface $customer, ?AddressInterface $sent, StoreInterface $store): void
    {
        $billing = $quote->getBillingAddress();
        $billing->setShouldIgnoreValidation(true);
        $defaultId = $customer->getDefaultBilling();
        if ($defaultId) {
            try {
                $billing->importCustomerAddressData($this->addressRepository->getById((int) $defaultId));
                return;
            } catch (NoSuchEntityException $e) {
                // fall through to the address sent with the order
            }
        }
        if ($sent !== null && $sent->getCountryId()) {
            $billing->addData(array_intersect_key($sent->getData(), array_flip([
                'firstname', 'lastname', 'company', 'street', 'city', 'region', 'region_id', 'region_code',
                'postcode', 'country_id', 'telephone',
            ])));
            // Tax rates are keyed by region id; the app sends a region code.
            $regionId = $this->regionId($sent->getCountryId(), $sent->getRegionId(), $sent->getRegionCode());
            if ($regionId) {
                $billing->setRegionId($regionId);
            }
        } else {
            $billing->addData($this->storeDefaultDestination($store));
        }
        $billing->setFirstname($billing->getFirstname() ?: $customer->getFirstname());
        $billing->setLastname($billing->getLastname() ?: $customer->getLastname());
        $billing->setEmail($customer->getEmail());
    }

    private function regionId(?string $countryId, mixed $regionId, ?string $regionCode): ?int
    {
        if ($regionId) {
            return (int) $regionId;
        }
        if (!$countryId || !$regionCode) {
            return null;
        }
        // The app's checkout takes the state as typed: a code ("MI") or a name ("Michigan").
        $country = strtoupper($countryId);
        $region = $this->regionFactory->create()->loadByCode(strtoupper(trim($regionCode)), $country);
        if (!$region->getId()) {
            $region = $this->regionFactory->create()->loadByName(trim($regionCode), $country);
        }
        return $region->getId() ? (int) $region->getId() : null;
    }

    /**
     * @return array{country_id: string, region_id: int|null, postcode: string|null}
     */
    private function storeDefaultDestination(StoreInterface $store): array
    {
        $get = fn(string $path) => $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE, $store->getId());
        $postcode = (string) $get('tax/defaults/postcode');
        return [
            'country_id' => (string) ($get('tax/defaults/country') ?: 'US'),
            'region_id' => (int) $get('tax/defaults/region') ?: null,
            'postcode' => $postcode !== '' && $postcode !== '*' ? $postcode : null,
        ];
    }
}
