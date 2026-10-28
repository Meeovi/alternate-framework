<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Api\Data;

/**
 * A product anyone may download without buying it: priced 0, downloadable,
 * and its link set to Shareable by the seller.
 */
interface FreeDownloadInterface
{
    /**
     * Get the product SKU.
     *
     * @return string
     */
    public function getSku(): string;

    /**
     * Set the product SKU.
     *
     * @param string $sku
     * @return \Meeovi\MarketplaceApi\Api\Data\FreeDownloadInterface
     */
    public function setSku(string $sku): FreeDownloadInterface;

    /**
     * Get the link title.
     *
     * @return string
     */
    public function getTitle(): string;

    /**
     * Set the link title.
     *
     * @param string $title
     * @return \Meeovi\MarketplaceApi\Api\Data\FreeDownloadInterface
     */
    public function setTitle(string $title): FreeDownloadInterface;

    /**
     * Get the file URL.
     *
     * @return string
     */
    public function getUrl(): string;

    /**
     * Set the file URL.
     *
     * @param string $url
     * @return \Meeovi\MarketplaceApi\Api\Data\FreeDownloadInterface
     */
    public function setUrl(string $url): FreeDownloadInterface;
}
