<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model;

use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Customer\Api\AddressRepositoryInterface;
use Magento\Customer\Api\CustomerRepositoryInterface;
use Magento\Customer\Api\Data\CustomerInterface;
use Magento\Framework\DB\TransactionFactory;
use Magento\Framework\Event\ManagerInterface as EventManager;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Lock\LockManagerInterface;
use Magento\Payment\Model\Method\AbstractMethod;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Api\Data\AddressInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\QuoteFactory;
use Magento\Quote\Model\QuoteManagement;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Model\Order;
use Magento\Sales\Model\Order\Invoice;
use Magento\Sales\Model\ResourceModel\Order\CollectionFactory as OrderCollectionFactory;
use Magento\Sales\Model\Service\InvoiceService;
use Magento\Store\Model\StoreManagerInterface;
use Meeovi\MarketplaceApi\Api\Data\ExternalOrderItemInterface;
use Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterface;
use Meeovi\MarketplaceApi\Api\Data\ExternalOrderResultInterfaceFactory;
use Meeovi\MarketplaceApi\Api\ExternalOrderManagementInterface;
use Meeovi\MarketplaceApi\Model\Payment\External;
use Psr\Log\LoggerInterface;

/**
 * See ExternalOrderManagementInterface.
 *
 * The order is built as a normal customer quote and placed the way
 * CartManagement::placeOrder() places one (submit() between the
 * `checkout_submit_before` and `checkout_submit_all_after` events) —
 * `checkout_submit_all_after` is the event Webkul_Marketplace records each
 * seller's sale on (Webkul\Marketplace\Observer\SalesOrderPlaceAfterObserver).
 * The offline invoice that follows fires `sales_order_invoice_save_after`,
 * Webkul's invoice/commission hook. Only virtual and downloadable products:
 * this flow has no shipping step.
 */
class ExternalOrderManagement implements ExternalOrderManagementInterface
{
    private const MAX_ITEMS = 50;
    private const MAX_QTY = 999.0;
    private const LOCK_TIMEOUT = 30;
    private const ORDERABLE_TYPES = ['virtual', 'downloadable'];

    public function __construct(
        private CustomerRepositoryInterface $customerRepository,
        private AddressRepositoryInterface $addressRepository,
        private ProductRepositoryInterface $productRepository,
        private StoreManagerInterface $storeManager,
        private QuoteFactory $quoteFactory,
        private CartRepositoryInterface $cartRepository,
        private QuoteManagement $quoteManagement,
        private EventManager $eventManager,
        private OrderRepositoryInterface $orderRepository,
        private OrderCollectionFactory $orderCollectionFactory,
        private InvoiceService $invoiceService,
        private TransactionFactory $transactionFactory,
        private LockManagerInterface $lockManager,
        private ExternalOrderResultInterfaceFactory $resultFactory,
        private LoggerInterface $logger
    ) {
    }

    /**
     * @inheritdoc
     */
    public function placeOrder(
        int $customerId,
        string $reference,
        array $items,
        float $amountPaid,
        string $currency,
        ?AddressInterface $billingAddress = null
    ): ExternalOrderResultInterface {
        $reference = trim($reference);
        if ($reference === '' || strlen($reference) > 100) {
            throw new LocalizedException(__('A payment reference (up to 100 characters) is required.'));
        }
        if (!$items || count($items) > self::MAX_ITEMS) {
            throw new LocalizedException(__('Send between 1 and %1 items.', self::MAX_ITEMS));
        }
        if ($amountPaid <= 0) {
            throw new LocalizedException(__('Only paid orders are recorded here.'));
        }

        // Webhook retries can arrive together: one placement per reference.
        $lock = 'meeovi_external_order_' . sha1($reference);
        if (!$this->lockManager->lock($lock, self::LOCK_TIMEOUT)) {
            throw new LocalizedException(__('This payment is already being recorded. Try again shortly.'));
        }
        try {
            $existing = $this->findByReference($reference);
            if ($existing !== null) {
                return $this->result($existing, false);
            }
            $order = $this->place($customerId, $reference, $items, $amountPaid, $currency, $billingAddress);
            return $this->result($order, true);
        } finally {
            $this->lockManager->unlock($lock);
        }
    }

    /**
     * @inheritdoc
     */
    public function getPurchasedSkus(int $customerId): array
    {
        $orders = $this->orderCollectionFactory->create();
        $orders->addFieldToFilter('customer_id', $customerId);
        $orders->addFieldToFilter('state', ['in' => [Order::STATE_PROCESSING, Order::STATE_COMPLETE]]);

        $skus = [];
        /** @var Order $order */
        foreach ($orders as $order) {
            foreach ($order->getAllVisibleItems() as $item) {
                if ((float) $item->getQtyInvoiced() - (float) $item->getQtyRefunded() > 0) {
                    $skus[(string) $item->getSku()] = true;
                }
            }
        }
        return array_keys($skus);
    }

    /**
     * @inheritdoc
     */
    public function getCustomerOrders(int $customerId, int $pageSize = 50, int $currentPage = 1): string
    {
        $orders = $this->orderCollectionFactory->create();
        $orders->addFieldToFilter('customer_id', $customerId);
        $orders->setOrder('created_at', 'DESC');
        $orders->setPageSize(max(1, min(100, $pageSize)));
        $orders->setCurPage(max(1, $currentPage));

        $rows = [];
        /** @var Order $order */
        foreach ($orders as $order) {
            $rows[] = $this->orderRow($order);
        }
        return json_encode($rows, JSON_THROW_ON_ERROR);
    }

    /**
     * @inheritdoc
     */
    public function getCustomerOrder(int $customerId, int $orderId): string
    {
        try {
            /** @var Order $order */
            $order = $this->orderRepository->get($orderId);
        } catch (NoSuchEntityException $e) {
            $order = null;
        }
        // Someone else's order is "not found", not "forbidden".
        if ($order === null || (int) $order->getCustomerId() !== $customerId) {
            throw new NoSuchEntityException(__('Order %1 not found.', $orderId));
        }
        return json_encode($this->orderRow($order), JSON_THROW_ON_ERROR);
    }

    /** An order as the app's order history shows it. */
    private function orderRow(Order $order): array
    {
        $items = [];
        foreach ($order->getAllVisibleItems() as $item) {
            $items[] = [
                'sku' => (string) $item->getSku(),
                'name' => (string) $item->getName(),
                'qty' => (float) $item->getQtyOrdered(),
                'price' => (float) $item->getPrice(),
                'rowTotal' => (float) $item->getRowTotal(),
            ];
        }
        $tracking = [];
        foreach ($order->getTracksCollection() as $track) {
            $tracking[] = [
                'number' => (string) $track->getTrackNumber(),
                'carrier' => (string) $track->getCarrierCode(),
                'title' => (string) $track->getTitle(),
            ];
        }
        return [
            'id' => (int) $order->getId(),
            'number' => (string) $order->getIncrementId(),
            'createdAt' => (string) $order->getCreatedAt(),
            'status' => (string) $order->getStatus(),
            'state' => (string) $order->getState(),
            'paymentStatus' => $this->paymentStatus($order),
            'currency' => (string) $order->getOrderCurrencyCode(),
            'grandTotal' => (float) $order->getGrandTotal(),
            'subtotal' => (float) $order->getSubtotal(),
            'taxAmount' => (float) $order->getTaxAmount(),
            'shippingAmount' => (float) $order->getShippingAmount(),
            'totalPaid' => (float) $order->getTotalPaid(),
            'totalRefunded' => (float) $order->getTotalRefunded(),
            'totalDue' => (float) $order->getTotalDue(),
            'customer' => [
                'firstname' => (string) $order->getCustomerFirstname(),
                'lastname' => (string) $order->getCustomerLastname(),
                'email' => (string) $order->getCustomerEmail(),
            ],
            'items' => $items,
            'tracking' => $tracking,
        ];
    }

    /** The app's payment statuses (pending, completed, refunded, cancelled, on-hold). */
    private function paymentStatus(Order $order): string
    {
        return match ((string) $order->getState()) {
            Order::STATE_CLOSED => 'refunded',
            Order::STATE_CANCELED => 'cancelled',
            Order::STATE_HOLDED => 'on-hold',
            Order::STATE_PROCESSING, Order::STATE_COMPLETE =>
                (float) $order->getTotalDue() > 0.0049 ? 'pending' : 'completed',
            default => 'pending',
        };
    }

    /**
     * @param ExternalOrderItemInterface[] $items
     */
    private function place(
        int $customerId,
        string $reference,
        array $items,
        float $amountPaid,
        string $currency,
        ?AddressInterface $billingAddress
    ): Order {
        try {
            $customer = $this->customerRepository->getById($customerId);
        } catch (NoSuchEntityException $e) {
            throw new LocalizedException(__('Customer %1 doesn\'t exist.', $customerId));
        }
        $store = $this->storeManager->getStore((int) $customer->getStoreId() ?: null);
        if (strtoupper(trim($currency)) !== strtoupper((string) $store->getBaseCurrencyCode())) {
            throw new LocalizedException(__('Paid in %1, but the store sells in %2.', $currency, $store->getBaseCurrencyCode()));
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

        $this->setBillingAddress($quote, $customer, $billingAddress);

        $quote->getPayment()->setQuote($quote);
        $quote->getPayment()->importData([
            'method' => External::CODE,
            'checks' => [AbstractMethod::CHECK_USE_INTERNAL, AbstractMethod::CHECK_USE_FOR_CURRENCY],
        ]);
        $quote->collectTotals();

        // PayPal charged what the app priced from this catalogue; if
        // Magento now says otherwise (price or tax changed), don't record
        // a sale at a price nobody paid.
        $total = (float) $quote->getBaseGrandTotal();
        if (abs($total - $amountPaid) > 0.009) {
            throw new LocalizedException(__('Magento\'s total %1 doesn\'t match the %2 paid.', $total, $amountPaid));
        }

        $this->cartRepository->save($quote);

        // What CartManagement::placeOrder() does for a customer cart, on this
        // quote object: placeOrder() reloads the quote, which would drop the
        // billing address's skip-validation flag (it isn't stored). The two
        // events are the ones Webkul and inventory listen to; Webkul credits
        // the seller from checkout_submit_all_after.
        $this->eventManager->dispatch('checkout_submit_before', ['quote' => $quote]);
        $placed = $this->quoteManagement->submit($quote);
        if (!$placed) {
            throw new LocalizedException(__('Magento could not place the order.'));
        }
        $this->eventManager->dispatch('checkout_submit_all_after', ['order' => $placed, 'quote' => $quote]);

        /** @var Order $order */
        $order = $this->orderRepository->get((int) $placed->getId());
        $order->setExtOrderId($reference);
        $order->addCommentToStatusHistory(__('Paid with PayPal in the Meeovi app (%1).', $reference));
        $this->orderRepository->save($order);
        $this->invoice($order, $reference);

        return $order;
    }

    /**
     * The customer's default billing address, or the one sent with the order.
     * Not validated: the app's payment provider has already taken the
     * payment, and for a card it only collects country and postcode, which
     * Magento's address rules (street, city, phone) would otherwise refuse.
     */
    private function setBillingAddress(Quote $quote, CustomerInterface $customer, ?AddressInterface $sent): void
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
        if ($sent === null) {
            throw new LocalizedException(__('Customer %1 has no billing address; send one with the order.', $customer->getId()));
        }
        $billing->addData(array_intersect_key($sent->getData(), array_flip([
            'firstname', 'lastname', 'company', 'street', 'city', 'region', 'region_id', 'region_code',
            'postcode', 'country_id', 'telephone',
        ])));
        $billing->setFirstname($billing->getFirstname() ?: $customer->getFirstname());
        $billing->setLastname($billing->getLastname() ?: $customer->getLastname());
        $billing->setEmail($customer->getEmail());
    }

    private function invoice(Order $order, string $reference): void
    {
        if (!$order->canInvoice()) {
            return;
        }
        try {
            $invoice = $this->invoiceService->prepareInvoice($order);
            $invoice->setRequestedCaptureCase(Invoice::CAPTURE_OFFLINE);
            $invoice->setTransactionId($reference);
            $invoice->register();
            $invoice->getOrder()->setIsInProcess(true);
            $this->transactionFactory->create()
                ->addObject($invoice)
                ->addObject($invoice->getOrder())
                ->save();
        } catch (\Throwable $e) {
            // The order is placed and paid; an admin can invoice it by hand.
            $this->logger->error('Meeovi external order: invoice failed', [
                'order' => $order->getIncrementId(),
                'reference' => $reference,
                'exception' => $e,
            ]);
        }
    }

    private function findByReference(string $reference): ?Order
    {
        $orders = $this->orderCollectionFactory->create();
        $orders->addFieldToFilter('ext_order_id', $reference);
        $orders->setPageSize(1);
        /** @var Order $order */
        $order = $orders->getFirstItem();
        return $order->getId() ? $order : null;
    }

    private function result(Order $order, bool $created): ExternalOrderResultInterface
    {
        return $this->resultFactory->create()
            ->setOrderId((int) $order->getId())
            ->setIncrementId((string) $order->getIncrementId())
            ->setCreated($created);
    }
}
