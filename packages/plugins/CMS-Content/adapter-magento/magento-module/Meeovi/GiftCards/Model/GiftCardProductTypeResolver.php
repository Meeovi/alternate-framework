<?php
declare(strict_types=1);

namespace Meeovi\GiftCards\Model;

use Magento\Framework\GraphQl\Query\Resolver\TypeResolverInterface;

/**
 * Names Ecomteck's `giftcard` product type for GraphQL (same pattern as
 * Magento\DownloadableGraphQl\Model\DownloadableProductTypeResolver).
 */
class GiftCardProductTypeResolver implements TypeResolverInterface
{
    public function resolveType(array $data): string
    {
        return ($data['type_id'] ?? null) === 'giftcard' ? 'GiftCardProduct' : '';
    }
}
