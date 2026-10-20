<?php
declare(strict_types=1);

namespace Meeovi\GiftCards\Model\Resolver;

use Magento\Framework\App\ResourceConnection;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;

/**
 * GiftCardProduct.giftcard_amounts: the product's fixed amounts for the
 * current website (plus "all websites", website 0), lowest first.
 */
class Amounts implements ResolverInterface
{
    public function __construct(private readonly ResourceConnection $resource)
    {
    }

    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null)
    {
        $product = $value['model'] ?? null;
        $productId = $product ? (int) $product->getId() : (int) ($value['entity_id'] ?? 0);
        if (!$productId) {
            return [];
        }
        $websiteId = (int) $context->getExtensionAttributes()->getStore()->getWebsiteId();
        $connection = $this->resource->getConnection();
        $amounts = $connection->fetchCol(
            $connection->select()
                ->from($this->resource->getTableName('ecomteck_giftcard_amount'), ['value'])
                ->where('entity_id = ?', $productId)
                ->where('website_id IN (?)', [0, $websiteId])
                ->order('value ASC')
        );
        return array_values(array_unique(array_map('floatval', $amounts)));
    }
}
