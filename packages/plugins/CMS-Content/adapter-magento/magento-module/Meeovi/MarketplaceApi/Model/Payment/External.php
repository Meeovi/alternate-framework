<?php
declare(strict_types=1);

namespace Meeovi\MarketplaceApi\Model\Payment;

use Magento\Payment\Model\Method\AbstractMethod;

/**
 * "Paid on Meeovi": the payment was taken by the Meeovi app's Stripe
 * checkout before the order reached Magento. Internal only — never offered
 * at the storefront checkout (a shopper could otherwise place unpaid
 * orders with it); ExternalOrderManagement is the only thing that uses it.
 */
class External extends AbstractMethod
{
    public const CODE = 'meeovi_external';

    /**
     * @var string
     */
    protected $_code = self::CODE;

    /**
     * @var bool
     */
    protected $_isOffline = true;

    /**
     * @var bool
     */
    protected $_canUseCheckout = false;

    /**
     * @var bool
     */
    protected $_canUseInternal = true;
}
