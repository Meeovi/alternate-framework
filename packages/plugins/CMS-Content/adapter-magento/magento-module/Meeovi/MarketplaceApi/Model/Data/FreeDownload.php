<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Data;

use Magento\Framework\DataObject;
use Meeovi\MarketplaceApi\Api\Data\FreeDownloadInterface;

class FreeDownload extends DataObject implements FreeDownloadInterface
{
    public function getSku(): string
    {
        return (string) $this->getData('sku');
    }

    public function setSku(string $sku): FreeDownloadInterface
    {
        return $this->setData('sku', $sku);
    }

    public function getTitle(): string
    {
        return (string) $this->getData('title');
    }

    public function setTitle(string $title): FreeDownloadInterface
    {
        return $this->setData('title', $title);
    }

    public function getUrl(): string
    {
        return (string) $this->getData('url');
    }

    public function setUrl(string $url): FreeDownloadInterface
    {
        return $this->setData('url', $url);
    }
}
