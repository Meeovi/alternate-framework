<?php
declare(strict_types=1);

namespace Meeovi\GiftCards\Model;

use Magento\Catalog\Model\Product\Attribute\Source\Status;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory as ProductCollectionFactory;
use Magento\Framework\App\ResourceConnection;
use Magento\Framework\Exception\InputException;
use Magento\Framework\Serialize\Serializer\Json;
use Meeovi\GiftCards\Api\Data\GiftCardInterface;
use Meeovi\GiftCards\Api\GiftCardReadInterface;
use Meeovi\GiftCards\Model\Data\GiftCardFactory;

/**
 * Reads Ecomteck's tables directly (read-only): gift card accounts
 * (`ecomteck_giftcardaccount`) and the codes each order line generated
 * (`giftcard_created_codes` in the line's product options).
 */
class GiftCardRead implements GiftCardReadInterface
{
    private const LIMIT = 200;

    /** Ecomteck\GiftCardAccount\Model\Giftcardaccount::STATE_* */
    private const STATES = [0 => 'available', 1 => 'used', 2 => 'redeemed', 3 => 'expired'];

    public function __construct(
        private readonly ResourceConnection $resource,
        private readonly ProductCollectionFactory $productCollectionFactory,
        private readonly GiftCardFactory $giftCardFactory,
        private readonly Json $json
    ) {
    }

    public function getProductSkus(): array
    {
        $collection = $this->productCollectionFactory->create()
            ->addAttributeToFilter('type_id', 'giftcard')
            ->addAttributeToFilter('status', Status::STATUS_ENABLED)
            ->setOrder('entity_id', 'DESC')
            ->setPageSize(self::LIMIT);
        return array_values(array_map(static fn ($product) => (string) $product->getSku(), $collection->getItems()));
    }

    public function getReceived(string $email): array
    {
        $email = strtolower(trim($email));
        if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InputException(__('A valid email address is required.'));
        }
        $connection = $this->resource->getConnection();
        $rows = $connection->fetchAll(
            $connection->select()
                ->from($this->resource->getTableName('ecomteck_giftcardaccount'))
                ->where('LOWER(giftcard_recipient_email) = ?', $email)
                ->where('status = ?', 1)
                ->order('date_created DESC')
                ->limit(self::LIMIT)
        );
        return array_map(fn (array $row) => $this->fromAccount($row), $rows);
    }

    public function getPurchased(int $customerId): array
    {
        if ($customerId <= 0) {
            return [];
        }
        $connection = $this->resource->getConnection();
        $lines = $connection->fetchAll(
            $connection->select()
                ->from(['item' => $this->resource->getTableName('sales_order_item')], ['name', 'sku', 'qty_ordered', 'product_options'])
                ->join(['o' => $this->resource->getTableName('sales_order')], 'o.entity_id = item.order_id', ['increment_id', 'created_at'])
                ->where('o.customer_id = ?', $customerId)
                ->where('item.product_type = ?', 'giftcard')
                ->where('item.parent_item_id IS NULL')
                ->order('o.created_at DESC')
                ->limit(self::LIMIT)
        );

        $codesByLine = [];
        $allCodes = [];
        foreach ($lines as $i => $line) {
            $options = $this->options($line['product_options'] ?? null);
            $lines[$i]['options'] = $options;
            $codes = array_values(array_filter((array) ($options['giftcard_created_codes'] ?? []), 'is_string'));
            $codesByLine[$i] = $codes;
            array_push($allCodes, ...$codes);
        }

        $accounts = [];
        if ($allCodes) {
            $rows = $connection->fetchAll(
                $connection->select()
                    ->from($this->resource->getTableName('ecomteck_giftcardaccount'))
                    ->where('code IN (?)', array_unique($allCodes))
            );
            foreach ($rows as $row) {
                $accounts[$row['code']] = $row;
            }
        }

        $cards = [];
        foreach ($lines as $i => $line) {
            $options = $line['options'];
            $fromLine = [
                'product_name' => $line['name'],
                'product_sku' => $line['sku'],
                'order_number' => $line['increment_id'],
                'message' => $options['giftcard_message'] ?? null,
                'recipient_name' => $options['giftcard_recipient_name'] ?? null,
                'recipient_email' => $options['giftcard_recipient_email'] ?? null,
                'sender_name' => $options['giftcard_sender_name'] ?? null,
                'sender_email' => $options['giftcard_sender_email'] ?? null,
            ];
            if (!$codesByLine[$i]) {
                $cards[] = $this->giftCardFactory->create(['data' => $fromLine + [
                    'state' => 'pending',
                    'enabled' => false,
                    'balance' => $options['giftcard_amount'] ?? null,
                    'created_at' => $line['created_at'],
                ]]);
                continue;
            }
            foreach ($codesByLine[$i] as $code) {
                $account = $accounts[$code] ?? null;
                $cards[] = $account
                    ? $this->fromAccount($account, array_filter($fromLine, static fn ($v) => $v !== null))
                    : $this->giftCardFactory->create(['data' => $fromLine + ['code' => $code, 'state' => 'pending', 'created_at' => $line['created_at']]]);
            }
        }
        return $cards;
    }

    private function fromAccount(array $row, array $extra = []): GiftCardInterface
    {
        return $this->giftCardFactory->create(['data' => $extra + [
            'code' => $row['code'],
            'state' => self::STATES[(int) $row['state']] ?? 'available',
            'enabled' => (int) $row['status'] === 1,
            'balance' => $row['balance'],
            'created_at' => $row['date_created'],
            'expires_at' => $row['date_expires'],
            'recipient_name' => $row['giftcard_recipient_name'],
            'recipient_email' => $row['giftcard_recipient_email'],
            'sender_name' => $row['giftcard_sender_name'],
            'sender_email' => $row['giftcard_sender_email'],
        ]]);
    }

    private function options(?string $raw): array
    {
        if ($raw === null || $raw === '') {
            return [];
        }
        try {
            $options = $this->json->unserialize($raw);
            return is_array($options) ? $options : [];
        } catch (\InvalidArgumentException) {
            return [];
        }
    }
}
